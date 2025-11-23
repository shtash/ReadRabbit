"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, User, LogOut, Plus } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export function ProfileSwitcher() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const convexUser = useQuery(api.users.getCurrentUser);
    const children = useQuery(api.children.getChildren);
    const switchProfile = useMutation(api.users.switchProfile);

    if (!convexUser || !children) return null;

    const isParentMode = convexUser.isParentMode;
    const activeChild = children.find((c) => c._id === convexUser.activeChildId);

    // Determine current avatar and name
    const currentAvatar = isParentMode ? user?.imageUrl : activeChild?.avatarId; // TODO: Map avatarId to image URL
    const currentName = isParentMode ? (user?.firstName || "Parent") : activeChild?.name;

    const handleSwitch = async (isParent: boolean, childId?: string) => {
        await switchProfile({
            isParentMode: isParent,
            childId: childId as any,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-9 w-9 border-2 border-white/20 transition-transform hover:scale-105 active:scale-95">
                    <AvatarImage src={currentAvatar} alt={currentName} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {currentName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Switch Profile
                </DropdownMenuLabel>

                {/* Parent Profile */}
                <DropdownMenuItem
                    onClick={() => handleSwitch(true)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer ${isParentMode ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"}`}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span>{user?.firstName || "Parent"}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Admin</span>
                    </div>
                    {isParentMode && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                {/* Children Profiles */}
                {children.map((child) => (
                    <DropdownMenuItem
                        key={child._id}
                        onClick={() => handleSwitch(false, child._id)}
                        className={`flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer ${!isParentMode && activeChild?._id === child._id ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"}`}
                    >
                        <Avatar className="h-8 w-8">
                            {/* Placeholder for child avatar logic */}
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                                {child.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span>{child.name}</span>
                        {!isParentMode && activeChild?._id === child._id && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                ))}

                {children.length === 0 && (
                    <div className="px-2 py-2 text-sm text-muted-foreground italic">
                        No children profiles yet
                    </div>
                )}

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-red-500 hover:bg-red-50 cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
