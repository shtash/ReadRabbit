import { BottomNav } from "@/components/ui/bottom-nav";
import { StoryCard } from "@/components/ui/story-card";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
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
  ];

  return (
    <div className="mx-auto min-h-screen w-full bg-background pb-24 font-sans text-foreground shadow-2xl selection:bg-primary/20 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]">
      {/* Header / Welcome */}
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Hi, <span className="text-primary">Alex!</span> 👋
            </h1>
            <p className="text-muted-foreground font-medium">Ready for a story?</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary bg-muted">
            {/* Avatar Placeholder */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
              alt="Profile"
              className="h-full w-full object-cover"
            />
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
            <button className="text-sm font-bold text-primary transition-colors hover:text-primary/80">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {stories.map((story, index) => (
              <StoryCard
                key={index}
                title={story.title}
                category={story.category}
                color={story.color}
              />
            ))}
          </div>
        </section>

        {/* Community Content */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Community Content
            </h2>
            <button className="text-sm font-bold text-primary transition-colors hover:text-primary/80">
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {communityStories.map((story, index) => (
              <StoryCard
                key={index}
                title={story.title}
                category={story.category}
                color={story.color}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
