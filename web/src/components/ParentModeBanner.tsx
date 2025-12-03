"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { ShieldCheck, LogOut, AlertTriangle } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useState } from "react";



export function ParentModeBanner() {
    const convexUser = useQuery(api.users.getCurrentUser);
    const { signOut } = useClerk();
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    if (!convexUser?.isParentMode) return null;

    const handleSignOut = () => {
        signOut();
        setShowSignOutModal(false);
    };

    return (
        <>
            <div className="sticky top-0 z-50 w-full bg-slate-900 shadow-md">
                <div className="mx-auto flex items-center justify-between px-6 py-2 text-white md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-bold uppercase tracking-wider">Parent Mode Active</span>
                        <p className="text-sm text-muted-foreground">
                            You&apos;re in Parent Mode. You can manage profiles and settings.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSignOutModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300 active:scale-95"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </button>
                        <ProfileSwitcher />
                    </div>
                </div>
            </div>

            {/* Sign Out Confirmation Modal */}
            {showSignOutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-slate-800">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        <h3 className="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">
                            Sign Out?
                        </h3>

                        <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400">
                            Are you sure you want to sign out? You&apos;ll need to sign in again to access your account.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSignOutModal(false)}
                                className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-red-700 active:scale-95"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
