import { Play } from "lucide-react";

interface StoryCardProps {
    title: string;
    category: string;
    color: string;
    image?: string; // Placeholder for now
}

export function StoryCard({ title, category, color }: StoryCardProps) {
    return (
        <div className="group relative flex aspect-[4/5] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-xl md:rounded-3xl bg-muted p-4 transition-transform active:scale-95">
            {/* Background Placeholder (Gradient for now) */}
            <div
                className="absolute inset-0 z-0 opacity-80 transition-opacity group-hover:opacity-100"
                style={{ background: color }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                    {category}
                </span>
                <h3 className="text-xl font-bold leading-tight text-white">
                    {title}
                </h3>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform group-hover:scale-110">
                <Play className="h-5 w-5 fill-white text-white" />
            </div>
        </div>
    );
}
