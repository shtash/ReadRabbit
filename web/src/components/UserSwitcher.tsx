"use client";

import { useUser } from "@/context/UserContext";
import { Check, Plus, User as UserIcon, X } from "lucide-react";
import { useState } from "react";

interface UserSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserSwitcher({ isOpen, onClose }: UserSwitcherProps) {
    const { users, currentUser, switchUser, addUser } = useUser();
    const [isAdding, setIsAdding] = useState(false);
    const [newUserName, setNewUserName] = useState("");

    if (!isOpen) return null;

    const handleSwitch = (userId: string) => {
        switchUser(userId);
        onClose();
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserName.trim()) {
            addUser(newUserName.trim());
            setNewUserName("");
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-50 mt-16 w-full flex justify-end md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
                <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-muted bg-card shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-muted p-4">
                        <h3 className="font-bold text-foreground">Switch Profile</h3>
                        <button onClick={onClose} className="rounded-full p-1 hover:bg-muted text-muted-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-2">
                        <div className="flex flex-col gap-1">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSwitch(user.id)}
                                    className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${currentUser?.id === user.id
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted text-foreground"
                                        }`}
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${currentUser?.id === user.id ? "border-primary" : "border-transparent bg-muted"
                                        }`}>
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`}
                                            alt={user.name}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col items-start">
                                        <span className="font-bold text-sm">{user.name}</span>
                                        {user.isParent && (
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Parent
                                            </span>
                                        )}
                                    </div>
                                    {currentUser?.id === user.id && (
                                        <Check className="h-4 w-4" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {isAdding ? (
                            <form onSubmit={handleAddUser} className="mt-2 border-t border-muted p-2">
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    className="w-full rounded-lg border border-muted bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                    autoFocus
                                />
                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={!newUserName.trim()}
                                        className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted p-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
