import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users (Parents) - synced from Clerk
    users: defineTable({
        tokenIdentifier: v.string(), // Clerk ID
        email: v.string(),
        name: v.optional(v.string()),
        createdAt: v.number(),
        // Settings
        allowPersonalization: v.boolean(),
        onboardingCompleted: v.boolean(),
    }).index("by_token", ["tokenIdentifier"]),

    // Children profiles
    children: defineTable({
        parentId: v.id("users"),
        name: v.string(),
        age: v.number(), // e.g. 5
        readingLevel: v.string(), // 'starter' | 'emerging' | 'independent'
        interests: v.array(v.string()),
        avatarId: v.string(), // ID of the selected avatar
        createdAt: v.number(),
    }).index("by_parent", ["parentId"]),

    // Child Photo Profiles (for personalization)
    childPhotoProfiles: defineTable({
        childId: v.id("children"),
        imageRefId: v.string(), // Nano Banana reference
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_child", ["childId"]),

    // Characters (Family, Pets, Friends)
    characters: defineTable({
        childId: v.id("children"),
        type: v.string(), // 'self' | 'family' | 'pet' | 'friend' | 'other'
        name: v.string(),
        age: v.optional(v.number()),
        gender: v.optional(v.string()),
        avatarImageUrl: v.optional(v.string()),
        photoRefId: v.optional(v.string()), // for personalization
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_child", ["childId"]),

    // Stories
    stories: defineTable({
        childId: v.id("children"),
        title: v.string(),
        theme: v.string(), // 'animals', 'space', etc.
        readingLevel: v.string(),
        createdAt: v.number(),
        coverImageUrl: v.optional(v.string()),
        personalizationMode: v.string(), // 'none' | 'include-child'
        customPromptText: v.optional(v.string()), // for custom mode
        sourceMode: v.string(), // 'auto' | 'category' | 'custom'
    }).index("by_child", ["childId"]),

    // Story Pages
    storyPages: defineTable({
        storyId: v.id("stories"),
        pageIndex: v.number(),
        text: v.string(),
        audioUrl: v.optional(v.string()),
        illustrationUrl: v.optional(v.string()),
    }).index("by_story", ["storyId"]),

    // Quizzes
    quizzes: defineTable({
        storyId: v.id("stories"),
        questions: v.array(
            v.object({
                id: v.string(),
                questionType: v.string(), // 'multiple-choice' | 'picture-choice'
                prompt: v.string(),
                options: v.array(
                    v.object({
                        id: v.string(),
                        label: v.string(),
                        imageUrl: v.optional(v.string()),
                    })
                ),
                correctOptionId: v.string(),
            })
        ),
        createdAt: v.number(),
    }).index("by_story", ["storyId"]),

    // Quiz Results / Progress
    quizResults: defineTable({
        childId: v.id("children"),
        storyId: v.id("stories"),
        quizId: v.id("quizzes"),
        score: v.number(),
        maxScore: v.number(),
        completedAt: v.number(),
    }).index("by_child", ["childId"]),

    // Rewards
    rewards: defineTable({
        childId: v.id("children"),
        storyId: v.optional(v.id("stories")),
        type: v.string(), // 'badge', 'image', 'carrot'
        imageUrl: v.optional(v.string()),
        label: v.string(),
        createdAt: v.number(),
    }).index("by_child", ["childId"]),
});
