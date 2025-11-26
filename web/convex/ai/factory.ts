import { appConfig } from "@readrabbit/config";
import { StoryGenerator, ImageGenerator, AIProviderType } from "@readrabbit/domain";
import { MockStoryGenerator, MockImageGenerator } from "./providers/mock";
import { GoogleStoryGenerator, GoogleImageGenerator } from "./providers/google";

export class AIProviderFactory {
    private static instance: AIProviderFactory;

    private constructor() { }

    public static getInstance(): AIProviderFactory {
        if (!AIProviderFactory.instance) {
            AIProviderFactory.instance = new AIProviderFactory();
        }
        return AIProviderFactory.instance;
    }

    public getStoryGenerator(): StoryGenerator {
        const provider = appConfig.ai.provider as AIProviderType;
        switch (provider) {
            case 'google':
                return new GoogleStoryGenerator();
            case 'mock':
                return new MockStoryGenerator();
            default:
                console.warn(`Provider ${provider} not implemented for StoryGenerator, falling back to mock`);
                return new MockStoryGenerator();
        }
    }

    public getImageGenerator(): ImageGenerator {
        const provider = appConfig.ai.provider as AIProviderType;
        switch (provider) {
            case 'google':
                return new GoogleImageGenerator();
            case 'mock':
                return new MockImageGenerator();
            default:
                console.warn(`Provider ${provider} not implemented for ImageGenerator, falling back to mock`);
                return new MockImageGenerator();
        }
    }
}
