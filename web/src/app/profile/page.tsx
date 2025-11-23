"use client";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
    const { currentUser } = useUser();

    return (
        <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Profile
                </h1>
            </header>

            <main className="px-6 flex flex-col gap-8">
                {/* User Info */}
                <section className="flex items-center gap-4 rounded-2xl bg-card p-6 border border-muted">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary bg-muted">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.avatarSeed || 'default'}`}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{currentUser?.name || 'Guest'}</h2>
                        {currentUser?.isParent && (
                            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                PARENT ACCOUNT
                            </span>
                        )}
                    </div>
                </section>

                {/* Settings */}
                <section className="flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-foreground">Settings</h3>

                    <div className="rounded-2xl bg-card p-6 border border-muted flex flex-col gap-4">
                        <div>
                            <h4 className="font-bold mb-2">Appearance</h4>
                            <ThemeSwitcher />
                        </div>
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
}
