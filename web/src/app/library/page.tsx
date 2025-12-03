"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { StoryCard } from "@/components/ui/story-card";
import { BookOpen } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { appConfig } from "@readrabbit/config";

export default function LibraryPage() {
    const router = useRouter();
    const convexUser = useQuery(api.users.getCurrentUser);
    const stories = useQuery(
        api.stories.getStoriesForChild,
        convexUser?.activeChildId ? { childId: convexUser.activeChildId } : "skip"
    );

    const handleStoryClick = (storyId: string) => {
        router.push(`/read/${storyId}`);
    };

    if (convexUser === undefined || stories === undefined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading library...</p>
            </div>
        );
    }

    // Sort stories by most recent
    const sortedStories = stories ? [...stories].sort((a, b) => b.createdAt - a.createdAt) : [];

    return (
        <div className={`${appConfig.layout.workspaceContainer} pb-24`}>
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    My Library
                </h1>
                <p className="text-muted-foreground font-medium">
                    Your collection of tales.
                </p>
            </header>

            <main className="flex flex-col gap-8 px-6">
                {/* All Stories */}
                {sortedStories.length > 0 ? (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary">
                            <BookOpen className="h-5 w-5" />
                            <h2 className="text-xl font-bold text-foreground">All Stories</h2>
                            <span className="text-sm font-medium text-muted-foreground">
                                ({sortedStories.length})
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {sortedStories.map((story) => (
                                <StoryCard
                                    key={story._id}
                                    title={story.title}
                                    category={story.theme}
                                    imageUrl={story.coverImageUrl}
                                    onClick={() => handleStoryClick(story._id)}
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="flex flex-col items-center justify-center gap-6 py-16">
                        <div className="rounded-full bg-muted p-8">
                            <BookOpen className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-foreground mb-2">No stories yet!</h2>
                            <p className="text-muted-foreground mb-6">
                                Create your first story to get started.
                            </p>
                            <button
                                onClick={() => router.push("/")}
                                className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Create a Story
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
