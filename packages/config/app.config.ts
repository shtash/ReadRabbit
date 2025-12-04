// Shared config
export const APP_NAME = "ReadRabbit";

export const appConfig = {
    /**
     * Story Card Display Settings
     */
    storyCards: {
        visibleOnMobile: 3.5,
        visibleOnDesktop: 4.5,
        maxVisibleInSection: 10,
        gap: 16,
        mobileBreakpoint: 768,
    },

    /**
     * Theme Settings
     */
    theme: {
        defaultMode: 'dark' as 'dark' | 'light' | 'white' | 'system',
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
        autoAdvanceDelay: 0,
        enableTTS: false,
    },

    /**
     * Quiz Settings
     */
    quiz: {
        questionsPerStory: 1,
        timeLimitSeconds: 0,
    },

    /**
     * Rewards Settings
     */
    rewards: {
        xpPerStory: 50,
        xpPerCorrectAnswer: 10,
    },

    /**
     * Parent Dashboard Settings
     */
    parentDashboard: {
        childCardWidthPercentage: 80,
        maxFaceImageSize: 512,
    },

    layout: {
        workspaceContainer: "mx-auto min-h-screen w-full p-8 md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[60vw]",
    },

    /**
     * AI Provider Settings
     */
    ai: {
        provider: 'google' as 'google' | 'openai' | 'mock',
        // Text Generation Model
        textModel: 'gemini-2.5-flash', // or 'gemini-1.5-pro'

        // Image Generation Model
        // Options: 'imagen-4.0-ultra-generate-preview-06-06' ("Nano Banana Pro") or 'imagen-4.0-generate-preview-06-06' ("Nano Banana")
        imageModel: 'imagen-4.0-ultra-generate-preview-06-06',
        imageModelFast: 'imagen-4.0-generate-preview-06-06',
        useFastImageModel: true, // Toggle this to switch
    },

    /**
     * Scroller Momentum Settings
     */
    scrollerMomentum: {
        enabled: true,           // Toggle momentum on/off
        friction: 0.92,          // How quickly momentum slows (0.90-0.98, higher = more slide)
        minVelocity: 0.1,        // Velocity threshold to stop animation (pixels/ms)
        velocitySmoothing: 0.5,  // Smoothing factor for velocity (0-1, higher = more responsive)
    },
} as const;

export type AppConfig = typeof appConfig;
