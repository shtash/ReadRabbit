import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { AIProviderFactory } from "./ai/factory";

export const createStory = action({
    args: {
        childId: v.id("children"),
        theme: v.string(),
        personalizationMode: v.string(),
        sourceMode: v.string(),
        customPromptText: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string> => {
        // 1. Fetch child profile
        const child = await ctx.runQuery(internal.storyInternal.getChildProfileInternal, { childId: args.childId });

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
        const storyId = await ctx.runMutation(internal.storyInternal.internalCreateStory, {
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
            quizQuestions: generatedStory.quizQuestions,
        });

        // 4. Schedule Background Image Generation
        await ctx.scheduler.runAfter(0, api.stories.generateStoryImages, {
            storyId,
            theme: args.theme,
            title: generatedStory.title,
            coverImagePrompt: generatedStory.coverImagePrompt,
            pages: generatedStory.pages.map(p => ({ illustrationPrompt: p.illustrationPrompt })),
        });

        return storyId;
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
    handler: async (ctx, args): Promise<void> => {
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
                const uploadUrl = await ctx.runMutation(internal.storyInternal.generateUploadUrl);

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

                await ctx.runMutation(internal.storyInternal.updateStoryImageWithStorageId, {
                    storyId: args.storyId,
                    storageId,
                });
            } else {
                console.log(`[generateStoryImages] Using direct URL: ${base64Image}`);
                // Handle regular URL (e.g. placeholder)
                await ctx.runMutation(internal.storyInternal.updateStoryImage, {
                    storyId: args.storyId,
                    coverImageUrl: base64Image,
                });
            }

        } catch (e) {
            console.error("[generateStoryImages] Failed to generate/upload cover image", e);
        }
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

export const deleteStory = mutation({
    args: {
        storyId: v.id("stories"),
    },
    handler: async (ctx, args) => {
        // 1. Delete story pages
        const pages = await ctx.db
            .query("storyPages")
            .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
            .collect();

        for (const page of pages) {
            await ctx.db.delete(page._id);
        }

        // 2. Delete quizzes and quiz results
        const quizzes = await ctx.db
            .query("quizzes")
            .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
            .collect();

        for (const quiz of quizzes) {
            const quizResults = await ctx.db
                .query("quizResults")
                .filter((q) => q.eq(q.field("quizId"), quiz._id))
                .collect();

            for (const result of quizResults) {
                await ctx.db.delete(result._id);
            }

            await ctx.db.delete(quiz._id);
        }

        // 3. Delete reading sessions
        const sessions = await ctx.db
            .query("readingSessions")
            .withIndex("by_story", (q) => q.eq("storyId", args.storyId))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        // 4. Delete rewards linked to this story
        const rewards = await ctx.db
            .query("rewards")
            .filter((q) => q.eq(q.field("storyId"), args.storyId))
            .collect();

        for (const reward of rewards) {
            await ctx.db.delete(reward._id);
        }

        // 5. Finally, delete the story itself
        await ctx.db.delete(args.storyId);

        return { success: true, message: "Story and all related data deleted" };
    },
});

export const bulkDeleteStories = mutation({
    args: {
        storyIds: v.array(v.id("stories")),
    },
    handler: async (ctx, args) => {
        const results = [];

        for (const storyId of args.storyIds) {
            try {
                // Reuse the single delete logic
                await ctx.runMutation(api.stories.deleteStory, { storyId });
                results.push({ storyId, success: true });
            } catch (error) {
                results.push({
                    storyId,
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return {
            total: args.storyIds.length,
            successful: successCount,
            failed: failCount,
            results
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
