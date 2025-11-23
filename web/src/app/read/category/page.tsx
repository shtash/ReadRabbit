"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Cat, Rocket, Ghost, Fish, Car, Music, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

// Map themes to icons (fallback)
const iconMap: Record<string, any> = {
    animals: Cat,
    space: Rocket,
    magic: Sparkles,
    spooky: Ghost,
    ocean: Fish,
    vehicles: Car,
    music: Music,
};

export default function CategoryPage() {
    const searchParams = useSearchParams();
    const childId = searchParams.get("childId");
    const router = useRouter();
    const categories = useQuery(api.categories.getCategoryTiles);
    const createStory = useMutation(api.stories.createStory);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const handleCategorySelect = async (theme: string) => {
        if (!childId) return;
        setIsGenerating(theme);
        try {
            const storyId = await createStory({
                childId: childId as any,
                theme: theme,
                personalizationMode: "none",
                sourceMode: "category",
            });
            router.push(`/read/${storyId}`);
        } catch (error) {
            console.error("Failed to generate story:", error);
            setIsGenerating(null);
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
                        Pick a Topic
                    </h1>
                </div>
            </header>

            <main className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3">
                {categories?.map((category) => {
                    const Icon = iconMap[category.theme] || Sparkles;
                    const isSelected = isGenerating === category.theme;

                    return (
                        <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.theme)}
                            disabled={!!isGenerating}
                            className={`group flex flex-col items-center justify-center gap-4 rounded-3xl bg-card p-6 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:bg-card/50 ${isSelected ? 'ring-4 ring-primary' : ''}`}
                        >
                            <div
                                className={`flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-lg`}
                            >
                                {isSelected ? (
                                    <Sparkles className="h-10 w-10 animate-spin" />
                                ) : (
                                    <Icon className="h-10 w-10" />
                                )}
                            </div>
                            <span className="text-lg font-bold">{category.title}</span>
                        </button>
                    );
                })}
            </main>
        </div>
    );
}
