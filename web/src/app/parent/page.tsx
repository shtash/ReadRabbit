"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function ParentDashboard() {
    const { user } = useUser();
    const children = useQuery(api.children.getChildren);
    const createChild = useMutation(api.children.createChild);

    const [newChildName, setNewChildName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createChild({
                name: newChildName,
                age: 5, // Default for now
                readingLevel: "emerging",
                interests: [],
                avatarId: "rabbit_1",
            });
            setNewChildName("");
        } catch (error) {
            console.error("Failed to create child:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="container mx-auto p-8">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Parent Dashboard</h1>
                <Link href="/" className="text-primary hover:underline">
                    Back to Home
                </Link>
            </header>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Children List */}
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Your Children</h2>
                    {children === undefined ? (
                        <p>Loading...</p>
                    ) : children.length === 0 ? (
                        <p className="text-muted-foreground">No children profiles yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {children.map((child) => (
                                <li key={child._id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-bold">{child.name}</p>
                                        <p className="text-sm text-muted-foreground">Age: {child.age}</p>
                                    </div>
                                    <Link href={`/profile/${child._id}`}>
                                        <button className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                                            Manage
                                        </button>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Add Child Form */}
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Add a Child</h2>
                    <form onSubmit={handleCreateChild} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={newChildName}
                                onChange={(e) => setNewChildName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full rounded-md bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isCreating ? "Creating..." : "Add Child"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
