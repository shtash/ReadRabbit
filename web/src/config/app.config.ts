/**
 * ReadRabbit App Configuration
 * 
 * This file contains all configurable parameters for the ReadRabbit application.
 * Modify these values to adjust app behavior without changing code.
 */

export const appConfig = {
    /**
     * Story Card Display Settings
     */
    storyCards: {
        /**
         * Number of cards visible on mobile devices (can be fractional, e.g., 2.5)
         * This creates a "peek" effect showing part of the next card
         */
        visibleOnMobile: 3.5,

        /**
         * Number of cards visible on desktop devices (can be fractional, e.g., 4.5)
         */
        visibleOnDesktop: 4.5,

        /**
         * Maximum number of stories to show in each section on the home page
         */
        maxVisibleInSection: 10,

        /**
         * Gap between cards in pixels
         */
        gap: 16,

        /**
         * Breakpoint (in pixels) between mobile and desktop layouts
         */
        mobileBreakpoint: 768,
    },

    /**
     * Theme Settings
     */
    theme: {
        /**
         * Default theme mode: 'dark' | 'light' | 'white' | 'system'
         */
        defaultMode: 'dark' as 'dark' | 'light' | 'white' | 'system',

        /**
         * Available theme modes
         */
        modes: {
            dark: 'dark',
            light: 'light',
            white: 'white',
        } as const,
    },

    /**
     * Reading Experience Settings
     */
    reading: {
        /**
         * Auto-advance delay in milliseconds (0 = disabled)
         */
        autoAdvanceDelay: 0,

        /**
         * Enable text-to-speech
         */
        enableTTS: false,
    },

    /**
     * Quiz Settings
     */
    quiz: {
        /**
         * Number of questions per story
         */
        questionsPerStory: 1,

        /**
         * Time limit per question in seconds (0 = no limit)
         */
        timeLimitSeconds: 0,
    },

    /**
     * Rewards Settings
     */
    rewards: {
        /**
         * XP points per story completed
         */
        xpPerStory: 50,

        /**
         * XP points per correct quiz answer
         */
        xpPerCorrectAnswer: 10,
    },

    /**
     * Parent Dashboard Settings
     */
    parentDashboard: {
        /**
         * Width of child avatar cards relative to the grid column width (percentage)
         * This controls the size of the circular icons on desktop
         */
        childCardWidthPercentage: 80, // 60-90 works good

        /**
         * Maximum pixel size for the cropped face image (width and height)
         */
        maxFaceImageSize: 512,
    },

    layout: {
        /**
         * Standard container classes for the workspace area
         * Used to ensure consistent width across Parent Dashboard and related pages
         */
        workspaceContainer: "mx-auto min-h-screen w-full p-8 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]",
    },
} as const;

export type AppConfig = typeof appConfig;
