import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createStory = mutation({
    args: {
        childId: v.id("children"),
        theme: v.string(),
        personalizationMode: v.string(),
        sourceMode: v.string(),
        customPromptText: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // TODO: Integrate with AI generation logic
        // For now, create a placeholder story
        const storyId = await ctx.db.insert("stories", {
            childId: args.childId,
            title: "A New Adventure", // Placeholder
            theme: args.theme,
            readingLevel: "emerging", // Should fetch from child profile
            createdAt: Date.now(),
            personalizationMode: args.personalizationMode,
            sourceMode: args.sourceMode,
            customPromptText: args.customPromptText,
        });
        return storyId;
    },
});

export const getStoriesForChild = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("stories")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .order("desc")
            .collect();
    },
});

export const getStory = query({
    args: { storyId: v.id("stories") },
    handler: async (ctx, args) => {
        const story = await ctx.db.get(args.storyId);
        if (!story) return null;
        const pages = await ctx.db
            .query("storyPages")
            .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
            .collect();
        return { ...story, pages };
    },
});
