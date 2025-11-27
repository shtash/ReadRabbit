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
    coverImagePrompt?: string;
    pages: {
        text: string;
        illustrationPrompt?: string;
    }[];
    quizQuestions?: {
        question: string;
        options: string[];
        correctAnswerIndex: number;
    }[];
}

export interface ImageGenerationParams {
    prompt: string;
    aspectRatio?: '1:1' | '4:3' | '16:9';
}

export interface StoryGenerator {
    generateStory(params: StoryGenerationParams): Promise<GeneratedStory>;
}

export interface ImageGenerator {
    generateImage(params: ImageGenerationParams): Promise<string>;
}
