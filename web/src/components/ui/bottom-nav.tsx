"use client";

import { BookOpen, Compass, Home, Library, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function BottomNav() {
    const pathname = usePathname();
    const convexUser = useQuery(api.users.getCurrentUser);

    const isActive = (path: string) => pathname === path;

    // Hide bottom nav in Parent Mode
    if (convexUser?.isParentMode) return null;

    return (
        <div className="fixed bottom-2 left-0 right-0 z-50 flex justify-center px-4 md:bottom-4">
            <nav className="w-full rounded-3xl border border-black/5 bg-[var(--nav-background)] px-6 py-2 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="mx-auto flex items-center justify-between">
                    <Link
                        href="/read"
                        className={`group flex flex-col items-center transition-colors ${isActive('/read') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-active:scale-95 ${isActive('/read') ? 'bg-primary/10 dark:bg-primary/20' : ''}`}>
                            <BookOpen className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Read</span>
                    </Link>

                    <Link
                        href="/explore"
                        className={`group flex flex-col items-center transition-colors ${isActive('/explore') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-active:scale-95 ${isActive('/explore') ? 'bg-primary/10 dark:bg-primary/20' : ''}`}>
                            <Compass className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Explore</span>
                    </Link>

                    <Link
                        href="/"
                        className={`group flex flex-col items-center transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-active:scale-95 ${isActive('/') ? 'bg-primary/10 dark:bg-primary/20' : ''}`}>
                            <Home className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Home</span>
                    </Link>

                    <Link
                        href="/library"
                        className={`group flex flex-col items-center transition-colors ${isActive('/library') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-active:scale-95 ${isActive('/library') ? 'bg-primary/10 dark:bg-primary/20' : ''}`}>
                            <Library className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Library</span>
                    </Link>

                    <Link
                        href="/profile"
                        className={`group flex flex-col items-center transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-active:scale-95 ${isActive('/profile') ? 'bg-primary/10 dark:bg-primary/20' : ''}`}>
                            <User className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">Profile</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
