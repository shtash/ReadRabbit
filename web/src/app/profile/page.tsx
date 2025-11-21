import Link from "next/link";
import { User, Plus } from "lucide-react";

export default function ProfilePage() {
    const profiles = [
        { id: "1", name: "Alex", color: "bg-blue-500" },
        { id: "2", name: "Sam", color: "bg-green-500" },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 font-sans text-foreground">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight">Who is reading?</h1>
                    <p className="text-muted-foreground">Choose your profile to start.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {profiles.map((profile) => (
                        <Link
                            key={profile.id}
                            href="/"
                            className="group flex flex-col items-center gap-3"
                        >
                            <div
                                className={`flex h-32 w-32 items-center justify-center rounded-full ${profile.color} shadow-xl transition-transform group-hover:scale-105 group-active:scale-95`}
                            >
                                <User className="h-16 w-16 text-white" />
                            </div>
                            <span className="text-xl font-bold group-hover:text-primary">
                                {profile.name}
                            </span>
                        </Link>
                    ))}

                    {/* Add Profile Button */}
                    <button className="group flex flex-col items-center gap-3">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-muted-foreground/30 bg-muted/30 transition-colors group-hover:border-primary/50 group-hover:bg-primary/5">
                            <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-xl font-bold text-muted-foreground group-hover:text-primary">
                            Add New
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
