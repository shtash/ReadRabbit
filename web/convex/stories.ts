import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { AIProviderFactory } from "./ai/factory";
import { Id } from "./_generated/dataModel";
import { appConfig } from "@readrabbit/config";

export const createStory = action({
    args: {
        childId: v.id("children"),
        theme: v.string(),
        personalizationMode: v.string(),
        sourceMode: v.string(),
        customPromptText: v.optional(v.string()),
        storyLength: v.optional(v.string()), // 'short', 'medium', 'long'
        characterIds: v.optional(v.array(v.id("characters"))),
        siblingIds: v.optional(v.array(v.id("children"))),
    },
    handler: async (ctx, args): Promise<string> => {
        // 1. Fetch child profile
        const child = await ctx.runQuery(internal.storyInternal.getChildProfileInternal, { childId: args.childId });

        if (!child) {
            throw new Error("Child not found");
        }

        // 2. Fetch Characters and Match
        const characters = await ctx.runQuery(internal.storyInternal.getCharactersInternal, { childId: args.childId });
        const matchedCharacterIds: Id<"characters">[] = [];
        let characterContext = "";

        // Add Child to Context if Personalization is Enabled
        if (args.personalizationMode === "include-child") {
            const age = child.age;
            let ageCategory = "child";
            if (age <= 2) ageCategory = "baby";
            else if (age <= 4) ageCategory = "toddler";
            else if (age <= 9) ageCategory = "young kid";
            else if (age <= 12) ageCategory = "preteen";
            else if (age <= 19) ageCategory = "teenager";

            characterContext += `${child.name} is a ${ageCategory} (the main character). `;
        }

        // Add Siblings to Context
        if (args.siblingIds && args.siblingIds.length > 0) {
            for (const siblingId of args.siblingIds) {
                const sibling = await ctx.runQuery(internal.storyInternal.getChildProfileInternal, { childId: siblingId });
                if (sibling) {
                    const age = sibling.age;
                    let ageCategory = "child";
                    if (age <= 2) ageCategory = "baby";
                    else if (age <= 4) ageCategory = "toddler";
                    else if (age <= 9) ageCategory = "young kid";
                    else if (age <= 12) ageCategory = "preteen";
                    else if (age <= 19) ageCategory = "teenager";

                    characterContext += `${sibling.name} is a ${ageCategory} (a sibling/friend). `;
                }
            }
        }

        // Strategy 1: Explicit Selection (Categories Mode)
        if (args.characterIds && args.characterIds.length > 0) {
            for (const charId of args.characterIds) {
                const char = characters.find(c => c._id === charId);
                if (char) {
                    matchedCharacterIds.push(char._id);

                    const age = char.birthYear ? new Date().getFullYear() - char.birthYear : null;
                    let ageCategory = "unknown age";

                    if (age !== null) {
                        if (age <= 2) ageCategory = "baby";
                        else if (age <= 4) ageCategory = "toddler";
                        else if (age <= 9) ageCategory = "young kid";
                        else if (age <= 12) ageCategory = "preteen";
                        else if (age <= 19) ageCategory = "teenager";
                        else if (age <= 39) ageCategory = "adult";
                        else if (age <= 59) ageCategory = "middle-aged adult";
                        else ageCategory = "senior";
                    }

                    characterContext += `${char.name} is a ${ageCategory} ${char.type}. `;
                }
            }
        }
        // Strategy 2: Text Matching (Custom Mode)
        else if (args.customPromptText) {
            const promptLower = args.customPromptText.toLowerCase();
            const usedNames = new Set<string>();

            // Shuffle characters to randomize selection if names are duplicated
            const shuffledCharacters = [...characters].sort(() => Math.random() - 0.5);

            for (const char of shuffledCharacters) {
                const nameLower = char.name.toLowerCase();
                if (promptLower.includes(nameLower) && !usedNames.has(nameLower)) {
                    matchedCharacterIds.push(char._id);
                    usedNames.add(nameLower);

                    const age = char.birthYear ? new Date().getFullYear() - char.birthYear : null;
                    let ageCategory = "unknown age";

                    if (age !== null) {
                        if (age <= 2) ageCategory = "baby";
                        else if (age <= 4) ageCategory = "toddler";
                        else if (age <= 9) ageCategory = "young kid";
                        else if (age <= 12) ageCategory = "preteen";
                        else if (age <= 19) ageCategory = "teenager";
                        else if (age <= 39) ageCategory = "adult";
                        else if (age <= 59) ageCategory = "middle-aged adult";
                        else ageCategory = "senior";
                    }

                    characterContext += `${char.name} is a ${ageCategory} ${char.type}. `;
                }
            }
        }

        // Calculate Word Count and Page Count
        const lengthKey = (args.storyLength || 'medium') as keyof typeof appConfig.storyLength.options;
        const lengthConfig = appConfig.storyLength.options[lengthKey] || appConfig.storyLength.options.medium;
        const pageCount = lengthConfig.pages;

        let wordsPerPage: number = appConfig.storyLength.wordsPerPage.youngKid; // Default
        const age = child.age;
        if (age <= 4) wordsPerPage = appConfig.storyLength.wordsPerPage.toddler;
        else if (age <= 8) wordsPerPage = appConfig.storyLength.wordsPerPage.youngKid;
        else if (age <= 12) wordsPerPage = appConfig.storyLength.wordsPerPage.preteen;
        else if (age >= 13) wordsPerPage = appConfig.storyLength.wordsPerPage.teenager;

        const totalWordCount = wordsPerPage * pageCount;

        // 3. Generate Story Text
        const storyGenerator = AIProviderFactory.getInstance().getStoryGenerator();

        let finalCustomPrompt = args.customPromptText;
        if (characterContext) {
            const basePrompt = args.customPromptText || "Write a story.";
            finalCustomPrompt = `${basePrompt}\n\nNote: The following characters are in this story: ${characterContext}`;
        }

        const generatedStory = await storyGenerator.generateStory({
            theme: args.theme,
            age: child.age,
            readingLevel: child.readingLevel,
            interests: child.interests,
            customPrompt: finalCustomPrompt,
            wordCount: totalWordCount,
            pageCount: pageCount,
        });

        // 4. Save to DB (Text Only first)
        const storyId = await ctx.runMutation(internal.storyInternal.internalCreateStory, {
            childId: args.childId,
            title: generatedStory.title,
            theme: args.theme,
            readingLevel: child.readingLevel,
            personalizationMode: args.personalizationMode,
            sourceMode: args.sourceMode,
            customPromptText: args.customPromptText,
            coverImageUrl: undefined, // No image yet
            characterIds: matchedCharacterIds.length > 0 ? matchedCharacterIds : undefined,
            pages: generatedStory.pages.map((p, i) => ({
                ...p,
                pageIndex: i,
                illustrationUrl: undefined, // No image yet
            })),
            quizQuestions: generatedStory.quizQuestions,
        });

        // 5. Schedule Background Image Generation
        await ctx.scheduler.runAfter(0, api.stories.generateStoryImages, {
            storyId,
            theme: args.theme,
            title: generatedStory.title,
            coverImagePrompt: generatedStory.coverImagePrompt,
            pages: generatedStory.pages.map(p => ({ illustrationPrompt: p.illustrationPrompt })),
            characterContext: characterContext || undefined,
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
        characterContext: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<void> => {
        console.log(`[generateStoryImages] Starting for storyId: ${args.storyId}`);
        const imageGenerator = AIProviderFactory.getInstance().getImageGenerator();

        // Helper to append character context
        const appendContext = (prompt: string) => {
            if (args.characterContext) {
                return `${prompt} Characters: ${args.characterContext}`;
            }
            return prompt;
        };

        // Generate Cover Image
        try {
            // Use the AI-generated prompt if available, otherwise fallback to the template
            let prompt = args.coverImagePrompt
                ? `${args.coverImagePrompt} Style: colorful, friendly, storybook illustration.`
                : `Cover image for a children's story titled "${args.title}". Theme: ${args.theme}. Style: colorful, friendly, storybook illustration.`;

            prompt = appendContext(prompt);

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
            // @ts-ignore
            if (e.message) console.error("Error message:", e.message);
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
