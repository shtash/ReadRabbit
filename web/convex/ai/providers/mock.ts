import {
    StoryGenerator,
    ImageGenerator,
    StoryGenerationParams,
    GeneratedStory,
    ImageGenerationParams
} from "@readrabbit/domain";

export class MockStoryGenerator implements StoryGenerator {
    async generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
        console.log("[Mock] Generating story with params:", {
            ...params,
            wordCount: params.wordCount,
            pageCount: params.pageCount
        });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

        return {
            title: `The ${params.theme} Adventure`,
            pages: [
                {
                    text: `Once upon a time, a brave rabbit went on a ${params.theme} adventure.`,
                    illustrationPrompt: `A rabbit in a ${params.theme} setting`
                },
                {
                    text: "They found something amazing!",
                    illustrationPrompt: "A rabbit discovering a treasure"
                },
                {
                    text: "It was the best day ever.",
                    illustrationPrompt: "A happy rabbit celebrating"
                },
            ],
        };
    }
}

export class MockImageGenerator implements ImageGenerator {
    async generateImage(params: ImageGenerationParams): Promise<string> {
        console.log("[Mock] Generating image with params:", params);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        // Return a placeholder image based on the prompt keywords if possible, or a generic one
        if (params.prompt.includes("animal")) return "/placeholder-category-animals.png";
        if (params.prompt.includes("space")) return "/placeholder-category-space.png";
        if (params.prompt.includes("magic")) return "/placeholder-category-magic.png";

        return "/placeholder-image.png";
    }
}
