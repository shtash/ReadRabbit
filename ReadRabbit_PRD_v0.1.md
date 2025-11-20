# ReadRabbit – Product Requirements Document (PRD)
**Version 0.1 – with Nano Banana image personalization**

---

## 0. Audience & Intent

This PRD is for:

- **You (founder/dev)** – building a kids’ reading app with a modern stack that cleanly transitions from web to mobile.
- **AI pair coders** – Cursor, Claude Code, ChatGPT, etc., that will scaffold and extend the app.
- **Future collaborators** – designers/devs/educators who need a stable reference for what ReadRabbit is.

It should:

- Explain what **ReadRabbit** is and who it’s for.
- Capture the **AI Story Mode** as the first, focused experience.
- Lock in a **stack and file structure** that make the web app → React Native transition straightforward.
- Be concrete enough that AI tools can safely generate code and keep things consistent.

**Tone**: clear, direct, mildly playful, kid-aware, but precise.

---

## 1. Product Summary

### One-liner  
**ReadRabbit** helps kids learn to read through personalized AI-made stories, read-aloud assistance, and fun rewards that make reading feel like a game.

### High-level

1. Kid (through a parent-managed account) creates a profile with age, avatar, and interests.
2. In **AI Story Mode**:
   - The kid picks what kind of story they want (theme, whether they appear in it, and length).
   - The app shows several **visual categories** with cool AI-generated cover images (using Google’s Nano Banana image model) and the kid taps one.
   - ReadRabbit generates a **short, level-appropriate story** plus illustrations.
   - If enabled by the parent and chosen by the kid, the story’s images can include the kid’s likeness.
3. While reading:
   - The kid **taps words** they don’t know to hear them.
   - They can also have sentences or whole pages read aloud, with optional word highlighting.
4. At the end:
   - The kid gets a **reward** (illustration, badge, points/carrots, etc.).
   - They answer a few **simple comprehension questions**.
5. Behind the scenes:
   - We **track progress** (stories completed, quiz performance, problematic words).
   - Parents see high-level usage and progress.
6. Implementation order:
   1. Clickable flow.
   2. Real AI (text + Nano Banana images) + Auth + DB.
   3. Styling & kid-UX polish.
   4. Mobile app with shared core logic.

### Primary goals

- Help kids **build reading fluency + confidence** in a playful, self-directed way.
- Make **reading feel like a fun mission**, not homework.
- Serve as a **learning playground** for mastering full-stack web → mobile with modern tools.
- Be architected so AI pair coders can safely assist without chaos.
- Leverage **Google’s Nano Banana image model** for:
  - Eye-catching story category tiles.
  - Story illustrations.
  - (Optional, with consent) personalized illustrations that include the child.

---

## 2. Motivation & Principles

### 2.1 Learning-first, kid-first

- Stack must be:
  - Modern and production-ready.
  - Understandable to you.
  - Structured so AI tools don’t mangle everything.
- Product must:
  - Be safe and appropriate for kids.
  - Work equally well on **desktop and mobile web**.
  - Be simple enough for a child to navigate with minimal reading of the UI itself.

### 2.2 Development Flow

We front-load a **clickable kid flow** and the **AI story loop** so something magical works early.

**Web app stages:**

1. **Flow Skeleton (Click-through)**  
   All key routes/pages (landing, story mode, profile, parent area) exist and are clickable end-to-end. No real backend.

2. **Real Integration (AI + Nano Banana + Auth + DB)**  
   Wire AI Story Mode to:
   - Generate real stories & quizzes.
   - Generate category tile images and story illustrations via Nano Banana.
   - Optionally support child-in-image personalization.
   - Use real auth and data persistence.

3. **Styling, UX & Production Hardening**  
   Add Tailwind, kid-friendly visuals, transitions, loaders, error states, and safety checks.

**Mobile app later:**

4. **React Native / Expo Client**  
   Use the same backend + domain logic to ship iOS/Android apps with a touch-first UI.

### 2.3 Principles

- **One core loop first**: Story → Read → Reward → Quiz → Progress.
- **Guardrails > complexity**: Start simple, then layer features.
- **Shared core**: Business logic and types live in `src/readrabbit` and are reused across web & mobile.
- **AI is server-side**: All AI calls (including Nano Banana) live behind typed server wrappers.
- **Privacy-first for kids**: use parental gates, explicit consent, and minimum retention for any child images.

---

## 3. Tech Stack

### 3.1 Web App

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS (+ optional shadcn/ui for UI primitives)
- **Backend**: Convex
  - Data (profiles, stories, quiz results, rewards, image personalization tokens).
  - Serverless functions for AI calls.
  - Real-time reactive queries.
- **Auth**: Clerk (parent accounts + child profiles)
- **AI (Text)**:
  - `storyModel` – text generation for stories & quiz questions.
  - Provider-agnostic, wrapped in `src/readrabbit/ai/storyGenerator.ts`.

- **AI (Images – Nano Banana)**:
  - `imageModel` – **Google Nano Banana image model** used for:
    - Story category tile images.
    - Story illustrations (covers and pages).
    - Optional personalized images that include the child’s likeness.
  - Wrapped in `src/readrabbit/ai/imageGenerator.ts`.
  - All calls are **server-side**, via Convex.

### 3.2 Mobile App

- **Framework**: Expo + React Native
- **Language**: TypeScript
- **Backend**: Convex client (same backend as web)
- **Auth**: Clerk (Expo SDK)
- **Shared logic**: Import from `src/readrabbit` wherever possible (types, story contracts, reading modes, etc.).

### 3.3 Code Sharing Strategy

- **Domain logic** lives in `src/readrabbit`:
  - Types & models for stories, pages, quizzes, rewards, personalization.
  - Shared constants (reading levels, age ranges, category definitions).
  - AI wrapper interfaces.
- Web and mobile apps both:
  - Call Convex functions for operations (generate story, generate category tiles, save progress, etc.).
  - Use common types (`ReadRabbitStory`, `ReadRabbitQuizQuestion`, `ReadRabbitCategoryTile`, etc.).

---

## 4. Core Product Scope

### 4.1 Personas

1. **Child Reader (“Kid”)**
   - Age ~4–10.
   - Skill: from pre-reader to early independent reader.
   - Goal: “Read fun stories starring me/animals/adventures, unlock things, feel proud.”

2. **Parent / Guardian**
   - Manages the account.
   - Wants safe, age-appropriate content.
   - Wants to see kid’s effort and progress.
   - Controls whether child photos can be used for personalized images.

---

### 4.2 AI Story Mode (MVP Focus)

**Flow overview:**

1. Parent selects/creates a child profile.
2. Kid taps **“Start a Story”**.
3. Kid sees a **category selection screen** showing several themed cards (e.g., Animals, Space, Magic, School). Each card has a Nano Banana–generated picture representing the theme.
4. Kid chooses:
   - A **category** (theme) by tapping a card.
   - **Optional toggle**: whether they will be part of the story ("Include me in the story?").
5. System generates:
   - A leveled story (split into pages) based on category, age, reading level, and whether the kid is in the story.
   - At least one illustration per story (cover; later possibly per page).
   - If the child is included and the parent has opted in, the illustrations may incorporate the child’s likeness using Nano Banana.
6. Kid reads:
   - Taps words to hear them.
   - Can request sentence/page read-aloud.
7. On completion:
   - Kid earns a reward (illustration, badge, points/carrots).
   - Kid answers a few simple comprehension questions.
8. Progress and rewards are saved.

---

### 4.3 Onboarding

**Child profile creation**

- Choose:
  - Nickname (or parent sets).
  - Age (e.g., 4–5, 6–8, 9–10).
  - Avatar (rabbit-based – colors, hats, etc.).
- Reading level selection:
  - “Just starting”
  - “Can read some words”
  - “Reading on my own”
- Interests selection:
  - Animals, Space, Magic, School, Superheroes, Friendship, etc.

**Personalization permissions (Parent)**

- In parent settings, under a clear **“Photos & Personalized Images”** section:
  - Toggle: `Allow use of my child’s photo in story images` (default OFF).
  - Explanation: how images are used, generated, and can be deleted.
  - Option to upload or capture a reference photo.
  - Option to **remove** or **reset** the reference photo at any time.

**Parent onboarding**

- Create account via Clerk.
- Create/manage child profiles.
- Basic settings:
  - Content language (initially English).
  - Time limits (optional, future).
  - Quizzes on/off per child.
  - Personalized image usage toggle + reference image management.

---

### 4.4 Story Structure & Types

Additions: category tiles and personalization metadata.

```ts
export type ReadRabbitReadingLevel = 'starter' | 'emerging' | 'independent';

export type ReadRabbitStoryTheme =
  | 'animals'
  | 'space'
  | 'school'
  | 'magic'
  | 'adventure'
  | 'friendship'
  | 'custom';

export type ReadRabbitCategoryTile = {
  id: string;
  theme: ReadRabbitStoryTheme;
  title: string;           // e.g., "Animal Adventures"
  description: string;     // kid-facing short description
  imageUrl: string;        // Nano Banana–generated category image
};

export type ReadRabbitPage = {
  pageIndex: number;
  text: string;
  audioUrl?: string;
  illustrationUrl?: string; // Generated via Nano Banana
};

export type ReadRabbitPersonalizationMode = 'none' | 'include-child';

export type ReadRabbitStory = {
  id: string;
  childId: string;
  title: string;
  theme: ReadRabbitStoryTheme;
  readingLevel: ReadRabbitReadingLevel;
  createdAt: number;
  pages: ReadRabbitPage[];
  coverImageUrl?: string;  // Nano Banana cover
  personalizationMode: ReadRabbitPersonalizationMode;
};

export type ReadRabbitQuizQuestionType = 'multiple-choice' | 'picture-choice';

export type ReadRabbitQuizOption = {
  id: string;
  label: string;
  imageUrl?: string;
};

export type ReadRabbitQuizQuestion = {
  id: string;
  storyId: string;
  questionType: ReadRabbitQuizQuestionType;
  prompt: string;
  options: ReadRabbitQuizOption[];
  correctOptionId: string;
};

export type ChildPhotoProfile = {
  childId: string;
  imageRefId: string;    // internal reference or token for Nano Banana
  createdAt: number;
  updatedAt: number;
};
```

---

### 4.5 Category Selection Screen (Nano Banana-powered)

**Goals**: Make the very first choice **visually exciting** and simple.

**Behavior**:

- When the child taps **“Start a Story”**:
  1. App queries a Convex function (e.g., `getCategoryTilesForChild`) that returns a list of `ReadRabbitCategoryTile` objects.
  2. Each tile displays:
     - A Nano Banana–generated image representing the theme.
     - A theme title.
     - A short description ("Bunny and friends in the forest", etc.).
  3. The child taps a tile to pick the theme.

**Image generation strategy**:

- For MVP, category tile images can be:
  - Pre-generated and stored (static set per theme), OR
  - Generated server-side once and cached per theme.
- Later, we can add:
  - Seasonal variations.
  - More dynamic tiles personalized to the child’s preferences.

**Personalization toggle**:

- On this screen (or immediately after), the child (and/or parent) sees a simple toggle:
  - Label: **“Include me in the story images?”**
  - Options: Yes / No
  - If the parent has not enabled child photo usage, this toggle is **disabled** and shows a brief explanation: “Ask your grown-up in settings if you want to do this.”

---

### 4.6 Child-in-Story Image Personalization (Nano Banana)

**High-level**:

- If the parent has opted in and provided a reference photo, and the child chooses **Yes** on the toggle, the story’s illustrations may depict the child (e.g., as a cartoon character within the story context).

**Flow**:

1. **Parent sets up personalization** (in parent settings):
   - Upload/capture a clear photo of the child’s face.
   - Confirm consent and read a brief explanation.
   - The system stores a reference handle (`imageRefId`) associated with `childId`.
2. **During story generation**:
   - If `personalizationMode === 'include-child'` and a `ChildPhotoProfile` exists, Convex’s `imageGenerator` uses the `imageRefId` when calling Nano Banana.
   - Prompts: ask Nano Banana for **kid-safe, stylized art** that places the child inside the scene (e.g., "cartoon style, friendly, colorful, no realism beyond playful portrait").
3. **Storage & retrieval**:
   - Generated illustrations are stored with the story’s pages or as a single cover + 1–2 reward images.
4. **Disabling and deletion**:
   - Parent can disable personalization at any time.
   - Parent can delete the reference photo; subsequent stories must not use it.

**UX & Safety constraints**:

- Parent gate for upload/capture of child photo.
- Clear communication:
  - "We use this photo only to generate fun story pictures for your child."
  - "You can delete it at any time."
- No sharing of images outside the family by default—no public gallery.
- Styling: strongly preference stylized, cartoon/friendly illustrations, not hyper-realistic images of the child.

---

### 4.7 Reading Experience

Same as before, with categories now feeding the story context.

Key behaviors:

- **Large text, high contrast**, ample spacing.
- Simple navigation:
  - Big **Next** / **Back** buttons.
  - Visible progress indicator (e.g., "Page 2 of 5" + rabbit running along a path).
- **Tap-to-hear word**:
  - Each word is individually tappable.
  - On tap, play spoken audio via TTS.
- **Read sentence / page aloud**:
  - Icon to play sentence or page; highlight words as spoken if possible.
- Modes:
  - "I’ll read it"
  - "Read with the Rabbit" (guided read-aloud).

---

### 4.8 Rewards & Motivation

Same concept as before:

- Completion rewards (images, carrots/points, badges).
- Reward images can also be generated via Nano Banana based on the story outcome (e.g., Rabbit celebrating with the child or characters).
- Rewards stored in a "Burrow Wall"/gallery.

---

### 4.9 Progress Tracking

No major change from v0.1; still includes:

- Kid-facing: stories read, streaks, badges.
- Parent-facing: time spent, stories completed, quiz performance, and eventually top problematic words.

---

### 4.10 Safety & Content

**Extra emphasis with personalization**:

- All story prompts enforce **kid-safe themes**.
- Nano Banana prompts:
  - Emphasize cartoon/stylized kids, friendly scenes, no graphic or explicit content.
- Parent-controlled:
  - Personalized images only if parent explicitly opts in.
  - Easy disable & deletion for child photo reference.
- No community/public posting.

---

## 5. Architecture & Folder Structure (Canonical)

The canonical architecture assumes a **monorepo layout** (see 5.1) with separate `web/` and `mobile/` apps plus shared packages. This section describes how the **web app** is organized inside `readrabbit/web`, and how it relates to shared packages.

At the repo root (high-level):

```txt
readrabbit/
  web/         # Next.js app (what you’re building first)
  mobile/      # (future) Expo/React Native app
  packages/
    ui/        # shared UI components (where possible)
    domain/    # shared ReadRabbit logic & types
    config/    # shared config, constants, theme tokens, etc.
```

Within the **web app** (`readrabbit/web`), the structure is:

```txt
web/
  src/
    app/
      layout.tsx
      page.tsx                 # Landing page
      read/
        page.tsx               # Main AI Story Mode (category selection + reading)
      rewards/
        page.tsx               # Burrow / rewards gallery
      profile/
        page.tsx               # Child profile selection & basic info
      parent/
        page.tsx               # Parent dashboard (usage, progress, settings)

    components/
      layout/
        navbar.tsx
        shell.tsx
      read/
        category-grid.tsx         # shows Nano Banana category tiles
        story-setup-form.tsx
        story-reader.tsx
        page-navigation.tsx
        word.tsx
        quiz.tsx
        personalization-toggle.tsx
      rewards/
        rewards-grid.tsx
      profile/
        child-card.tsx
        profile-selector.tsx
      parent/
        personalization-settings.tsx  # upload/delete child photo, toggle personalization
      ui/
        button.tsx
        card.tsx
        modal.tsx
        progress-bar.tsx
        skeleton.tsx

  convex/
    schema.ts                     # DB schema (children, stories, quizzes, rewards, childPhotoProfiles)
    children.ts                   # CRUD for child profiles
    stories.ts                    # createStory, getStoriesForChild, etc.
    quizzes.ts                    # createQuiz, submitQuizAnswers
    rewards.ts                    # rewards creation & querying
    personalization.ts            # manage childPhotoProfiles, permissions
    categories.ts                 # manage category tiles (generate + cache Nano Banana results)
    progress.ts                   # aggregate stats for parent dashboard
    _generated/

  public/
    avatars/
    rewards/
```

The **shared packages** are referenced from here as normal npm workspaces, for example:

- `packages/domain` – imported by Convex functions and components as the source of truth for types and domain helpers.
- `packages/config` – imported by both `web/` and `mobile/` for shared constants and feature flags.
- `packages/ui` – imported by `web/` initially; later a sibling `ui-native` (or similar) can serve React Native.

This ensures that when `mobile/` comes online, it reuses `packages/domain` and `packages/config` immediately, and adopts `packages/ui` pieces where appropriate, without rewriting the core of ReadRabbit.

**Key rules** remain:

- Domain logic & types in `src/readrabbit`.
- Convex functions in `convex/`.
- Pages in `src/app` are orchestration layers.
- Shared UI components live in `src/components`.
- All AI (text + Nano Banana) calls happen server-side.

---

## 5.1 Monorepo Project Layout (Web + Mobile)

To make the transition to mobile as smooth as possible, the project will live in a single monorepo with this high-level layout:

```txt
readrabbit/
  web/         # Next.js app (what you’re building first)
  mobile/      # (future) Expo/React Native app
  packages/
    ui/        # shared UI components (where possible)
    domain/    # shared ReadRabbit logic & types
    config/    # shared config, constants, theme tokens, etc.
```

### Goals of this layout

- **Web-first, mobile-ready**: start with `web/`, but from day one, domain logic and config are shared.
- **Clear ownership**:
  - `web/` owns Next.js–specific routing, pages, and web-only UI.
  - `mobile/` will own Expo/React Native screens, navigation, and mobile-only UX tweaks.
  - `packages/` owns everything that should be reused and tested once.
- **AI-friendly**: this structure makes it obvious to AI pair coders where to put shared vs. platform-specific code.

### Package responsibilities

- `packages/domain`
  - Types: stories, pages, quizzes, rewards, personalization, category tiles.
  - Domain helpers: pagination, reading level helpers, quiz generation contracts, etc.
  - Shared business rules (e.g., max story length per level, allowed themes).

- `packages/config`
  - App-wide constants (reading level definitions, theme definitions, limits).
  - Feature flags (e.g., enablePersonalization, enableQuizzes).
  - Design tokens that can be reused across web and mobile (e.g., color palette, spacing scale).

- `packages/ui`
  - Shared presentational components that can reasonably exist across platforms.
  - At first, this will mostly be **web-focused** (React + Tailwind). When mobile is added, either:
    - Introduce a React Native–specific `ui-native` package, or
    - Keep `ui` for truly platform-agnostic components and add platform wrappers in each app.

> Note: platform-specific navigation (Next.js routing vs. React Navigation) stays in `web/` and `mobile/`. Shared domain logic and types stay in `packages/domain` and are imported from both.

## 6. Development Gameplan (Updated)

### Phase 1 – Clickable Flow Skeleton (No Real AI, No Auth)

- Implement category selection screen using static images & hardcoded categories.
- Implement the full click-through:
  `/` → `/profile` → `/read` (category screen → fake story) → quiz → reward → `/rewards`.
- No personalization yet; the toggle exists but is disabled or non-functional.

### Phase 2 – Real AI Text + Nano Banana Images + Auth + DB

- Integrate Clerk (parent auth) and Convex (data).
- Implement:
  - `createStoryForChild` (Convex + `storyGenerator`).
  - `createQuizForStory`.
  - `getCategoryTilesForChild` + `categories.ts` using Nano Banana (or pre-generated + cached).
  - `imageGenerator.ts` to call Nano Banana for:
    - Category tile images (if not pre-generated).
    - Story covers.
    - Reward images.
- Persist stories, quizzes, and rewards.
- Parent & child flows fully wired.

### Phase 3 – Personalization (Child-in-Story Images)

- Add parent settings UI to:
  - Upload/capture child photo.
  - Enable/disable personalization.
  - Delete/reset reference.
- Implement `personalization.ts` in Convex to:
  - Store a `ChildPhotoProfile` record.
  - Manage associations of `childId` ↔ `imageRefId`.
- Extend `imageGenerator.ts` to:
  - Use personalization prompt parameters when `personalizationMode === 'include-child'` and a `ChildPhotoProfile` exists.
- Update story creation flow:
  - Honor the personalization toggle.
  - Fallback to non-personalized images when personalization is off/unavailable.

### Phase 4 – Styling, Kid UX & Production Hardening

- Tailwind + shadcn/ui for visual polish.
- Mobile web optimization.
- Playful animations and transitions (especially on category tiles and rewards).
- Error handling and content safety checks.
- Deploy to production.

### Phase 5 – Mobile (Expo / React Native)

- Build a mobile client that:
  - Authenticates via Clerk.
  - Talks to Convex.
  - Reuses domain types.
  - Implements the same flow on touch devices.

---

## 7. Non-Goals (v1)

- No public sharing or social features.
- No complex payment system.
- No classroom/teacher dashboards initially.
- No real-time chat or messaging.
- No client-side AI calls; everything is through Convex.

---

## 8. Success Criteria

- **Short term (web MVP)**: Parent can sign up, create a child, child can pick a category tile (with Nano Banana image), generate a story, read it, answer a quiz, and earn a reward.
- **Mid term**: Parent can manage personalization settings; kid can appear in stylized Nano Banana story images with parent consent.
- **Long term**: Same loop works in mobile apps using the same backend and domain contracts.

