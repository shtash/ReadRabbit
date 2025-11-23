# Deployment Guide for ReadRabbit (Web)

This guide outlines the steps to deploy the ReadRabbit web application (located in the `web` directory) to Vercel.

## Prerequisites

1.  **Git Repository**: Ensure your code is pushed to a remote Git repository (GitHub, GitLab, or Bitbucket).
2.  **Vercel Account**: You need a Vercel account linked to your Git provider.
3.  **Convex Project**: You should have a Convex project set up (which you already do).
4.  **Clerk Project**: You should have a Clerk project set up.

## Step 1: Import Project in Vercel

1.  Log in to your Vercel dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your Git repository (`ReadRabbit` or your repo name).
4.  Click **"Import"**.

## Step 2: Configure Project Settings

This is the most critical step because your project is in a subdirectory (`web`).

1.  **Framework Preset**: Vercel should automatically detect **Next.js**. If not, select it.
2.  **Root Directory**:
    *   Click **"Edit"** next to Root Directory.
    *   Select the **`web`** folder.
    *   Click **"Continue"**.
    *   *Note: This tells Vercel to run build commands from the `web` directory.*

## Step 3: Environment Variables

You need to add the environment variables from your `.env.local` file to Vercel.

Expand the **"Environment Variables"** section and add the following:

| Key | Value Source |
|-----|--------------|
| `CONVEX_DEPLOYMENT` | Your Production Convex Deployment URL (from Convex Dashboard) |
| `NEXT_PUBLIC_CONVEX_URL` | Your Production Public Convex URL (from Convex Dashboard) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard (API Keys) |
| `CLERK_SECRET_KEY` | Clerk Dashboard (API Keys) |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk Dashboard (if used) |
| `OPENAI_API_KEY` | OpenAI (if used for AI features) |
| `NANO_BANANA_API_KEY` | Nano Banana (if used) |

> **Tip**: For `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`, make sure you use the **Production** values, not the Development ones. You can find these in the Convex Dashboard under Settings > URL & Deploy Key.

## Step 4: Deploy

1.  Click **"Deploy"**.
2.  Vercel will clone the repo, install dependencies, and build the project.
3.  If the build succeeds, you will see a success screen with your deployment URL.

## Step 5: Convex Production Deployment

Your code deployment is separate from your database (Convex) deployment. You need to push your Convex schema and functions to the production environment.

**Option A: Manual Deployment (Recommended for first time)**
Run this command in your local terminal (inside the `web` directory):
```bash
npx convex deploy
```
This will push your functions and schema to the production Convex instance configured in your project.

**Option B: Vercel Integration**
You can install the **Convex integration** on Vercel to automatically deploy Convex functions when you push to Git.
1.  Go to the Vercel Project Settings > Integrations.
2.  Search for "Convex" and install it.
3.  Connect it to your Convex project.

## Troubleshooting

### Monorepo / Workspace Issues
Since this is a monorepo, if the build fails complaining about missing modules (e.g., `@readrabbit/ui`), ensure that Vercel is installing dependencies correctly.
*   Vercel usually handles npm workspaces automatically.
*   If you see errors about importing local packages, you might need to add `transpilePackages` to your `next.config.ts`:

```typescript
// web/next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ['@readrabbit/ui', '@readrabbit/domain', '@readrabbit/config'],
  // ... other config
};
```

### Build Command
Ensure the Build Command in Vercel is set to default (`next build`). Since the Root Directory is `web`, this will run `next build` inside the `web` folder, which is correct.
