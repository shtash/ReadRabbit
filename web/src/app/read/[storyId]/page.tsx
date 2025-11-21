"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StoryPage({ params }: { params: { storyId: string } }) {
    const [currentPage, setCurrentPage] = useState(0);
    const router = useRouter();

    const storyPages = [
        {
            text: "Once upon a time, there was a little rabbit named Barnaby who loved to read.",
            image: "https://placehold.co/600x400/orange/white?text=Rabbit+Reading",
        },
        {
            text: "One day, Barnaby found a magical book that glowed in the dark!",
            image: "https://placehold.co/600x400/purple/white?text=Magic+Book",
        },
        {
            text: "He opened the book and WHOOSH! He was transported to a land made of carrots.",
            image: "https://placehold.co/600x400/orange/white?text=Carrot+Land",
        },
    ];

    const isLastPage = currentPage === storyPages.length - 1;

    const handleNext = () => {
        if (isLastPage) {
            router.push(`/read/${params.storyId}/quiz`);
        } else {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    return (
        <div className="mx-auto min-h-screen w-full bg-background font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-8 pb-4">
                <Link
                    href="/read"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div className="text-sm font-bold text-muted-foreground">
                    Page {currentPage + 1} of {storyPages.length}
                </div>
                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* Content */}
            <main className="flex flex-col items-center gap-8 px-6 py-4">
                <div className="aspect-video w-full overflow-hidden rounded-3xl bg-muted shadow-lg">
                    <img
                        src={storyPages[currentPage].image}
                        alt={`Page ${currentPage + 1}`}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="w-full rounded-3xl bg-card p-8 shadow-sm dark:bg-card/50">
                    <p className="text-2xl font-medium leading-relaxed text-foreground">
                        {storyPages[currentPage].text}
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
                        className={`flex h-20 flex-1 items-center justify-center gap-2 rounded-[2rem] text-xl font-bold text-white shadow-xl transition-all active:scale-95 ${isLastPage ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                            }`}
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
