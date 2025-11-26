import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: "web/.env.local" });

async function main() {
    console.log("Listing available models...");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is not set in web/.env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    // Note: listModels is not directly on GoogleGenerativeAI instance in some versions, 
    // but let's try to see if we can get it via the model manager or similar.
    // Actually, looking at the docs, it might be via a separate ModelService or just not exposed easily in the high-level SDK.
    // Let's try to just use a known older model 'gemini-pro' first in a separate test if this fails.
    // But wait, the error message said "Call ListModels".
    // In the Node SDK, it's often not exposed directly.

    // Let's try to just make a raw REST call to list models if the SDK doesn't support it easily.
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Failed to list models:", error);
    }
}

main();
