import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";

export const getChildProfileInternal = internalQuery({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.childId);
    },
});

export const getCharactersInternal = internalQuery({
    args: { childId: v.id("children") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("characters")
            .withIndex("by_child", (q) => q.eq("childId", args.childId))
            .collect();
    },
});

export const internalCreateStory = internalMutation({
    args: {
        childId: v.id("children"),
        title: v.string(),
        theme: v.string(),
        readingLevel: v.string(),
        personalizationMode: v.string(),
        sourceMode: v.string(),
        customPromptText: v.optional(v.string()),
        coverImageUrl: v.optional(v.string()),
        characterIds: v.optional(v.array(v.id("characters"))),
        pages: v.array(
            v.object({
                pageIndex: v.number(),
                text: v.string(),
                illustrationUrl: v.optional(v.string()),
                illustrationPrompt: v.optional(v.string()),
            })
        ),
        quizQuestions: v.optional(v.array(
            v.object({
                question: v.string(),
                options: v.array(v.string()),
                correctAnswerIndex: v.number(),
            })
        )),
    },
    handler: async (ctx, args): Promise<Id<"stories">> => {
        const storyId = await ctx.db.insert("stories", {
            childId: args.childId,
            title: args.title,
            theme: args.theme,
            readingLevel: args.readingLevel,
            personalizationMode: args.personalizationMode,
            sourceMode: args.sourceMode,
            customPromptText: args.customPromptText,
            coverImageUrl: args.coverImageUrl,
            characterIds: args.characterIds,
            createdAt: Date.now(),
        });

        for (const page of args.pages) {
            await ctx.db.insert("storyPages", {
                storyId,
                pageIndex: page.pageIndex,
                text: page.text,
                illustrationUrl: page.illustrationUrl,
                illustrationPrompt: page.illustrationPrompt,
            });
        }

        // Save Quiz Questions if available
        if (args.quizQuestions && args.quizQuestions.length > 0) {
            await ctx.db.insert("quizzes", {
                storyId,
                createdAt: Date.now(),
                questions: args.quizQuestions.map((q, i) => {
                    const questionId = `q-${i}`;
                    return {
                        id: questionId,
                        questionType: "multiple-choice",
                        prompt: q.question,
                        options: q.options.map((opt, j) => ({
                            id: `opt-${i}-${j}`,
                            label: opt,
                        })),
                        correctOptionId: `opt-${i}-${q.correctAnswerIndex}`,
                    };
                }),
            });
        }

        return storyId;
    },
});

export const generateUploadUrl = internalMutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const updateStoryImageWithStorageId = internalMutation({
    args: {
        storyId: v.id("stories"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (imageUrl) {
            await ctx.db.patch(args.storyId, { coverImageUrl: imageUrl });
        }
    },
});

export const updateStoryImage = internalMutation({
    args: {
        storyId: v.id("stories"),
        coverImageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.storyId, { coverImageUrl: args.coverImageUrl });
    },
});
