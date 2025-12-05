"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Cat, Rocket, Ghost, Fish, Car, Music, Sparkles, LucideIcon, Check, User } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { appConfig } from "@readrabbit/config";

// Map themes to icons (fallback)
const iconMap: Record<string, LucideIcon> = {
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

    // Data Fetching
    const categories = useQuery(api.categories.getCategoryTiles);
    const characters = useQuery(api.characters.getCharacters, childId ? { childId: childId as Id<"children"> } : "skip");
    const childProfile = useQuery(api.children.getChild, childId ? { childId: childId as Id<"children"> } : "skip");
    const allChildren = useQuery(api.children.getChildrenWithPhotos);
    const createStory = useAction(api.stories.createStory);

    // Derived State
    const siblings = allChildren?.filter(c => c._id !== childId) || [];

    // State
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
    const [storyLength, setStoryLength] = useState<string>("medium");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCategorySelect = (theme: string) => {
        setSelectedCategory(theme);
    };

    const handleCharacterToggle = (charId: string) => {
        setSelectedCharacterIds(prev => {
            if (prev.includes(charId)) {
                return prev.filter(id => id !== charId);
            } else {
                return [...prev, charId];
            }
        });
    };

    const handleGenerate = async () => {
        if (!childId || !selectedCategory) return;

        setIsGenerating(true);
        try {
            const isChildSelected = selectedCharacterIds.includes(childId);

            // Separate siblings from regular characters
            const siblingIds = selectedCharacterIds.filter(id =>
                siblings.some(s => s._id === id)
            ) as Id<"children">[];

            // Filter out childId and siblingIds to get regular characterIds
            const finalCharacterIds = selectedCharacterIds.filter(id =>
                id !== childId && !siblings.some(s => s._id === id)
            ) as Id<"characters">[];

            const storyId = await createStory({
                childId: childId as Id<"children">,
                theme: selectedCategory,
                personalizationMode: isChildSelected ? "include-child" : "none",
                sourceMode: "category",
                characterIds: finalCharacterIds.length > 0 ? finalCharacterIds : undefined,
                siblingIds: siblingIds.length > 0 ? siblingIds : undefined,
                storyLength,
            });
            router.push(`/read/${storyId}`);
        } catch (error) {
            console.error("Failed to generate story:", error);
            setIsGenerating(false);
        }
    };

    if (!childId) return <div>Missing childId</div>;

    return (
        <div className="relative mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:flex md:flex-col md:justify-center md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="flex items-center justify-center gap-4 px-6 pt-6 pb-2 md:absolute md:top-0 md:left-0 md:right-0 md:pt-8">
                <Link
                    href={`/read?childId=${childId}`}
                    className="absolute left-6 flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80 md:left-8 md:h-10 md:w-10"
                >
                    <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                </Link>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                        Create a Story
                    </h1>
                </div>
            </header>

            <main className="flex flex-col gap-4 md:gap-12">
                {/* 1. Category Selection */}
                <section>
                    <h2 className="px-6 mb-2 text-lg font-bold text-foreground md:text-center md:text-xl md:mb-4">1. Pick a Topic</h2>
                    <HorizontalScroller contentClassName="md:w-fit md:mx-auto py-2 md:py-4">
                        {categories?.map((category) => {
                            const Icon = iconMap[category.theme] || Sparkles;
                            const isSelected = selectedCategory === category.theme;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category.theme)}
                                    className={`group relative flex h-32 w-24 flex-none flex-col items-center justify-center gap-2 rounded-2xl border-2 p-2 transition-all hover:scale-105 active:scale-95 md:h-64 md:w-48 md:gap-3 md:rounded-3xl md:p-4 ${isSelected
                                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                                        }`}
                                >
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors md:h-24 md:w-24 ${isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                            }`}
                                    >
                                        <Icon className="h-6 w-6 md:h-12 md:w-12" />
                                    </div>
                                    <span className={`text-center text-sm font-bold leading-tight md:text-xl ${isSelected ? "text-primary" : "text-foreground"}`}>
                                        {category.title}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5 text-white shadow-sm md:top-3 md:right-3 md:p-1">
                                            <Check className="h-2 w-2 md:h-3 md:w-3" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </HorizontalScroller>
                </section>

                {/* 2. Character Selection */}
                <section>
                    <h2 className="px-6 mb-2 text-lg font-bold text-foreground md:text-center md:text-xl md:mb-4">2. Choose Characters (optional)</h2>
                    <HorizontalScroller contentClassName="md:w-fit md:mx-auto py-2 md:py-4 !gap-1 md:gap-4">
                        {/* Child "Me" Button */}
                        {childProfile && (
                            <button
                                key={childProfile._id}
                                onClick={() => handleCharacterToggle(childProfile._id)}
                                className="group relative flex flex-none flex-col items-center justify-start gap-1 p-0.5 transition-all hover:scale-105 active:scale-95 md:gap-3"
                            >
                                <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all md:h-40 md:w-40 md:border-4 ${selectedCharacterIds.includes(childProfile._id)
                                    ? "border-blue-500 shadow-lg shadow-blue-500/20"
                                    : "border-transparent bg-muted group-hover:border-blue-500/50"
                                    }`}>
                                    {childProfile.faceImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={childProfile.faceImageUrl} alt={childProfile.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                            <User className="h-8 w-8 md:h-16 md:w-16" />
                                        </div>
                                    )}

                                    {selectedCharacterIds.includes(childProfile._id) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                                            <div className="rounded-full bg-blue-500 p-1 text-white shadow-sm md:p-2">
                                                <Check className="h-4 w-4 md:h-6 md:w-6" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-center text-xs font-bold md:text-lg ${selectedCharacterIds.includes(childProfile._id) ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
                                    Me ({childProfile.name})
                                </span>
                            </button>
                        )}

                        {/* Siblings */}
                        {siblings.map((sibling) => (
                            <button
                                key={sibling._id}
                                onClick={() => handleCharacterToggle(sibling._id)}
                                className="group relative flex flex-none flex-col items-center justify-start gap-1 p-0.5 transition-all hover:scale-105 active:scale-95 md:gap-3"
                            >
                                <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all md:h-40 md:w-40 md:border-4 ${selectedCharacterIds.includes(sibling._id)
                                    ? "border-purple-500 shadow-lg shadow-purple-500/20"
                                    : "border-transparent bg-muted group-hover:border-purple-500/50"
                                    }`}>
                                    {sibling.faceImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={sibling.faceImageUrl} alt={sibling.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                            <User className="h-8 w-8 md:h-16 md:w-16" />
                                        </div>
                                    )}

                                    {selectedCharacterIds.includes(sibling._id) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20">
                                            <div className="rounded-full bg-purple-500 p-1 text-white shadow-sm md:p-2">
                                                <Check className="h-4 w-4 md:h-6 md:w-6" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-center text-xs font-bold md:text-lg ${selectedCharacterIds.includes(sibling._id) ? "text-purple-600 dark:text-purple-400" : "text-foreground"}`}>
                                    {sibling.name}
                                </span>
                            </button>
                        ))}

                        {characters?.map((char) => {
                            const isSelected = selectedCharacterIds.includes(char._id);
                            return (
                                <button
                                    key={char._id}
                                    onClick={() => handleCharacterToggle(char._id)}
                                    className="group relative flex flex-none flex-col items-center justify-start gap-1 p-0.5 transition-all hover:scale-105 active:scale-95 md:gap-3"
                                >
                                    <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all md:h-40 md:w-40 md:border-4 ${isSelected
                                        ? "border-green-500 shadow-lg shadow-green-500/20"
                                        : "border-transparent bg-muted group-hover:border-green-500/50"
                                        }`}>
                                        {char.faceImageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={char.faceImageUrl} alt={char.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                                <User className="h-8 w-8 md:h-16 md:w-16" />
                                            </div>
                                        )}

                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                                                <div className="rounded-full bg-green-500 p-1 text-white shadow-sm md:p-2">
                                                    <Check className="h-4 w-4 md:h-6 md:w-6" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-center text-xs font-bold md:text-lg ${isSelected ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                                        {char.name}
                                    </span>
                                </button>
                            );
                        })}
                        {(!characters || characters.length === 0) && !childProfile && siblings.length === 0 && (
                            <div className="flex h-32 w-full items-center justify-center px-6 text-sm text-muted-foreground md:h-48 md:text-base">
                                No characters found. Add some in the Parent Dashboard!
                            </div>
                        )}
                    </HorizontalScroller>
                </section>

                {/* 3. Story Length */}
                <section className="px-6">
                    <h2 className="mb-2 text-lg font-bold text-foreground md:text-center md:text-xl md:mb-4">3. Story Length</h2>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {(Object.entries(appConfig.storyLength.options) as [string, { label: string; pages: number }][]).map(([key, option]) => (
                            <button
                                key={key}
                                onClick={() => setStoryLength(key)}
                                className={`flex w-24 flex-col items-center justify-center rounded-xl border-2 py-2 transition-all md:w-32 md:rounded-2xl md:py-4 ${storyLength === key
                                    ? "border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-500/20 dark:bg-orange-900/20 dark:text-orange-400"
                                    : "border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:bg-orange-50/50 dark:bg-card dark:border-gray-700 dark:text-gray-400 dark:hover:border-orange-900/50"
                                    }`}
                            >
                                <span className="text-sm font-bold md:text-lg">{option.label}</span>
                                <span className={`text-[10px] font-medium md:text-xs ${storyLength === key ? "text-orange-600/80 dark:text-orange-400/80" : "text-gray-400"
                                    }`}>
                                    {option.pages} Pages
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Generate Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:relative md:bg-none md:p-0 md:mt-8 md:mb-12">
                    <div className="mx-auto flex justify-center md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedCategory}
                            className="group relative flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 text-lg font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none md:h-16 md:gap-3 md:px-10 md:text-2xl"
                        >
                            <span>{isGenerating ? "Writing Story..." : "Create Story!"}</span>
                            <Sparkles className={`h-5 w-5 md:h-6 md:w-6 ${isGenerating ? "animate-spin" : "animate-pulse"}`} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
