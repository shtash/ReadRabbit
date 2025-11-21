import { BottomNav } from "@/components/ui/bottom-nav";
import { StoryCard } from "@/components/ui/story-card";
import { Clock, Heart } from "lucide-react";

export default function LibraryPage() {
    const savedStories = [
        {
            title: "My First Story",
            category: "Custom",
            color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        },
        {
            title: "The Magic Tree",
            category: "Nature",
            color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        },
    ];

    const historyStories = [
        {
            title: "Space Cat",
            category: "Space",
            color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
        },
    ];

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Library
                </h1>
                <p className="text-muted-foreground font-medium">
                    Your collection of tales.
                </p>
            </header>

            <main className="flex flex-col gap-8 px-6">
                {/* Saved Stories */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Heart className="h-5 w-5" />
                        <h2 className="text-xl font-bold text-foreground">Saved Stories</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {savedStories.map((story, index) => (
                            <StoryCard
                                key={index}
                                title={story.title}
                                category={story.category}
                                color={story.color}
                            />
                        ))}
                    </div>
                </section>

                {/* History */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <h2 className="text-xl font-bold text-foreground">Recently Read</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {historyStories.map((story, index) => (
                            <StoryCard
                                key={index}
                                title={story.title}
                                category={story.category}
                                color={story.color}
                            />
                        ))}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
