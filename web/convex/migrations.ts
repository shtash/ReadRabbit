import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
            await ctx.db.patch(user._id, {
                onboardingCompleted: false,
            });
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
