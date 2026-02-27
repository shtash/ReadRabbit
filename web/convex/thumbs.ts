"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import sharp from "sharp";
import { appConfig } from "@readrabbit/config";

const { width: THUMB_WIDTH, jpegQuality: THUMB_QUALITY } =
    appConfig.imageOptimization.thumbnail;

export const generateThumbnail = internalAction({
    args: {
        storyId: v.id("stories"),
        sourceStorageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        console.log(`[thumbnail] thumbnail_generate_start storyId=${args.storyId}`);

        try {
            // 1. Resolve storage URL
            const sourceUrl = await ctx.runQuery(
                internal.thumbsMutations.getStorageUrl,
                { storageId: args.sourceStorageId }
            );
            if (!sourceUrl) {
                console.error(`[thumbnail] thumbnail_generate_fail storyId=${args.storyId} reason=source_url_missing`);
                return;
            }

            // 2. Fetch source image
            const response = await fetch(sourceUrl);
            if (!response.ok) {
                console.error(`[thumbnail] thumbnail_generate_fail storyId=${args.storyId} reason=fetch_failed status=${response.status}`);
                return;
            }
            const sourceBuffer = Buffer.from(await response.arrayBuffer());

            // 3. Resize to thumbnail JPEG
            const thumbnailBuffer = await sharp(sourceBuffer)
                .resize(THUMB_WIDTH, THUMB_WIDTH, { fit: "cover" })
                .jpeg({ quality: THUMB_QUALITY })
                .toBuffer();

            // 4. Upload thumbnail to Convex storage
            const uploadUrl = await ctx.runMutation(
                internal.storyInternal.generateUploadUrl
            );
            const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "image/jpeg" },
                body: new Blob([new Uint8Array(thumbnailBuffer)], { type: "image/jpeg" }),
            });
            if (!uploadResponse.ok) {
                console.error(`[thumbnail] thumbnail_generate_fail storyId=${args.storyId} reason=upload_failed status=${uploadResponse.status}`);
                return;
            }
            const { storageId: thumbnailStorageId } = await uploadResponse.json();

            // 5. Resolve thumbnail URL
            const thumbnailUrl = await ctx.runQuery(
                internal.thumbsMutations.getStorageUrl,
                { storageId: thumbnailStorageId }
            );
            if (!thumbnailUrl) {
                console.error(`[thumbnail] thumbnail_generate_fail storyId=${args.storyId} reason=thumbnail_url_missing`);
                return;
            }

            // 6. Patch story with thumbnail fields
            const patched = await ctx.runMutation(
                internal.thumbsMutations.patchStoryThumbnail,
                {
                    storyId: args.storyId,
                    coverThumbnailStorageId: thumbnailStorageId,
                    coverThumbnailUrl: thumbnailUrl,
                }
            );

            // 7. Handle deletion race: if story was deleted, clean up orphaned thumbnail
            if (!patched) {
                console.log(`[thumbnail] story deleted before patch, cleaning up orphaned thumbnail`);
                await ctx.runMutation(internal.thumbsMutations.deleteStorageFile, {
                    storageId: thumbnailStorageId,
                });
                return;
            }

            console.log(`[thumbnail] thumbnail_generate_success storyId=${args.storyId} size=${thumbnailBuffer.length}`);
        } catch (error) {
            console.error(`[thumbnail] thumbnail_generate_fail storyId=${args.storyId}`, error);
        }
    },
});

export const backfillStoryThumbnails = internalAction({
    args: {},
    handler: async (ctx) => {
        const BATCH_SIZE = 10;

        const stories = await ctx.runQuery(
            internal.thumbsMutations.getStoriesNeedingThumbnails,
            {}
        );

        if (stories.length === 0) {
            console.log(`[thumbnail_backfill] No stories need thumbnails. Done.`);
            return;
        }

        console.log(`[thumbnail_backfill] Processing batch of ${Math.min(BATCH_SIZE, stories.length)} / ${stories.length} remaining`);

        const batch = stories.slice(0, BATCH_SIZE);

        for (const story of batch) {
            try {
                if (!story.coverImageUrl) continue;

                // Download image from coverImageUrl (not storage — old stories may lack storageId)
                const response = await fetch(story.coverImageUrl);
                if (!response.ok) {
                    console.error(`[thumbnail_backfill] fetch failed for story=${story._id} status=${response.status}`);
                    continue;
                }
                const sourceBuffer = Buffer.from(await response.arrayBuffer());

                // Generate thumbnail
                const thumbnailBuffer = await sharp(sourceBuffer)
                    .resize(THUMB_WIDTH, THUMB_WIDTH, { fit: "cover" })
                    .jpeg({ quality: THUMB_QUALITY })
                    .toBuffer();

                // Upload
                const uploadUrl = await ctx.runMutation(
                    internal.storyInternal.generateUploadUrl
                );
                const uploadResponse = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": "image/jpeg" },
                    body: new Blob([new Uint8Array(thumbnailBuffer)], { type: "image/jpeg" }),
                });
                if (!uploadResponse.ok) {
                    console.error(`[thumbnail_backfill] upload failed for story=${story._id}`);
                    continue;
                }
                const { storageId: thumbnailStorageId } = await uploadResponse.json();

                // Resolve URL
                const thumbnailUrl = await ctx.runQuery(
                    internal.thumbsMutations.getStorageUrl,
                    { storageId: thumbnailStorageId }
                );
                if (!thumbnailUrl) continue;

                // Patch
                await ctx.runMutation(
                    internal.thumbsMutations.patchStoryThumbnail,
                    {
                        storyId: story._id,
                        coverThumbnailStorageId: thumbnailStorageId,
                        coverThumbnailUrl: thumbnailUrl,
                    }
                );

                console.log(`[thumbnail_backfill] success story=${story._id}`);
            } catch (error) {
                console.error(`[thumbnail_backfill] error story=${story._id}`, error);
            }
        }

        // Self-schedule if more remain
        if (stories.length > BATCH_SIZE) {
            console.log(`[thumbnail_backfill] Scheduling next batch...`);
            await ctx.scheduler.runAfter(1000, internal.thumbs.backfillStoryThumbnails, {});
        } else {
            console.log(`[thumbnail_backfill] All done.`);
        }
    },
});
