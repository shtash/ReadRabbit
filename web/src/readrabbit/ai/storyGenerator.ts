export interface StoryGenerationParams {
    theme: string;
    age: number;
    readingLevel: string;
    interests: string[];
    characters?: { name: string; type: string }[];
    customPrompt?: string;
}

export interface GeneratedStory {
    title: string;
    pages: {
        text: string;
        illustrationPrompt?: string;
    }[];
}

export async function generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
    // TODO: Implement actual AI call (OpenAI, Anthropic, etc.)
    console.log("Generating story with params:", params);

    // Mock response
    return {
        title: "The Mock Adventure",
        pages: [
            { text: "Once upon a time...", illustrationPrompt: "A rabbit in a forest" },
            { text: "They found a carrot.", illustrationPrompt: "A giant carrot" },
        ],
    };
}
