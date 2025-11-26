import {
    StoryGenerator,
    ImageGenerator,
    StoryGenerationParams,
    GeneratedStory,
    ImageGenerationParams
} from "@readrabbit/domain";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { appConfig } from "@readrabbit/config";

export class GoogleStoryGenerator implements StoryGenerator {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
        const model = this.genAI.getGenerativeModel({
            model: appConfig.ai.textModel,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `
            You are a children's book author. Write a story with the following parameters:
            - Theme: ${params.theme}
            - Age Group: ${params.age} years old
            - Reading Level: ${params.readingLevel}
            - Interests: ${params.interests.join(", ")}
            ${params.characters ? `- Characters: ${params.characters.map(c => `${c.name} (${c.type})`).join(", ")}` : ""}
            ${params.customPrompt ? `- Custom Request: ${params.customPrompt}` : ""}

            Output the story as a JSON object with this exact structure:
            {
                "title": "Story Title",
                "coverImagePrompt": "A highly descriptive prompt for an AI image generator to create a cover image. It should describe a specific scene capturing an important event in the story, including the appearance of the main characters and the setting. Style: colorful, friendly, storybook illustration.",
                "pages": [
                    {
                        "text": "Page text...",
                        "illustrationPrompt": "Description for the illustration..."
                    }
                ]
            }
            Create 3-5 pages. Ensure the content is safe, age-appropriate, and engaging.
            For the illustration description, pick out an important scene from the story and describe an image to go along with it. Make sure any characters' age and gender and/or any animal types match the story. It should be depict a scene from the story, not the characters posing.  No text.
        `;

        console.log("Generating story with prompt:", prompt);

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log("AI Response:", text);

            const storyData = JSON.parse(text) as GeneratedStory;

            if (!storyData.pages || !Array.isArray(storyData.pages) || storyData.pages.length === 0) {
                console.error("Invalid story structure:", storyData);
                throw new Error("Generated story has no pages");
            }

            return storyData;
        } catch (error) {
            console.error("Story generation failed:", error);
            throw error;
        }
    }
}

export class GoogleImageGenerator implements ImageGenerator {
    // Note: As of now, Imagen generation might require a specific REST call or updated SDK usage.
    // For this implementation, we will assume a REST call pattern if the SDK doesn't directly support 'imagen-3.0' via getGenerativeModel in the same way for images.
    // However, Google's generative-ai node SDK is evolving. 
    // If the SDK supports it directly, we would use it. 
    // For now, I'll implement a placeholder that warns if the key is missing, 
    // and we might need to adjust this to use the specific Imagen endpoint.

    private apiKey: string;

    constructor() {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
        }
        this.apiKey = apiKey;
    }

    async generateImage(params: ImageGenerationParams): Promise<string> {
        // Imagen 3/4 via Gemini API (REST)
        // https://ai.google.dev/gemini-api/docs/imagen

        const model = appConfig.ai.useFastImageModel ? appConfig.ai.imageModelFast : appConfig.ai.imageModel;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${this.apiKey}`;

        const payload = {
            instances: [
                {
                    prompt: params.prompt,
                }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: params.aspectRatio === '1:1' ? '1:1' : '4:3',
                // Note: Check supported aspect ratios for the specific model. 
                // Imagen 3 supports '1:1', '3:4', '4:3', '16:9', '9:16'.
            }
        };

        console.log(`[GoogleImageGenerator] Generating image with model ${model}...`);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Google Image API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            // The response structure for Imagen on Vertex AI / Gemini API varies.
            // Typically: { predictions: [ { bytesBase64Encoded: "..." } ] }
            // or { predictions: [ { mimeType: "image/png", bytesBase64Encoded: "..." } ] }

            if (data.predictions && data.predictions.length > 0) {
                const prediction = data.predictions[0];
                const base64Image = prediction.bytesBase64Encoded;
                const mimeType = prediction.mimeType || "image/png";

                // For now, return the base64 data URI. 
                // In a real app, we should upload this to Convex storage and return the URL.
                return `data:${mimeType};base64,${base64Image}`;
            } else {
                console.error("Unexpected image response:", JSON.stringify(data, null, 2));
                throw new Error("No image data in response");
            }

        } catch (error: any) {
            console.error("Image generation failed:", error);

            // Fallback for billing error or other failures
            if (error.message.includes("billed users")) {
                console.warn("[GoogleImageGenerator] Billing required for Imagen. Returning placeholder.");
                return "https://placehold.co/1024x1024/purple/white?text=Reward+Image+(Billing+Required)";
            }

            throw error;
        }
    }
}
