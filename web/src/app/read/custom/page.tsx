"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Mic, Send, Sparkles, Wand2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export default function CustomStoryPage() {
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId");
    const router = useRouter();
    const createStory = useAction(api.stories.createStory);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!childId || !prompt.trim()) return;
        setIsGenerating(true);
        try {
            const storyId = await createStory({
                childId: childId as any,
                theme: "custom",
                personalizationMode: "none",
                sourceMode: "custom",
                customPromptText: prompt,
            });
            router.push(`/read/${storyId}`);
        } catch (error) {
            console.error("Failed to generate story:", error);
            setIsGenerating(false);
        }
    };

    if (!childId) return <div>Missing childId</div>;

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="flex items-center gap-4 px-6 pt-12 pb-6">
                <Link
                    href={`/read?childId=${childId}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Tell Your Story
                    </h1>
                </div>
            </header>

            <main className="flex flex-col gap-6 px-6">
                <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-card p-12 text-center shadow-sm dark:bg-card/50">
                    <button className="group flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 transition-all hover:scale-110 hover:bg-primary/20 active:scale-95">
                        <Mic className="h-16 w-16 text-primary transition-colors group-hover:text-primary/80" />
                    </button>
                    <p className="text-lg font-medium text-muted-foreground">
                        Tap to speak...
                    </p>
                </div>

                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Or type your story idea here..."
                        className="min-h-[200px] w-full resize-none rounded-3xl border-2 border-muted bg-background p-6 text-lg font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                    >
                        {isGenerating ? <Sparkles className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                    </button>
                </div>
            </main>
        </div>
    );
}
