"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Plus } from "lucide-react";
import { appConfig } from "@/config/app.config";

export default function ParentDashboard() {
    const { user } = useUser();
    const children = useQuery(api.children.getChildren);

    return (
        <div className="mx-auto min-h-screen w-full p-8 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="mb-12 flex flex-col items-center justify-center gap-6">
                <div className="rounded-full border-4 border-slate-900 bg-white px-8 py-3 shadow-xl dark:border-white dark:bg-slate-900">
                    <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
                        Parent Dashboard
                    </h1>
                </div>
            </header>

            {children === undefined ? (
                <div className="flex justify-center p-12">
                    <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading profiles...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {/* Child Cards */}
                    {children.map((child) => (
                        <Link href={`/profile/${child._id}`} key={child._id} className="group flex flex-col items-center gap-4">
                            <div
                                className="relative w-32 overflow-hidden rounded-full border-4 border-white shadow-xl transition-transform group-hover:scale-105 group-active:scale-95 dark:border-slate-800 aspect-square md:h-auto"
                                style={{ width: `${appConfig.parentDashboard.childCardWidthPercentage}%` }}
                            >
                                {/* Placeholder for Avatar - using first letter for now */}
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-300 to-yellow-200 text-4xl font-black text-orange-700 md:text-8xl lg:text-9xl">
                                    {child.name[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">{child.name}</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 md:text-lg">({child.age} years old)</p>
                            </div>
                        </Link>
                    ))}

                    {/* Add Child Button */}
                    <Link href="/parent/add-child" className="group flex flex-col items-center gap-4">
                        <div
                            className="flex w-32 items-center justify-center rounded-full border-4 border-dashed border-slate-300 bg-slate-50 text-slate-300 transition-all group-hover:border-primary group-hover:bg-primary/5 group-hover:text-primary group-active:scale-95 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-600 aspect-square md:h-auto"
                            style={{ width: `${appConfig.parentDashboard.childCardWidthPercentage}%` }}
                        >
                            <Plus className="h-12 w-12 md:h-24 md:w-24 lg:h-32 lg:w-32" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-400 transition-colors group-hover:text-primary md:text-2xl">Add Child</h3>
                        </div>
                    </Link>
                </div>
            )}

            {/* Empty State Message */}
            {children && children.length === 0 && (
                <div className="mt-12 text-center">
                    <p className="text-lg font-medium text-slate-500">
                        Welcome! Click the <span className="font-bold text-primary">+</span> button above to add your first child profile.
                    </p>
                </div>
            )}
        </div>
    );
}
