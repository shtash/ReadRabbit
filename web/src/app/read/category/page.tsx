import Link from "next/link";
import { ArrowLeft, Cat, Rocket, Ghost, Fish, Car, Music } from "lucide-react";

export default function CategoryPage() {
    const categories = [
        { id: "animals", name: "Animals", icon: Cat, color: "bg-orange-400" },
        { id: "space", name: "Space", icon: Rocket, color: "bg-blue-500" },
        { id: "spooky", name: "Spooky", icon: Ghost, color: "bg-purple-500" },
        { id: "ocean", name: "Ocean", icon: Fish, color: "bg-cyan-400" },
        { id: "vehicles", name: "Vehicles", icon: Car, color: "bg-red-500" },
        { id: "music", name: "Music", icon: Music, color: "bg-pink-500" },
    ];

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="flex items-center gap-4 px-6 pt-12 pb-6">
                <Link
                    href="/read"
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
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href="/read/mock-story-1"
                        className="group flex flex-col items-center justify-center gap-4 rounded-3xl bg-card p-6 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:bg-card/50"
                    >
                        <div
                            className={`flex h-20 w-20 items-center justify-center rounded-full ${category.color} text-white shadow-lg`}
                        >
                            <category.icon className="h-10 w-10" />
                        </div>
                        <span className="text-lg font-bold">{category.name}</span>
                    </Link>
                ))}
            </main>
        </div>
    );
}
