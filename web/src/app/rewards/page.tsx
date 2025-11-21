import Link from "next/link";
import { ArrowLeft, Award, Star, Trophy } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function RewardsPage() {
    const badges = [
        { id: 1, name: "First Story", icon: Star, color: "bg-yellow-400" },
        { id: 2, name: "Bookworm", icon: Award, color: "bg-blue-500" },
        { id: 3, name: "Quiz Master", icon: Trophy, color: "bg-purple-500" },
    ];

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="flex items-center gap-4 px-6 pt-12 pb-6">
                <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                        Your Rewards
                    </h1>
                </div>
            </header>

            <main className="px-6">
                <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary to-orange-600 p-8 text-white shadow-xl shadow-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black">Level 3</h2>
                            <p className="text-white/80">Super Reader</p>
                        </div>
                    </div>
                    <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-black/20">
                        <div className="h-full w-[70%] rounded-full bg-white" />
                    </div>
                    <p className="mt-2 text-right text-sm font-bold text-white/80">
                        350 / 500 XP
                    </p>
                </div>

                <h2 className="mb-4 text-xl font-bold">Badges</h2>
                <div className="grid grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-sm dark:bg-card/50"
                        >
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-full ${badge.color} text-white shadow-md`}
                            >
                                <badge.icon className="h-8 w-8" />
                            </div>
                            <span className="text-sm font-bold leading-tight">
                                {badge.name}
                            </span>
                        </div>
                    ))}

                    {/* Locked Badges */}
                    {[1, 2, 3].map((i) => (
                        <div
                            key={`locked-${i}`}
                            className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 p-4 text-center opacity-50 grayscale"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted-foreground/20 shadow-inner">
                                <Award className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-bold leading-tight text-muted-foreground">
                                Locked
                            </span>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
