"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const { user } = useUser();
    const convexUser = useQuery(api.users.getCurrentUser);
    const router = useRouter();

    useEffect(() => {
        if (convexUser && !convexUser.isParentMode && convexUser.activeChildId) {
            router.push(`/profile/${convexUser.activeChildId}`);
        }
    }, [convexUser, router]);

    if (convexUser === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
            </div>
        );
    }

    if (convexUser === null) {
        return null; // Or redirect to sign-in
    }

    if (!convexUser.isParentMode && convexUser.activeChildId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-2xl font-bold text-primary animate-pulse">Redirecting to your profile...</div>
            </div>
        );
    }

    // If in Parent Mode, show a message or redirect to parent dashboard
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
            <h1 className="text-3xl font-bold text-foreground">Parent Mode Active</h1>
            <p className="text-muted-foreground">You are currently in Parent Mode.</p>
            <div className="flex gap-4">
                <Link href="/parent">
                    <button className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition-transform hover:scale-105">
                        Go to Parent Dashboard
                    </button>
                </Link>
                <Link href="/">
                    <button className="rounded-full border-2 border-primary bg-transparent px-6 py-3 font-bold text-primary transition-transform hover:scale-105">
                        Go Home
                    </button>
                </Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
                To view a child's profile, switch to their account using the menu in the top right.
            </p>
        </div>
    );
}
