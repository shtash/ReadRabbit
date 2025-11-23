import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveChildPhotoProfile = mutation({
    args: {
        childId: v.id("children"),
        imageRefId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if exists, update or insert
        const existing = await ctx.db
            .query("childPhotoProfiles")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                imageRefId: args.imageRefId,
                updatedAt: Date.now(),
            });
            return existing._id;
        } else {
            const id = await ctx.db.insert("childPhotoProfiles", {
                childId: args.childId,
                imageRefId: args.imageRefId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            return id;
        }
    },
});

export const getChildPhotoProfile = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("childPhotoProfiles")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .unique();
    },
});
