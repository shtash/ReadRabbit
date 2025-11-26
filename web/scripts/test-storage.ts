import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: "web/.env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function main() {
    console.log("Testing Convex Storage Upload...");
    try {
        const result = await client.action(api.debug.testStorageUpload);
        console.log("Test Result:", result);
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

main();
