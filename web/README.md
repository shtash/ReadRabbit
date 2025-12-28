This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Setup from Scratch

Follow these steps to set up the ReadRabbit project on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/shtash/ReadRabbit.git
cd ReadRabbit
```

### 2. Install Dependencies

This is a monorepo project using pnpm workspaces. Install all dependencies from the project root:

```bash
pnpm install
```

This will install dependencies for:
- The main web application (`web/`)
- All shared packages (`packages/*`)

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Convex (Backend)
CONVEX_DEPLOYMENT=your-convex-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-public-convex-url

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Optional: AI Services
OPENAI_API_KEY=your-openai-api-key
NANO_BANANA_API_KEY=your-nano-banana-api-key
```

**Where to get these values:**

- **Convex**: Sign up at [convex.dev](https://convex.dev), create a new project, and find your deployment URLs in Settings → URL & Deploy Key
- **Clerk**: Sign up at [clerk.com](https://clerk.com), create a new application, and find your API keys in the dashboard
- **OpenAI**: Get an API key from [platform.openai.com](https://platform.openai.com)
- **Nano Banana**: Get an API key from your Nano Banana account (if using this service)

### 4. Initialize Convex

Set up your Convex backend:

```bash
# Login to Convex (first time only)
npx convex login

# Initialize and deploy your Convex functions
pnpm run convex dev
```

This will:
- Create your Convex project (if it doesn't exist)
- Deploy your database schema and functions
- Start watching for changes

Keep this terminal running during development if you're working on backend code.

### 5. Verify Setup

You're ready to start developing! Proceed to the "Getting Started" section below to run the development server.

## Getting Started

First, run the development server:

```bash
# From the project root
pnpm run dev
```

This runs the frontend at [http://localhost:3000](http://localhost:3000).

**Backend Development (Convex):**

If you are modifying backend code (`web/convex/` folder) or the schema, you need to run the Convex dev server in a separate terminal:

```bash
# From the project root
pnpm run convex dev
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
- Use `console.log()` in Convex functions to see logs in the terminal running `pnpm run convex dev`
- Schema changes require restarting `pnpm run convex dev`
- Scripts in `scripts/` folder can be run with `npx convex run scripts/<filename>`



## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
