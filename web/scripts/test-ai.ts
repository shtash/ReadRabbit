import { GoogleStoryGenerator } from "../convex/ai/providers/google";
import { StoryGenerationParams } from "@readrabbit/domain";
import dotenv from "dotenv";

dotenv.config({ path: "web/.env.local" });

async function main() {
    console.log("Testing Google Story Generator...");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in .env.local");
        process.exit(1);
    }

    const generator = new GoogleStoryGenerator();
    const params: StoryGenerationParams = {
        theme: "space",
        age: 6,
        readingLevel: "emerging",
        interests: ["rockets", "aliens"],
        characters: [{ name: "Robo", type: "friend" }],
    };

    try {
        const story = await generator.generateStory(params);
        console.log("Successfully generated story:");
        console.log(JSON.stringify(story, null, 2));
    } catch (error) {
        console.error("Failed to generate story:", error);
    }
}

main();
