import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Manually create a user by email (for testing/migration)
 * Usage: npx convex run migrations:createUserByEmail '{"email":"your-email@example.com","name":"Your Name"}'
 */
export const createUserByEmail = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { email, name } = args;

        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .collect()
            .then((users) => users.find((u) => u.email === email));

        if (existing) {
            return {
                success: true,
                message: "User already exists",
                user: {
                    email: existing.email,
                    name: existing.name,
                    onboardingCompleted: existing.onboardingCompleted,
                },
            };
        }

        // Create the user with a dummy token (will be updated on first real login)
        const userId = await ctx.db.insert("users", {
            tokenIdentifier: `manual_${Date.now()}`,
            email: email,
            name: name ?? email.split("@")[0],
            createdAt: Date.now(),
            allowPersonalization: true,
            onboardingCompleted: false,
            isParentMode: true,
        });

        const newUser = await ctx.db.get(userId);

        return {
            success: true,
            message: "User created successfully",
            user: {
                email: newUser?.email,
                name: newUser?.name,
                onboardingCompleted: newUser?.onboardingCompleted,
            },
        };
    },
});

/**
 * Reset onboarding status for users
 * Usage: npx convex run migrations:resetOnboarding '{"email":"user@example.com"}'
 * Usage: npx convex run migrations:resetOnboarding '{"adminOnly":true}'
 */
export const resetOnboarding = mutation({
    args: {
        adminOnly: v.optional(v.boolean()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const adminOnly = args.adminOnly ?? false;
        const targetEmail = args.email;

        const allUsers = await ctx.db.query("users").collect();
        let usersToUpdate = allUsers;

        // Filter by email if provided
        if (targetEmail) {
            usersToUpdate = allUsers.filter((u) => u.email === targetEmail);
        }
        // Filter for admin only (first user)
        else if (adminOnly) {
            usersToUpdate = allUsers.slice(0, 1);
        }


        for (const user of usersToUpdate) {
            const updates: Partial<Doc<"users">> = {
                onboardingCompleted: false,
            };

            // Add allowPersonalization if missing
            if (user.allowPersonalization === undefined) {
                updates.allowPersonalization = true;
            }

            // Add isParentMode if missing (default to true for existing admins/parents)
            if (user.isParentMode === undefined) {
                updates.isParentMode = true;
            }

            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(user._id, updates);
            }
        }

        return {
            success: true,
            message: `Reset onboarding for ${usersToUpdate.length} user(s)`,
            count: usersToUpdate.length,
            emails: usersToUpdate.map((u) => u.email),
        };
    },
});

/**
 * Generic field reset migration
 * Usage: npx convex run migrations:resetField '{"field":"onboardingCompleted","value":false,"email":"user@example.com"}'
 */
export const resetField = mutation({
    args: {
        field: v.string(),
        value: v.any(),
        adminOnly: v.optional(v.boolean()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { field, value, adminOnly = false, email } = args;

        const allUsers = await ctx.db.query("users").collect();
        let usersToUpdate = allUsers;

        // Filter by email
        if (email) {
            usersToUpdate = allUsers.filter((u) => u.email === email);
        }
        // Filter for admin only (first user)
        else if (adminOnly) {
            usersToUpdate = allUsers.slice(0, 1);
        }

        for (const user of usersToUpdate) {
            await ctx.db.patch(user._id, {
                [field]: value,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        }

        return {
            success: true,
            message: `Reset field "${field}" to ${JSON.stringify(value)} for ${usersToUpdate.length} user(s)`,
            count: usersToUpdate.length,
            updatedEmails: usersToUpdate.map((u) => u.email),
        };
    },
});

/**
 * Add missing fields to existing users
 * Usage: npx convex run migrations:addMissingFields
 */
export const addMissingFields = mutation({
    args: {},
    handler: async (ctx) => {
        const allUsers = await ctx.db.query("users").collect();
        let updatedCount = 0;

        for (const user of allUsers) {
            const updates: Partial<Doc<"users">> = {};

            // Add onboardingCompleted if missing
            if (user.onboardingCompleted === undefined) {
                updates.onboardingCompleted = false;
            }

            // Add allowPersonalization if missing
            if (user.allowPersonalization === undefined) {
                updates.allowPersonalization = true;
            }

            // Add isParentMode if missing (default to true for existing admins/parents)
            if (user.isParentMode === undefined) {
                updates.isParentMode = true;
            }

            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(user._id, updates);
                updatedCount++;
            }
        }

        return {
            success: true,
            message: `Added missing fields to ${updatedCount} user(s)`,
            total: allUsers.length,
            updated: updatedCount,
        };
    },
});

/**
 * List all users (for debugging)
 * Usage: npx convex run migrations:listUsers
 */
export const listUsers = mutation({
    args: {},
    handler: async (ctx) => {
        const allUsers = await ctx.db.query("users").collect();

        return {
            count: allUsers.length,
            users: allUsers.map((u) => ({
                email: u.email,
                name: u.name,
                onboardingCompleted: u.onboardingCompleted ?? "MISSING",
                createdAt: new Date(u.createdAt).toISOString(),
            })),
        };
    },
});

/**
 * Backfill birthdate for children based on age
 * Usage: npx convex run migrations:backfillChildBirthdates
 */
export const backfillChildBirthdates = mutation({
    args: {},
    handler: async (ctx) => {
        const children = await ctx.db.query("children").collect();
        let updatedCount = 0;

        for (const child of children) {
            if (child.birthdate === undefined) {
                // Approximate birthdate from age
                // Current date - (age * 365.25 days)
                const ageInMs = child.age * 365.25 * 24 * 60 * 60 * 1000;
                const approximateBirthdate = Date.now() - ageInMs;

                await ctx.db.patch(child._id, {
                    birthdate: approximateBirthdate,
                });
                updatedCount++;
            }
        }

        return {
            success: true,
            message: `Backfilled birthdate for ${updatedCount} children`,
            total: children.length,
            updated: updatedCount,
        };
    },
});

/**
 * Delete all children (useful for clearing legacy data)
 * Usage: npx convex run migrations:deleteAllChildren
 */
export const deleteAllChildren = mutation({
    args: {},
    handler: async (ctx) => {
        const children = await ctx.db.query("children").collect();
        let deletedCount = 0;

        for (const child of children) {
            await ctx.db.delete(child._id);
            deletedCount++;
        }

        return {
            success: true,
            message: `Deleted ${deletedCount} children`,
            deletedCount,
        };
    },
});

