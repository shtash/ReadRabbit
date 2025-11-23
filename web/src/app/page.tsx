"use client";

import { BottomNav } from "@/components/ui/bottom-nav";
import { StoryCard } from "@/components/ui/story-card";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useCardWidth } from "@/hooks/useCardWidth";
import { appConfig } from "@/config/app.config";
import { useState, useEffect } from "react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

export default function Home() {
  const cardWidth = useCardWidth();
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-create user in Convex on first sign-in
  useEffect(() => {
    const createUser = async () => {
      if (isLoaded && clerkUser && !convexUser) {
        console.log("🔵 Attempting to create Convex user...", {
          clerkEmail: clerkUser.emailAddresses[0]?.emailAddress,
          clerkId: clerkUser.id,
        });
        try {
          const result = await getOrCreateUser();
          console.log("✅ Convex user created:", result);
        } catch (error) {
          console.error("❌ Failed to create Convex user:", error);
        }
      }
    };
    createUser();
  }, [isLoaded, clerkUser, convexUser, getOrCreateUser]);
  const stories = [
    {
      title: "The Rabbit's Moon Adventure",
      category: "Space",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Benny's Big Carrot Hunt",
      category: "Adventure",
      color: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    },
    {
      title: "The Magic Forest Party",
      category: "Magic",
      color: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    },
    {
      title: "School Day Surprise",
      category: "School",
      color: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    },
    {
      title: "Rocket to Mars",
      category: "Space",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Ocean Friends",
      category: "Ocean",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "The Brave Knight",
      category: "Fantasy",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      title: "Dinosaur Discovery",
      category: "Prehistoric",
      color: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    },
    {
      title: "Pizza Party",
      category: "Food",
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    },
    {
      title: "The Lost Puppy",
      category: "Animals",
      color: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    },
  ];

  const communityStories = [
    {
      title: "Dragon's Lost Tooth",
      category: "Fantasy",
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    },
    {
      title: "Space Cat's Journey",
      category: "Space",
      color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    },
    {
      title: "The Friendly Ghost",
      category: "Spooky",
      color: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
    },
    {
      title: "Underwater Tea Party",
      category: "Ocean",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Robot's First Day",
      category: "Sci-Fi",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "The Magic Paintbrush",
      category: "Art",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Pirate Treasure Hunt",
      category: "Adventure",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      title: "The Singing Tree",
      category: "Nature",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      title: "Superhero Training",
      category: "Action",
      color: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
    },
    {
      title: "The Time Machine",
      category: "Sci-Fi",
      color: "linear-gradient(135deg, #5f27cd 0%, #341f97 100%)",
    },
  ];

  // Show onboarding for new users
  useEffect(() => {
    if (isLoaded && clerkUser && convexUser) {
      if (!convexUser.onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [isLoaded, clerkUser, convexUser]);

  // Get display name
  const displayName = clerkUser?.firstName || clerkUser?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'there';

  return (
    <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Header / Welcome */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              <SignedOut>
                Welcome! <span className="text-primary">👋</span>
              </SignedOut>
              <SignedIn>
                Hi, <span className="text-primary">{displayName}!</span> 👋
              </SignedIn>
            </h1>
            <p className="text-muted-foreground font-medium">Ready for a story?</p>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full border-2 border-primary px-4 py-2 text-sm font-bold text-primary transition-transform hover:scale-105 active:scale-95">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/parent">
                <button className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:scale-105 active:scale-95">
                  Parent Dashboard
                </button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-8 px-6">
        {/* Hero Action */}
        <section>
          <Link href="/read">
            <div className="group relative w-full overflow-hidden rounded-[2rem] bg-primary p-8 text-left shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 active:scale-95">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Start New
                  </span>
                </div>
                <h2 className="text-4xl font-black text-primary-foreground">
                  Let's read!
                </h2>
                <p className="max-w-[200px] text-lg font-medium text-primary-foreground/80">
                  Pick a topic and create a magic story.
                </p>
              </div>

              {/* Decorative Circles */}
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl transition-transform group-hover:scale-150" />
              <div className="absolute -bottom-8 right-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
            </div>
          </Link>
        </section>

        {/* Stories of the Day */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Stories of the day
            </h2>
            <Link href="/stories-of-the-day" className="text-sm font-bold text-primary transition-colors hover:text-primary/80">
              See more
            </Link>
          </div>

          <div className="-mx-6 overflow-x-auto px-6 scrollbar-hide">
            <div className="flex gap-4 pb-2">
              {stories.slice(0, appConfig.storyCards.maxVisibleInSection).map((story, index) => (
                <div key={index} style={{ width: `${cardWidth}px` }} className="flex-shrink-0">
                  <StoryCard
                    title={story.title}
                    category={story.category}
                    color={story.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Content */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Community Content
            </h2>
            <Link href="/community-content" className="text-sm font-bold text-primary transition-colors hover:text-primary/80">
              See more
            </Link>
          </div>

          <div className="-mx-6 overflow-x-auto px-6 scrollbar-hide">
            <div className="flex gap-4 pb-2">
              {communityStories.slice(0, appConfig.storyCards.maxVisibleInSection).map((story, index) => (
                <div key={index} style={{ width: `${cardWidth}px` }} className="flex-shrink-0">
                  <StoryCard
                    title={story.title}
                    category={story.category}
                    color={story.color}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
