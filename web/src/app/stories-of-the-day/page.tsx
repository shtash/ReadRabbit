import { BottomNav } from "@/components/ui/bottom-nav";
import { StoryCard } from "@/components/ui/story-card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StoriesOfTheDayPage() {
    const stories = [
        {
            title: "The Magical Forest",
            category: "Adventure",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        {
            title: "Rocket to Mars",
            category: "Space",
            color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        },
        {
            title: "Ocean Friends",
            category: "Ocean",
            color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        },
        {
            title: "School Day Surprise",
            category: "School",
            color: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        },
        {
            title: "The Brave Knight",
            category: "Fantasy",
            color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        },
        {
            title: "Dinosaur Discovery",
            category: "Prehistoric",
            color: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        },
        {
            title: "Pizza Party",
            category: "Food",
            color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        },
        {
            title: "The Lost Puppy",
            category: "Animals",
            color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        },
    ];

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="flex items-center gap-4 px-6 pt-12 pb-6">
                <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Stories of the Day
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        AI-generated stories just for you
                    </p>
                </div>
            </header>

            <main className="px-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {stories.map((story, index) => (
                        <StoryCard
                            key={index}
                            title={story.title}
                            category={story.category}
                            color={story.color}
                        />
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
