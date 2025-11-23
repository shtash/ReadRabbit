"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileSelection() {
    const { user } = useUser();
    const children = useQuery(api.children.getChildren);
    const router = useRouter();

    if (children === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-2xl font-bold text-primary animate-pulse">Loading profiles...</div>
            </div>
        );
    }

    if (children.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
                <h1 className="text-3xl font-bold text-foreground">No profiles found!</h1>
                <p className="text-muted-foreground">Ask your grown-up to create a profile for you.</p>
                <Link href="/parent">
                    <button className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition-transform hover:scale-105">
                        Go to Parent Dashboard
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-foreground">Who is reading today?</h1>
            </header>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {children.map((child) => (
                    <div
                        key={child._id}
                        onClick={() => router.push(`/read?childId=${child._id}`)}
                        className="cursor-pointer group relative flex flex-col items-center gap-4 rounded-3xl bg-card p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:ring-4 hover:ring-primary/50"
                    >
                        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary bg-muted">
                            {/* Placeholder Avatar - In real app, map avatarId to actual image */}
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child.avatarId}`}
                                alt={child.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground group-hover:text-primary">
                            {child.name}
                        </h2>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link href="/parent" className="text-muted-foreground hover:text-primary hover:underline">
                    Parent Dashboard
                </Link>
            </div>
        </div>
    );
}
