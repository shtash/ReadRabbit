import { query } from "./_generated/server";

// Placeholder for category tiles. In real implementation, this might fetch from DB or generate via AI.
export const getCategoryTiles = query({
    args: {},
    handler: async () => {
        return [
            {
                id: "cat_animals",
                theme: "animals",
                title: "Animal Adventures",
                description: "Fun stories with furry friends",
                imageUrl: "/placeholder-category-animals.png", // TODO: Replace with Nano Banana image
            },
            {
                id: "cat_space",
                theme: "space",
                title: "Space Explorers",
                description: "Blast off into the stars",
                imageUrl: "/placeholder-category-space.png",
            },
            {
                id: "cat_magic",
                theme: "magic",
                title: "Magic & Spells",
                description: "Wizards, fairies, and magic potions",
                imageUrl: "/placeholder-category-magic.png",
            },
        ];
    },
});
