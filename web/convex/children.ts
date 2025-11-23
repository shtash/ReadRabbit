import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChild = mutation({
    args: {
        name: v.string(),
        age: v.number(),
        readingLevel: v.string(),
        interests: v.array(v.string()),
        avatarId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) {
            // Auto-create user if not exists (or handle error)
            // For now, assume user exists or create one
            // In a real app, we might want a separate createUser flow or do it here
            throw new Error("User not found");
        }

        const childId = await ctx.db.insert("children", {
            parentId: user._id,
            name: args.name,
            age: args.age,
            readingLevel: args.readingLevel,
            interests: args.interests,
            avatarId: args.avatarId,
            createdAt: Date.now(),
        });

        return childId;
    },
});

export const getChildren = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) {
            return [];
        }

        return await ctx.db
            .query("children")
            .withIndex("by_parent", (q) => q.eq("parentId", user._id))
            .collect();
    },
});
