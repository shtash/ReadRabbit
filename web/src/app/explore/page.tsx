import { BottomNav } from "@/components/ui/bottom-nav";
import { StoryCard } from "@/components/ui/story-card";
import { Search } from "lucide-react";

export default function ExplorePage() {
    const trendingStories = [
        {
            title: "The Brave Little Toaster",
            category: "Adventure",
            color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
        },
        {
            title: "Moon Rabbit",
            category: "Space",
            color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
        },
        {
            title: "Underwater City",
            category: "Ocean",
            color: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        },
        {
            title: "Dino Park",
            category: "Prehistoric",
            color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        },
    ];

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Explore
                </h1>
                <p className="text-muted-foreground font-medium">
                    Discover new adventures.
                </p>
            </header>

            <main className="flex flex-col gap-8 px-6">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for stories..."
                        className="h-12 w-full rounded-2xl border-2 border-muted bg-background pl-12 pr-4 font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                </div>

                {/* Trending Section */}
                <section className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {trendingStories.map((story, index) => (
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
