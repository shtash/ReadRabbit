import { v } from "convex/values";
import { query } from "./_generated/server";

export const getChildProgress = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        const storiesRead = await ctx.db
            .query("stories")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();

        const quizzesTaken = await ctx.db
            .query("quizResults")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();

        const rewardsEarned = await ctx.db
            .query("rewards")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();

        return {
            storiesReadCount: storiesRead.length,
            quizzesTakenCount: quizzesTaken.length,
            rewardsEarnedCount: rewardsEarned.length,
        };
    },
});
