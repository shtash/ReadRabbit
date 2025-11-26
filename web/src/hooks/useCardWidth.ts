"use client";

import { useState, useEffect } from "react";
import { appConfig } from "@readrabbit/config";

/**
 * Custom hook to calculate card width based on viewport and configuration
 * 
 * @returns The calculated card width in pixels
 */
export function useCardWidth() {
    const [cardWidth, setCardWidth] = useState<number>(200); // Default fallback

    useEffect(() => {
        const calculateCardWidth = () => {
            // Get the container width (accounting for the viewport-based max-width)
            const viewportWidth = window.innerWidth;

            // Determine which config to use based on viewport width
            const isMobile = viewportWidth < appConfig.storyCards.mobileBreakpoint;
            const visibleCards = isMobile
                ? appConfig.storyCards.visibleOnMobile
                : appConfig.storyCards.visibleOnDesktop;

            // Calculate the effective container width
            // Account for the responsive max-width classes: md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]
            let containerWidth = viewportWidth;

            if (viewportWidth >= 1280) {
                // xl breakpoint
                containerWidth = Math.min(viewportWidth, viewportWidth * 0.6);
            } else if (viewportWidth >= 1024) {
                // lg breakpoint
                containerWidth = Math.min(viewportWidth, viewportWidth * 0.75);
            } else if (viewportWidth >= 768) {
                // md breakpoint
                containerWidth = Math.min(viewportWidth, viewportWidth * 0.85);
            }

            // Account for horizontal padding (px-6 = 24px on each side = 48px total)
            const horizontalPadding = 48;
            const availableWidth = containerWidth - horizontalPadding;

            // Calculate card width
            // Formula: (availableWidth - (visibleCards - 1) * gap) / visibleCards
            const gap = appConfig.storyCards.gap;
            const width = (availableWidth - (visibleCards - 1) * gap) / visibleCards;

            setCardWidth(Math.floor(width));
        };

        // Calculate on mount
        calculateCardWidth();

        // Recalculate on window resize
        window.addEventListener("resize", calculateCardWidth);

        return () => {
            window.removeEventListener("resize", calculateCardWidth);
        };
    }, []);

    return cardWidth;
}
