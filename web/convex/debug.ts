import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const generateUploadUrl = internalMutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const testStorageUpload = action({
    args: {},
    handler: async (ctx): Promise<{ success: boolean; storageId: string; url: string | null }> => {
        console.log("Starting storage upload test...");

        // 1. Generate Upload URL
        const uploadUrl = await ctx.runMutation(internal.debug.generateUploadUrl);
        console.log("Generated upload URL:", uploadUrl);

        // 2. Create a dummy image blob (1x1 pixel transparent GIF)
        const base64Data = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        const mimeType = "image/gif";

        // Manual base64 to Blob conversion since fetch(data:...) is not supported
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mimeType });

        console.log("Created blob:", blob.size, blob.type);

        // 3. Upload to Storage
        const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
        });

        if (!result.ok) {
            throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
        }

        const { storageId } = await result.json();
        console.log("Upload successful. StorageId:", storageId);

        // 4. Verify URL generation
        const url = await ctx.runMutation(internal.debug.getStorageUrl, { storageId });
        console.log("Generated Storage URL:", url);

        return { success: true, storageId, url };
    },
});

export const getStorageUrl = internalMutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});
