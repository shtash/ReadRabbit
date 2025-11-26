This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# From the project root
npm run dev
```

This runs the frontend at [http://localhost:3000](http://localhost:3000).

**Backend Development (Convex):**

If you are modifying backend code (`web/convex/` folder) or the schema, you need to run the Convex dev server in a separate terminal:

```bash
# From the project root
npm run convex dev
```

This syncs your functions and regenerates types. You do **not** need this running if you are only working on the frontend.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deployment

**Deploying Backend Changes:**

When you modify backend code (`convex/` folder) and are ready to deploy to production:

```bash
# Must be run from the 'web' directory
npx convex deploy
```

This pushes your backend functions and schema to the production Convex deployment. Run this before deploying your frontend to ensure your production app uses the latest backend code.

## Configuration

App-wide settings (like card sizes, spacing, etc.) are centralized in `packages/config/app.config.ts`. Edit this file to adjust UI parameters across the app.

## Useful Commands

### Database & Backend Management

**Run Convex functions from terminal:**
```bash
npx convex run <function-path> '<json-args>'
```

**Bulk delete stories:**
```bash
# Option 1: Using the script (edit IDs first)
npx convex run scripts/deleteOldStories

# Option 2: One-liner with specific IDs
npx convex run api.stories.bulkDeleteStories '{"storyIds": ["id1", "id2"]}'
```

**Delete a single story (with all related data):**
```bash
npx convex run api.stories.deleteStory '{"storyId": "jx74..."}'
```

**Test story generation:**
```bash
npx convex run api.stories.testGeneration '{"theme": "animals"}'
```

### Database Inspection

**View all tables:**
Open Convex Dashboard → Data tab

**Query stories for a child:**
```bash
npx convex run api.stories.getStoriesForChild '{"childId": "child_id_here"}'
```

**Get child profiles:**
```bash
npx convex run api.children.getChildren
```

### Development Tips

- Functions in `convex/*.ts` are automatically deployed when Convex dev is running
- Use `console.log()` in Convex functions to see logs in the terminal running `npm run convex dev`
- Schema changes require restarting `npm run convex dev`
- Scripts in `scripts/` folder can be run with `npx convex run scripts/<filename>`



## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
