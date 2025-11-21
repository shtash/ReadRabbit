import { BookOpen, Compass, Library, User } from "lucide-react";
import Link from "next/link";

export function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <nav className="w-full border-t border-black/5 bg-white/80 px-6 pb-6 pt-4 backdrop-blur-xl dark:border-white/5 dark:bg-black/80 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="mx-auto flex items-center justify-between">
                    <Link
                        href="/read"
                        className="group flex flex-col items-center gap-1 text-primary transition-colors"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-active:scale-95 dark:bg-primary/20">
                            <BookOpen className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Read</span>
                    </Link>

                    <Link
                        href="/explore"
                        className="group flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-active:scale-95">
                            <Compass className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Explore</span>
                    </Link>

                    <Link
                        href="/library"
                        className="group flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-active:scale-95">
                            <Library className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Library</span>
                    </Link>

                    <Link
                        href="/profile"
                        className="group flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-active:scale-95">
                            <User className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
