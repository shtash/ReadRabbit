"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default function StoryPage() {
    const params = useParams();
    const storyId = params.storyId as Id<"stories">;
    const [currentPage, setCurrentPage] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const router = useRouter();
    const story = useQuery(api.stories.getStory, { storyId });

    // Mock pages if story is loading or empty (for now, until AI is real)
    const storyPages = story?.pages || [
        {
            text: "Loading your story...",
            illustrationUrl: "https://placehold.co/600x400/gray/white?text=Loading...",
        }
    ];

    const isLastPage = currentPage === (storyPages.length || 1) - 1;

    const handleNext = () => {
        if (isLastPage) {
            setShowReward(true);
        } else {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (showReward) {
            setShowReward(false);
        } else if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleFinish = () => {
        router.push(`/read/${storyId}/quiz`);
    };

    if (!story) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    // Handle case where pages might be undefined if story structure changed
    const pages = story.pages || [];
    if (pages.length === 0) {
        return <div className="flex min-h-screen items-center justify-center">Story has no pages!</div>;
    }

    if (showReward) {
        return (
            <div className="mx-auto flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold text-primary">
                        Great Job{story.childName ? `, ${story.childName}` : ""}!
                    </h1>
                    <p className="text-xl text-muted-foreground">You finished the story!</p>
                </div>

                <div className="mb-8 aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-muted shadow-2xl relative">
                    {story.coverImageUrl ? (
                        <img
                            src={story.coverImageUrl}
                            alt="Reward"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-muted/50">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="animate-pulse text-sm font-medium text-muted-foreground">
                                Painting your reward...
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleFinish}
                    className="flex h-16 w-full max-w-md items-center justify-center gap-2 rounded-full bg-green-500 text-xl font-bold text-white shadow-xl transition-all hover:bg-green-600 active:scale-95"
                >
                    <span>Take Quiz</span>
                    <Check className="h-6 w-6" />
                </button>
            </div>
        );
    }

    const currentPageData = pages[currentPage];

    return (
        <div className="mx-auto min-h-screen w-full bg-background font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-8 pb-4">
                <Link
                    href={`/read?childId=${story.childId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div className="text-sm font-bold text-muted-foreground">
                    Page {currentPage + 1} of {pages.length}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* Content - Text Only */}
            <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
                <div className="w-full rounded-3xl bg-card p-8 shadow-sm dark:bg-card/50 md:p-12">
                    <p className="text-2xl font-medium leading-relaxed text-foreground md:text-4xl md:leading-loose">
                        {currentPageData.text}
                    </p>
                </div>
            </main>

            {/* Controls */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 md:relative md:p-0 md:px-6 md:pb-8">
                <div className="mx-auto flex max-w-[85vw] items-center justify-between gap-4 md:max-w-full">
                    <button
                        onClick={handleBack}
                        disabled={currentPage === 0}
                        className={`flex h-16 w-16 items-center justify-center rounded-full bg-muted text-foreground transition-all active:scale-95 ${currentPage === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
                            }`}
                    >
                        <ArrowLeft className="h-8 w-8" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex h-20 flex-1 items-center justify-center gap-2 rounded-[2rem] bg-primary text-xl font-bold text-white shadow-xl transition-all hover:bg-primary/90 active:scale-95"
                    >
                        {isLastPage ? (
                            <>
                                <span>Finish</span>
                                <Check className="h-6 w-6" />
                            </>
                        ) : (
                            <>
                                <span>Next</span>
                                <ArrowRight className="h-6 w-6" />
                            </>
                        )}
                    </button>
                </div>
            </footer>
        </div>
    );
}
