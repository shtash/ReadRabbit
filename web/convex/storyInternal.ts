import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

// Internal mutation to save the generated story to the database
export const internalCreateStory = internalMutation({
    args: {
        childId: v.id("children"),
        title: v.string(),
        theme: v.string(),
        readingLevel: v.string(),
        personalizationMode: v.string(),
        sourceMode: v.string(),
        customPromptText: v.optional(v.string()),
        coverImageUrl: v.optional(v.string()), // Can be null initially
        pages: v.array(
            v.object({
                pageIndex: v.number(),
                text: v.string(),
                illustrationUrl: v.optional(v.string()),
                illustrationPrompt: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args): Promise<string> => {
        const storyId = await ctx.db.insert("stories", {
            childId: args.childId,
            title: args.title,
            theme: args.theme,
            readingLevel: args.readingLevel,
            createdAt: Date.now(),
            personalizationMode: args.personalizationMode,
            sourceMode: args.sourceMode,
            customPromptText: args.customPromptText,
            coverImageUrl: args.coverImageUrl,
        });

        for (const page of args.pages) {
            await ctx.db.insert("storyPages", {
                storyId,
                pageIndex: page.pageIndex,
                text: page.text,
                illustrationUrl: page.illustrationUrl,
                // We might want to store the prompt too if needed for debugging or regeneration
            });
        }

        return storyId;
    },
});

export const generateUploadUrl = internalMutation({
    args: {},
    handler: async (ctx): Promise<string> => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const updateStoryImage = internalMutation({
    args: {
        storyId: v.id("stories"),
        coverImageStorageId: v.optional(v.id("_storage")),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<void> => {
        if (args.coverImageUrl) {
            await ctx.db.patch(args.storyId, { coverImageUrl: args.coverImageUrl });
        }
    },
});

export const updateStoryImageWithStorageId = internalMutation({
    args: {
        storyId: v.id("stories"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args): Promise<void> => {
        console.log(`[updateStoryImageWithStorageId] Updating story ${args.storyId} with storageId ${args.storageId}`);
        const url = await ctx.storage.getUrl(args.storageId);
        if (url) {
            await ctx.db.patch(args.storyId, { coverImageUrl: url });
            console.log(`[updateStoryImageWithStorageId] Updated coverImageUrl: ${url}`);
        } else {
            console.error(`[updateStoryImageWithStorageId] Failed to get URL for storageId ${args.storageId}`);
        }
    },
});

export const getChildProfileInternal = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args): Promise<any> => {
        return await ctx.db.get(args.childId);
    },
});
