// Bulk delete old stories from the database
// Usage: npx convex run scripts/deleteOldStories

import { api } from "../convex/_generated/api";

// Replace these with the actual IDs from your Convex dashboard
const storyIdsToDelete = [
    "jx74..." as any, // Replace with actual IDs
    "jy7fwv2pg9y8l1HF..." as any,
    "jy7fwvV8Yvgx9BBz..." as any,
    "jy7fu0M3KHmDkb8..." as any,
    "jy7f0mb3a3Z9gH8..." as any,
    // Add more IDs as needed
];

export default async ({ runMutation }: any) => {
    console.log(`Deleting ${storyIdsToDelete.length} stories...`);

    const result = await runMutation(api.stories.bulkDeleteStories, {
        storyIds: storyIdsToDelete,
    });

    console.log("\nResults:");
    console.log(`- Total: ${result.total}`);
    console.log(`- Successful: ${result.successful}`);
    console.log(`- Failed: ${result.failed}`);

    if (result.failed > 0) {
        console.log("\nFailed deletions:");
        result.results
            .filter((r: any) => !r.success)
            .forEach((r: any) => {
                console.log(`  ${r.storyId}: ${r.error}`);
            });
    }

    return result;
};
