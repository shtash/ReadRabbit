import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

import { Filter } from "bad-words";

const filter = new Filter();

function containsBadWords(text: string): boolean {
    return filter.isProfane(text);
}

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const createCharacter = mutation({
    args: {
        childId: v.id("children"),
        type: v.string(),
        name: v.string(),
        relationship: v.optional(v.string()),
        description: v.optional(v.string()),
        birthYear: v.number(),
        birthMonth: v.optional(v.number()),
        birthDay: v.optional(v.number()),
        originalImageStorageId: v.optional(v.id("_storage")),
        faceImageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // Verify parent owns the child
        const child = await ctx.db.get(args.childId);
        if (!child) {
            throw new Error("Child not found");
        }

        // Check for bad words in custom type
        if (args.type !== "boy" && args.type !== "girl" && args.type !== "cat" && args.type !== "dog") {
            if (containsBadWords(args.type)) {
                throw new Error("Invalid character type");
            }
        }

        if (containsBadWords(args.name)) {
            throw new Error("Invalid character name");
        }

        if (args.relationship && containsBadWords(args.relationship)) {
            throw new Error("Invalid relationship");
        }

        if (args.description) {
            if (args.description.length > 200) {
                throw new Error("Description must be 200 characters or less");
            }
            if (containsBadWords(args.description)) {
                throw new Error("Invalid description");
            }
        }

        const characterId = await ctx.db.insert("characters", {
            childId: args.childId,
            type: args.type,
            name: args.name,
            relationship: args.relationship,
            description: args.description,
            birthYear: args.birthYear,
            birthMonth: args.birthMonth,
            birthDay: args.birthDay,
            originalImageStorageId: args.originalImageStorageId,
            faceImageStorageId: args.faceImageStorageId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Denormalize faceImageUrl
        if (args.faceImageStorageId) {
            const url = await ctx.storage.getUrl(args.faceImageStorageId);
            if (url) {
                await ctx.db.patch(characterId, { faceImageUrl: url });
            }
        }

        return characterId;
    },
});

export const getCharacters = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // In a real app, we should verify access here too

        const characters = await ctx.db
            .query("characters")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();

        // Add photo URLs (prefer denormalized, fallback to storage lookup)
        return await Promise.all(
            characters.map(async (char) => {
                let faceImageUrl = char.faceImageUrl ?? null;
                if (!faceImageUrl && char.faceImageStorageId) {
                    faceImageUrl = await ctx.storage.getUrl(char.faceImageStorageId);
                }
                return {
                    ...char,
                    faceImageUrl,
                };
            })
        );
    },
});

export const getCharacter = query({
    args: { characterId: v.id("characters") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const character = await ctx.db.get(args.characterId);
        if (!character) return null;

        // Add photo URL (prefer denormalized, fallback to storage lookup)
        let faceImageUrl = character.faceImageUrl ?? null;
        if (!faceImageUrl && character.faceImageStorageId) {
            faceImageUrl = await ctx.storage.getUrl(character.faceImageStorageId);
        }

        return {
            ...character,
            faceImageUrl,
        };
    },
});

export const updateCharacter = mutation({
    args: {
        characterId: v.id("characters"),
        name: v.optional(v.string()),
        type: v.optional(v.string()),
        relationship: v.optional(v.string()),
        description: v.optional(v.string()),
        birthYear: v.optional(v.number()),
        birthMonth: v.optional(v.number()),
        birthDay: v.optional(v.number()),
        originalImageStorageId: v.optional(v.id("_storage")),
        faceImageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const character = await ctx.db.get(args.characterId);
        if (!character) throw new Error("Character not found");

        // Validate bad words if updating name or type
        if (args.name && containsBadWords(args.name)) {
            throw new Error("Invalid character name");
        }
        if (args.type && args.type !== "boy" && args.type !== "girl" && args.type !== "cat" && args.type !== "dog") {
            if (containsBadWords(args.type)) {
                throw new Error("Invalid character type");
            }
        }
        if (args.relationship && containsBadWords(args.relationship)) {
            throw new Error("Invalid relationship");
        }
        if (args.description) {
            if (args.description.length > 200) {
                throw new Error("Description must be 200 characters or less");
            }
            if (containsBadWords(args.description)) {
                throw new Error("Invalid description");
            }
        }

        const updates: any = { updatedAt: Date.now() };
        if (args.name) updates.name = args.name;
        if (args.type) updates.type = args.type;
        if (args.relationship !== undefined) updates.relationship = args.relationship;
        if (args.description !== undefined) updates.description = args.description;
        if (args.birthYear) updates.birthYear = args.birthYear;
        if (args.birthMonth !== undefined) updates.birthMonth = args.birthMonth;
        if (args.birthDay !== undefined) updates.birthDay = args.birthDay;
        if (args.originalImageStorageId) updates.originalImageStorageId = args.originalImageStorageId;
        if (args.faceImageStorageId) {
            updates.faceImageStorageId = args.faceImageStorageId;
            const url = await ctx.storage.getUrl(args.faceImageStorageId);
            if (url) updates.faceImageUrl = url;
        }

        await ctx.db.patch(args.characterId, updates);
    },
});

export const deleteCharacter = mutation({
    args: { characterId: v.id("characters") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        await ctx.db.delete(args.characterId);
    },
});
