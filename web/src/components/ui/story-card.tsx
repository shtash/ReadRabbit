/* eslint-disable @next/next/no-img-element */
import { Play } from "lucide-react";

interface StoryCardProps {
    title: string;
    category: string;
    color?: string;
    imageUrl?: string;
    onClick?: () => void;
}

export function StoryCard({ title, category, color, imageUrl, onClick }: StoryCardProps) {
    // Generate a theme-based gradient if no image provided
    const themeColors: Record<string, string> = {
        animals: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        space: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
        magic: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        school: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        adventure: "linear-gradient(135deg, #ff9a56 0%, #f57453 100%)",
        friendship: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
        custom: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    };

    const defaultColor = themeColors[category.toLowerCase()] || color || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

    return (
        <div
            className="group relative flex aspect-[4/5] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-xl md:rounded-3xl bg-muted p-4 transition-transform active:scale-95 hover:scale-[1.02]"
            onClick={onClick}
        >
            {/* Background Image or Gradient */}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={title}
                    className="absolute inset-0 z-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                />
            ) : (
                <div
                    className="absolute inset-0 z-0 opacity-80 transition-opacity group-hover:opacity-100"
                    style={{ background: defaultColor }}
                />
            )}

            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                    {category}
                </span>
                <h3 className="text-xl font-bold leading-tight text-white line-clamp-2">
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
