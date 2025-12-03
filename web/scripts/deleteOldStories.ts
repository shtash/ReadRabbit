// Bulk delete old stories from the database
// Usage: npx convex run scripts/deleteOldStories

import { api } from "../convex/_generated/api";

// Replace these with the actual IDs from your Convex dashboard
import { Id } from "../convex/_generated/dataModel";

// Replace these with the actual IDs from your Convex dashboard
const storyIdsToDelete: Id<"stories">[] = [
    // "jx74..." as Id<"stories">, // Replace with actual IDs
];

interface DeleteResult {
    storyId: Id<"stories">;
    success: boolean;
    error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deleteOldStories = async ({ runMutation }: any) => {
    if (storyIdsToDelete.length === 0) {
        console.log("No stories to delete. Update the script with IDs.");
        return;
    }

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
            .filter((r: DeleteResult) => !r.success)
            .forEach((r: DeleteResult) => {
                console.log(`  ${r.storyId}: ${r.error}`);
            });
    }

    return result;
};

export default deleteOldStories;
