"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { ShieldCheck } from "lucide-react";

export function ParentModeBanner() {
    const convexUser = useQuery(api.users.getCurrentUser);

    if (!convexUser?.isParentMode) return null;

    return (
        <div className="sticky top-0 z-50 w-full bg-slate-900 shadow-md">
            <div className="mx-auto flex items-center justify-between px-6 py-2 text-white md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-bold uppercase tracking-wider">Parent Mode Active</span>
                </div>

                <div className="flex items-center gap-4">
                    <ProfileSwitcher />
                </div>
            </div>
        </div>
    );
}
