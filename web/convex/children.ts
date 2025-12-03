import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
    // Generate a short-lived upload URL
    return await ctx.storage.generateUploadUrl();
});

export const createChild = mutation({
    args: {
        name: v.string(),
        gender: v.optional(v.string()),
        birthdate: v.number(),
        readingLevel: v.string(),
        interests: v.array(v.string()),
        avatarId: v.string(),
        originalImageStorageId: v.optional(v.id("_storage")),
        faceImageStorageId: v.optional(v.id("_storage")),
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

        // Calculate age from birthdate
        const age = Math.floor((Date.now() - args.birthdate) / (365.25 * 24 * 60 * 60 * 1000));

        const childId = await ctx.db.insert("children", {
            parentId: user._id,
            name: args.name,
            gender: args.gender,
            birthdate: args.birthdate,
            age: age,
            readingLevel: args.readingLevel,
            interests: args.interests,
            avatarId: args.avatarId,
            originalImageStorageId: args.originalImageStorageId,
            faceImageStorageId: args.faceImageStorageId,
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

export const getChildrenWithPhotos = query({
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

        const children = await ctx.db
            .query("children")
            .withIndex("by_parent", (q) => q.eq("parentId", user._id))
            .collect();

        // Add photo URLs
        return await Promise.all(
            children.map(async (child) => {
                let faceImageUrl = null;
                if (child.faceImageStorageId) {
                    faceImageUrl = await ctx.storage.getUrl(child.faceImageStorageId);
                }
                return {
                    ...child,
                    faceImageUrl,
                };
            })
        );
    },
});

export const getChild = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) {
            return null;
        }

        const child = await ctx.db.get(args.childId);
        if (!child || child.parentId !== user._id) {
            return null;
        }

        // Add photo URLs
        let faceImageUrl = null;
        let originalImageUrl = null;
        if (child.faceImageStorageId) {
            faceImageUrl = await ctx.storage.getUrl(child.faceImageStorageId);
        }
        if (child.originalImageStorageId) {
            originalImageUrl = await ctx.storage.getUrl(child.originalImageStorageId);
        }

        return {
            ...child,
            faceImageUrl,
            originalImageUrl,
        };
    },
});

export const updateChild = mutation({
    args: {
        childId: v.id("children"),
        name: v.optional(v.string()),
        gender: v.optional(v.string()),
        birthdate: v.optional(v.number()),
        readingLevel: v.optional(v.string()),
        interests: v.optional(v.array(v.string())),
        originalImageStorageId: v.optional(v.id("_storage")),
        faceImageStorageId: v.optional(v.id("_storage")),
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
            throw new Error("User not found");
        }

        const child = await ctx.db.get(args.childId);
        if (!child || child.parentId !== user._id) {
            throw new Error("Child not found or unauthorized");
        }

        const updates: Partial<Doc<"children">> = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.gender !== undefined) updates.gender = args.gender;
        if (args.birthdate !== undefined) {
            updates.birthdate = args.birthdate;
            // Recalculate age
            updates.age = Math.floor((Date.now() - args.birthdate) / (365.25 * 24 * 60 * 60 * 1000));
        }
        if (args.readingLevel !== undefined) updates.readingLevel = args.readingLevel;
        if (args.interests !== undefined) updates.interests = args.interests;
        if (args.originalImageStorageId !== undefined) updates.originalImageStorageId = args.originalImageStorageId;
        if (args.faceImageStorageId !== undefined) updates.faceImageStorageId = args.faceImageStorageId;

        await ctx.db.patch(args.childId, updates);
        return args.childId;
    },
});

export const deleteChild = mutation({
    args: { childId: v.id("children") },
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
            throw new Error("User not found");
        }

        const child = await ctx.db.get(args.childId);
        if (!child || child.parentId !== user._id) {
            throw new Error("Child not found or unauthorized");
        }

        // Delete the child record
        await ctx.db.delete(args.childId);

        // Note: Storage files are not deleted here as they may be referenced elsewhere
        // In a production app, you might want to implement cleanup logic

        return { success: true };
    },
});


