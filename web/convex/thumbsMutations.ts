import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getStorageUrl = internalQuery({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

export const patchStoryThumbnail = internalMutation({
    args: {
        storyId: v.id("stories"),
        coverThumbnailStorageId: v.id("_storage"),
        coverThumbnailUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const story = await ctx.db.get(args.storyId);
        if (!story) {
            return false;
        }
        await ctx.db.patch(args.storyId, {
            coverThumbnailStorageId: args.coverThumbnailStorageId,
            coverThumbnailUrl: args.coverThumbnailUrl,
        });
        return true;
    },
});

export const deleteStorageFile = internalMutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        await ctx.storage.delete(args.storageId);
    },
});

export const getStoriesNeedingThumbnails = internalQuery({
    args: { cursor: v.optional(v.string()) },
    handler: async (ctx) => {
        const stories = await ctx.db.query("stories").collect();
        return stories.filter(
            (s) => s.coverImageUrl && !s.coverThumbnailUrl
        );
    },
});
