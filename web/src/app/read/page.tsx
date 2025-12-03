"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { Sparkles, Grid, Mic } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

import { Id } from "../../../convex/_generated/dataModel";

export default function ReadPage() {
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId");
    const convexUser = useQuery(api.users.getCurrentUser);

    const router = useRouter();
    const createStory = useAction(api.stories.createStory);
    const [isGenerating, setIsGenerating] = useState(false);
    const testGen = useAction(api.stories.testGeneration);
    const [debugOutput, setDebugOutput] = useState<string | null>(null);

    // Determine effective childId: URL param > Active Child in DB
    const effectiveChildId = childId || (convexUser && !convexUser.isParentMode ? convexUser.activeChildId : null);

    const handleAutoMode = async (cId: string | null) => {
        if (!cId) {
            alert("No child selected!");
            return;
        }
        setIsGenerating(true);
        try {
            const storyId = await createStory({
                childId: cId as Id<"children">,
                theme: "random",
                personalizationMode: "none",
                sourceMode: "auto",
            });
            router.push(`/read/${storyId}`);
        } catch (error) {
            console.error("Failed to generate story:", error);
            alert("Something went wrong!");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDebug = async () => {
        setDebugOutput("Testing AI...");
        try {
            const result = await testGen({ theme: "robots" });
            setDebugOutput(JSON.stringify(result, null, 2));
        } catch (e: unknown) {
            setDebugOutput("Error: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    if (convexUser === undefined) {
        return null; // Loading...
    }

    if (!effectiveChildId) {
        // If in parent mode or no child selected, prompt to switch
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
                <h2 className="text-2xl font-bold">Who is reading?</h2>
                <p className="text-muted-foreground">Please switch to a child profile using the menu in the top right to start a story.</p>
                <Link href="/" className="text-primary hover:underline">
                    Go Home
                </Link>
            </div>
        );
    }



    return (
        <div className="mx-auto flex min-h-screen w-full flex-col justify-center bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="px-6 pb-8 text-center md:pt-0">
                <h1 className="mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
                    Make a Story
                </h1>
                <p className="text-base font-medium text-muted-foreground md:text-lg">
                    How do you want to start?
                </p>
            </header>

            <main className="mx-auto grid w-full grid-cols-3 gap-3 px-3 md:w-[60%] md:gap-6 md:px-0">
                {/* Custom Mode - "Imagine" */}
                <Link
                    href={`/read/custom?childId=${effectiveChildId}`}
                    className="group relative flex aspect-[3/4] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-2 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95 md:rounded-[2rem] md:p-6"
                >
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center md:gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-sm md:h-20 md:w-20 md:rounded-2xl">
                            <Mic className="h-6 w-6 md:h-10 md:w-10" />
                        </div>
                        <div>
                            <h2 className="mb-1 text-sm font-black md:mb-2 md:text-2xl">Imagine</h2>
                            <p className="hidden text-[10px] font-medium leading-tight text-white/90 md:block md:text-base">Explain the plot you want</p>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl md:h-40 md:w-40 md:blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-black/5 blur-2xl md:h-40 md:w-40 md:blur-3xl" />
                </Link>

                {/* Category Mode - "Categories" */}
                <Link
                    href={`/read/category?childId=${effectiveChildId}`}
                    className="group relative flex aspect-[3/4] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-2 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95 md:rounded-[2rem] md:p-6"
                >
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center md:gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-sm md:h-20 md:w-20 md:rounded-2xl">
                            <Grid className="h-6 w-6 md:h-10 md:w-10" />
                        </div>
                        <div>
                            <h2 className="mb-1 text-sm font-black md:mb-2 md:text-2xl">Categories</h2>
                            <p className="hidden text-[10px] font-medium leading-tight text-white/90 md:block md:text-base">Choose the story type</p>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl md:h-40 md:w-40 md:blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-black/5 blur-2xl md:h-40 md:w-40 md:blur-3xl" />
                </Link>

                {/* Auto Mode - "Surprise me" */}
                <button
                    onClick={() => handleAutoMode(effectiveChildId)}
                    disabled={isGenerating}
                    className="group relative flex aspect-[3/4] w-full flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-2 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-70 md:rounded-[2rem] md:p-6"
                >
                    <div className="relative z-10 flex flex-col items-center gap-2 text-center md:gap-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-sm md:h-20 md:w-20 md:rounded-2xl">
                            <Sparkles className="h-6 w-6 md:h-10 md:w-10" />
                        </div>
                        <div>
                            <h2 className="mb-1 text-sm font-black md:mb-2 md:text-2xl">
                                {isGenerating ? "Magic..." : "Surprise"}
                            </h2>
                            <p className="hidden text-[10px] font-medium leading-tight text-white/90 md:block md:text-base">Feeling adventurous?</p>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl md:h-40 md:w-40 md:blur-3xl" />
                    <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-black/5 blur-2xl md:h-40 md:w-40 md:blur-3xl" />
                </button>
            </main>

            {/* Debug Section */}
            <div className="mt-8 flex flex-col items-center gap-4">
                <button
                    onClick={handleDebug}
                    className="rounded-full bg-gray-800 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700"
                >
                    Debug AI Response
                </button>
                {debugOutput && (
                    <pre className="max-h-64 w-full max-w-2xl overflow-auto rounded-xl bg-black/80 p-4 text-xs text-green-400">
                        {debugOutput}
                    </pre>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
