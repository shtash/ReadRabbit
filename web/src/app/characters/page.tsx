"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { appConfig } from "@readrabbit/config";
import { BottomNav } from "@/components/ui/bottom-nav";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function CharactersPage() {
    const convexUser = useQuery(api.users.getCurrentUser);
    const activeChildId = convexUser?.activeChildId;

    // Only fetch characters if we have a child ID
    const characters = useQuery(
        api.characters.getCharacters,
        activeChildId ? { childId: activeChildId } : "skip"
    );

    if (!convexUser) {
        return null; // Or loading state
    }

    return (
        <div className={`${appConfig.layout.workspaceContainer} pb-24`}>
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    My Characters
                </h1>
            </header>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {/* Character Cards */}
                {characters?.map((char) => (
                    <Link key={char._id} href={`/characters/edit/${char._id}`} className="group flex flex-col items-center gap-4">
                        <div
                            className="relative w-full aspect-square overflow-hidden rounded-full border-4 border-white shadow-xl transition-transform hover:scale-105 active:scale-95 dark:border-slate-800"
                            style={{ width: `${appConfig.parentDashboard.childCardWidthPercentage}%` }}
                        >
                            {char.faceImageUrl ? (
                                <img
                                    src={char.faceImageUrl}
                                    alt={char.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-4xl font-black text-slate-400 dark:from-slate-800 dark:to-slate-900 md:text-6xl lg:text-8xl">
                                    {char.name[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">{char.name}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {char.type === 'boy' ? 'Male' : char.type === 'girl' ? 'Female' : char.type}
                            </p>
                        </div>
                    </Link>
                ))}

                {/* Add Character Button */}
                {activeChildId && (
                    <Link
                        href={`/characters/add?childId=${activeChildId}`}
                        className="group flex flex-col items-center gap-4"
                    >
                        <div
                            className="flex w-full aspect-square items-center justify-center rounded-full border-4 border-dashed border-slate-300 bg-slate-50 text-slate-300 transition-all group-hover:border-orange-400 group-hover:bg-orange-50 group-hover:text-orange-500 active:scale-95 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-600 dark:group-hover:border-orange-500/50 dark:group-hover:bg-orange-500/10 dark:group-hover:text-orange-500"
                            style={{ width: `${appConfig.parentDashboard.childCardWidthPercentage}%` }}
                        >
                            <Plus className="h-12 w-12 md:h-24 md:w-24 lg:h-32 lg:w-32" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-400 transition-colors group-hover:text-orange-500 md:text-2xl">Add New</h3>
                        </div>
                    </Link>
                )}
            </div>

            {/* Empty State */}
            {characters && characters.length === 0 && (
                <div className="mt-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-lg font-medium">You haven&apos;t added any characters yet.</p>
                    <p>Tap the + button to add your family, friends, or pets!</p>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
