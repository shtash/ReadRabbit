import { GoogleImageGenerator } from "../convex/ai/providers/google";
import { ImageGenerationParams } from "@readrabbit/domain";
import dotenv from "dotenv";

dotenv.config({ path: "web/.env.local" });

async function main() {
    console.log("Testing Google Image Generator...");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in web/.env.local");
        process.exit(1);
    }

    const generator = new GoogleImageGenerator();
    const params: ImageGenerationParams = {
        prompt: "A happy robot playing in space with a red rocket ship. Cartoon style, colorful.",
        aspectRatio: "1:1",
    };

    try {
        const imageUrl = await generator.generateImage(params);
        console.log("Successfully generated image.");

        if (imageUrl.startsWith("data:image")) {
            const fs = require("fs");
            const path = require("path");
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const outputPath = path.join(process.cwd(), "web", "public", "test-image.png");

            fs.writeFileSync(outputPath, buffer);
            console.log(`Image saved to: ${outputPath}`);
        } else {
            console.log("Image URL:", imageUrl);
        }
    } catch (error) {
        console.error("Failed to generate image:", error);
    }
}

main();
