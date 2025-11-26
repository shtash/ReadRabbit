import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { AIProviderFactory } from "./ai/factory";

// Internal mutation to save the generated story to the database
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
    handler: async (ctx, args) => {
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

export const createStory = action({
    args: {
        childId: v.id("children"),
        theme: v.string(),
        personalizationMode: v.string(),
        sourceMode: v.string(),
        customPromptText: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Fetch child profile
        const child = await ctx.runQuery(internal.stories.getChildProfileInternal, { childId: args.childId });

        if (!child) {
            throw new Error("Child not found");
        }

        // 2. Generate Story Text
        const storyGenerator = AIProviderFactory.getInstance().getStoryGenerator();
        const generatedStory = await storyGenerator.generateStory({
            theme: args.theme,
            age: child.age,
            readingLevel: child.readingLevel,
            interests: child.interests,
            customPrompt: args.customPromptText,
        });

        // 3. Save to DB (Text Only first)
        const storyId = await ctx.runMutation(internal.stories.internalCreateStory, {
            childId: args.childId,
            title: generatedStory.title,
            theme: args.theme,
            readingLevel: child.readingLevel,
            personalizationMode: args.personalizationMode,
            sourceMode: args.sourceMode,
            customPromptText: args.customPromptText,
            coverImageUrl: undefined, // No image yet
            pages: generatedStory.pages.map((p, i) => ({
                ...p,
                pageIndex: i,
                illustrationUrl: undefined, // No image yet
            })),
        });

        // 4. Schedule Background Image Generation
        await ctx.scheduler.runAfter(0, internal.stories.generateStoryImages, {
            storyId,
            theme: args.theme,
            title: generatedStory.title,
            coverImagePrompt: (generatedStory as any).coverImagePrompt, // Cast to any or update type definition
            pages: generatedStory.pages.map(p => ({ illustrationPrompt: p.illustrationPrompt })),
        });

        return storyId;
    },
});

export const generateUploadUrl = internalMutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const updateStoryImage = internalMutation({
    args: {
        storyId: v.id("stories"),
        coverImageStorageId: v.optional(v.id("_storage")),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.coverImageUrl) {
            await ctx.db.patch(args.storyId, { coverImageUrl: args.coverImageUrl });
        }
    },
});

export const generateStoryImages = action({
    args: {
        storyId: v.id("stories"),
        theme: v.string(),
        title: v.string(),
        coverImagePrompt: v.optional(v.string()), // New argument
        pages: v.array(v.object({ illustrationPrompt: v.optional(v.string()) })),
    },
    handler: async (ctx, args) => {
        console.log(`[generateStoryImages] Starting for storyId: ${args.storyId}`);
        const imageGenerator = AIProviderFactory.getInstance().getImageGenerator();

        // Generate Cover Image
        try {
            // Use the AI-generated prompt if available, otherwise fallback to the template
            const prompt = args.coverImagePrompt
                ? `${args.coverImagePrompt} Style: colorful, friendly, storybook illustration.`
                : `Cover image for a children's story titled "${args.title}". Theme: ${args.theme}. Style: colorful, friendly, storybook illustration.`;

            console.log(`[generateStoryImages] Generating image with prompt: ${prompt}`);

            const base64Image = await imageGenerator.generateImage({
                prompt,
                aspectRatio: '1:1',
            });
            console.log(`[generateStoryImages] Image generated. Length: ${base64Image.length}`);

            // Upload to Convex Storage
            if (base64Image.startsWith("data:")) {
                console.log(`[generateStoryImages] Uploading to Convex Storage...`);
                const uploadUrl = await ctx.runMutation(internal.stories.generateUploadUrl);

                // Manual base64 to Blob conversion since fetch(data:...) is not supported
                const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
                if (!matches) {
                    throw new Error("Invalid data URL format");
                }
                const mimeType = matches[1];
                const base64Data = matches[2];

                const binaryString = atob(base64Data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: mimeType });

                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": blob.type },
                    body: blob,
                });

                if (!result.ok) {
                    throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
                }

                const { storageId } = await result.json();
                console.log(`[generateStoryImages] Upload successful. StorageId: ${storageId}`);

                await ctx.runMutation(internal.stories.updateStoryImageWithStorageId, {
                    storyId: args.storyId,
                    storageId,
                });
            } else {
                console.log(`[generateStoryImages] Using direct URL: ${base64Image}`);
                // Handle regular URL (e.g. placeholder)
                await ctx.runMutation(internal.stories.updateStoryImage, {
                    storyId: args.storyId,
                    coverImageUrl: base64Image,
                });
            }

        } catch (e) {
            console.error("[generateStoryImages] Failed to generate/upload cover image", e);
        }
    },
});

export const updateStoryImageWithStorageId = internalMutation({
    args: {
        storyId: v.id("stories"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
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

// Internal query to fetch child profile without auth checks (since action is already authenticated or trusted)
// Actually, actions run with the user's identity if called from client, but runQuery internal skips some checks?
// No, internal queries are just not exposed to the public API.
export const getChildProfileInternal = query({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.childId);
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

        const child = await ctx.db.get(story.childId);

        const pages = await ctx.db
            .query("storyPages")
            .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
            .collect();

        return {
            ...story,
            pages,
            childName: child?.name
        };
    },
});

export const testGeneration = action({
    args: {
        theme: v.string(),
    },
    handler: async (ctx, args) => {
        const storyGenerator = AIProviderFactory.getInstance().getStoryGenerator();
        const generatedStory = await storyGenerator.generateStory({
            theme: args.theme,
            age: 5,
            readingLevel: "emerging",
            interests: ["testing"],
        });
        return generatedStory;
    },
});
