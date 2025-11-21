import Link from "next/link";
import { Sparkles, Grid, Mic } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function ReadPage() {
    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Make a Story
                </h1>
                <p className="text-muted-foreground font-medium">
                    How do you want to start?
                </p>
            </header>

            <main className="flex flex-col gap-4 px-6">
                {/* Auto Mode */}
                <Link
                    href="/read/mock-story-1"
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">You choose for me!</h2>
                            <p className="text-white/80">We'll pick a fun surprise story.</p>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                </Link>

                {/* Category Mode */}
                <Link
                    href="/read/category"
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 p-8 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Grid className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">I pick the topic</h2>
                            <p className="text-white/80">Choose from Animals, Space, etc.</p>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                </Link>

                {/* Custom Mode */}
                <Link
                    href="/read/custom"
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-8 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Mic className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">I tell you what happens</h2>
                            <p className="text-white/80">Use your voice to create a story.</p>
                        </div>
                    </div>
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                </Link>
            </main>

            <BottomNav />
        </div>
    );
}
