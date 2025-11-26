"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { ChevronLeft, Star, Users, Settings, Palette } from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";
import { appConfig } from "@readrabbit/config";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function ChildDashboardPage() {
    const params = useParams();
    const childId = params.id as Id<"children">;
    const child = useQuery(api.children.getChild, { childId });

    if (child === undefined) {
        return (
            <div className={`${appConfig.layout.workspaceContainer} flex items-center justify-center`}>
                <p className="text-xl font-medium text-muted-foreground animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    if (child === null) {
        return (
            <div className={`${appConfig.layout.workspaceContainer} flex flex-col items-center justify-center gap-4`}>
                <p className="text-xl font-medium text-slate-500">Profile not found</p>
                <Link href="/" className="text-primary hover:underline">Go Home</Link>
            </div>
        );
    }

    return (
        <div className={`${appConfig.layout.workspaceContainer} pb-24`}>
            {/* Header */}
            <header className="relative flex items-center justify-between p-6">
                <Link href="/" className="rounded-full p-2 hover:bg-muted transition-colors">
                    <ChevronLeft className="h-8 w-8 text-foreground" />
                </Link>
                <h1 className="text-2xl font-extrabold text-foreground">My Profile</h1>
                <div className="w-12" /> {/* Spacer */}
            </header>

            <main className="flex flex-col gap-6 px-6">
                {/* Profile Card */}
                <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-card p-8 shadow-xl">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary bg-muted">
                        <img
                            src={child.faceImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.avatarId}`}
                            alt={child.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-foreground">{child.name}</h2>
                        <p className="text-lg font-medium text-muted-foreground">Level: {child.readingLevel}</p>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* My Progress */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Star className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">My Progress</h3>
                                <p className="text-white/80">See your stars!</p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-center font-bold">Coming Soon!</p>
                        </div>
                    </div>

                    {/* My Friends */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-400 to-indigo-500 p-6 text-white shadow-lg transition-transform hover:scale-[1.02]">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">My Friends</h3>
                                <p className="text-white/80">Manage your buddies</p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-center font-bold">Coming Soon!</p>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="rounded-[2rem] bg-card p-6 shadow-lg">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Settings className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Settings</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                            <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-muted-foreground" />
                                <span className="font-bold text-foreground">Color Theme</span>
                            </div>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
