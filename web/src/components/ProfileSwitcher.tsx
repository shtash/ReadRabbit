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
import { ShieldCheck, User, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileSwitcher() {
    const router = useRouter();
    const { user } = useUser();
    const convexUser = useQuery(api.users.getCurrentUser);
    const children = useQuery(api.children.getChildrenWithPhotos);
    const switchProfile = useMutation(api.users.switchProfile);

    if (!convexUser || !children) return null;

    const isParentMode = convexUser.isParentMode;
    const activeChild = children.find((c) => c._id === convexUser.activeChildId);

    // Determine current avatar and name
    const currentAvatar = isParentMode ? user?.imageUrl : activeChild?.faceImageUrl;
    const currentName = isParentMode ? (user?.firstName || "Parent") : activeChild?.name;

    const handleSwitch = async (isParent: boolean, childId?: string) => {
        await switchProfile({
            isParentMode: isParent,
            childId: childId as any,
        });
        router.push("/");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-14 w-14 md:h-20 md:w-20 border-2 border-white/20 transition-transform hover:scale-105 active:scale-95">
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
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <span className="text-base font-medium">Parent</span>
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
                        <Avatar className="h-16 w-16">
                            {child.faceImageUrl ? (
                                <AvatarImage src={child.faceImageUrl} alt={child.name} />
                            ) : (
                                <AvatarFallback className="bg-orange-100 text-orange-600">
                                    {child.name[0]}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <span className="text-base font-medium">{child.name}</span>
                        {!isParentMode && activeChild?._id === child._id && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                ))}

                {children.length === 0 && (
                    <div className="px-2 py-2 text-sm text-muted-foreground italic">
                        No children profiles yet
                    </div>
                )}

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
