import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCharacter = mutation({
    args: {
        childId: v.id("children"),
        type: v.string(),
        name: v.string(),
        age: v.optional(v.number()),
        gender: v.optional(v.string()),
        avatarImageUrl: v.optional(v.string()),
        photoRefId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const characterId = await ctx.db.insert("characters", {
            childId: args.childId,
            type: args.type,
            name: args.name,
            age: args.age,
            gender: args.gender,
            avatarImageUrl: args.avatarImageUrl,
            photoRefId: args.photoRefId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        return characterId;
    },
});

export const getCharactersForChild = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("characters")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();
    },
});
