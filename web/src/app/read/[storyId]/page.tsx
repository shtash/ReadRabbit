
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
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
            illustrationUrl: "https://placehold.co/600x400/gray/white.png?text=Loading...",
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

                <div className="flex w-full max-w-md flex-col gap-4">
                    <button
                        onClick={handleFinish}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-500 px-8 text-xl font-bold text-white shadow-xl transition-all hover:bg-green-600 active:scale-95"
                    >
                        <span>Take Quiz</span>
                        <Check className="h-6 w-6" />
                    </button>

                    <Link
                        href={`/read?childId=${story.childId}`}
                        className="flex h-12 w-full items-center justify-center rounded-full bg-muted px-6 text-lg font-bold text-muted-foreground transition-all hover:bg-muted/80 active:scale-95"
                    >
                        Skip Quiz
                    </Link>
                </div>

                <BottomNav />
            </div >
        );
    }

    const currentPageData = pages[currentPage];

    const getTextSizeClass = (readingLevel: string, textLength: number) => {
        const isYounger = readingLevel === 'starter' || readingLevel === 'emerging';

        if (isYounger) {
            if (textLength > 150) return "text-3xl md:text-4xl leading-relaxed";
            return "text-4xl md:text-6xl leading-relaxed";
        } else {
            // Older readers
            if (textLength > 300) return "text-xl md:text-2xl leading-relaxed";
            return "text-2xl md:text-4xl leading-relaxed";
        }
    };

    return (
        <div className="mx-auto flex min-h-screen w-full flex-col bg-muted/30 font-sans text-foreground dark:bg-background">
            {/* Header */}
            <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-4 lg:max-w-3xl">
                <Link
                    href={`/read?childId=${story.childId}`}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-white/80 hover:scale-105 active:scale-95 dark:bg-slate-800 dark:text-white"
                >
                    <ArrowLeft className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </Link>
            </header>

            {/* Content - Centered Book Page */}
            <main className="flex flex-1 flex-col items-center justify-center px-4 pb-32 md:pb-12">
                <div className="relative flex aspect-[3/4] w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-[1rem] bg-white p-8 shadow-2xl ring-1 ring-black/5 transition-all dark:bg-slate-800 dark:ring-white/10 md:aspect-[2/3] md:rounded-[2rem] md:p-16 lg:max-w-3xl">
                    <div className="absolute top-6 rounded-full bg-slate-100 px-4 py-1 text-sm font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        Page {currentPage + 1} of {pages.length}
                    </div>
                    <p className={`font-medium text-slate-800 text-justify transition-all duration-300 dark:text-slate-100 ${getTextSizeClass(story.readingLevel, currentPageData.text.length)}`}>
                        {currentPageData.text}
                    </p>
                </div>

                {/* Controls - Below page on desktop, fixed on mobile */}
                <div className="fixed bottom-24 left-0 right-0 px-6 md:static md:mt-8 md:w-full md:max-w-2xl md:px-0 lg:max-w-3xl">
                    <div className="mx-auto flex w-full items-center justify-between gap-4">
                        <button
                            onClick={handleBack}
                            disabled={currentPage === 0}
                            className={`flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg text-slate-700 transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none dark:bg-slate-800 dark:text-slate-200`}
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex h-14 w-auto items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 active:scale-95"
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
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
