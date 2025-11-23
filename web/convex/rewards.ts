import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createReward = mutation({
    args: {
        childId: v.id("children"),
        storyId: v.optional(v.id("stories")),
        type: v.string(),
        imageUrl: v.optional(v.string()),
        label: v.string(),
    },
    handler: async (ctx, args) => {
        const rewardId = await ctx.db.insert("rewards", {
            childId: args.childId,
            storyId: args.storyId,
            type: args.type,
            imageUrl: args.imageUrl,
            label: args.label,
            createdAt: Date.now(),
        });
        return rewardId;
    },
});

export const getRewardsForChild = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("rewards")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();
    },
});
