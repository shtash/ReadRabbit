# ReadRabbit – Character & Story Mode Details
**Addendum to PRD v0.1**

This document extends **ReadRabbit – PRD v0.1** with more detailed specs for:
- The **Character Management screen** (family members, pets, friends, etc.).
- The **Story Mode selector** (Auto / Category / Custom) and their exact flows.
- How these features integrate into the **Development Gameplan**.

---

## 1. Character Management Screen

### 1.1 Purpose

Allow a child (with light parent supervision) to define a **cast of recurring characters** that can appear in stories and images:
- Themself
- Family members
- Pets
- Friends

These characters are represented by **profiles** (name, image, gender, age, type) and used by the story & image generators.

### 1.2 Data model (recap)

Backed by `ReadRabbitCharacterProfile` in the main PRD:

```ts
export type ReadRabbitCharacterType = 'self' | 'family' | 'pet' | 'friend' | 'other';

export type ReadRabbitCharacterProfile = {
  id: string;
  ownerChildId: string;     // which child profile this belongs to
  type: ReadRabbitCharacterType;
  name: string;
  age?: number;
  gender?: string;
  avatarImageUrl?: string;  // uploaded image or generated avatar
  photoRefId?: string;      // optional reference for Nano Banana personalization
  createdAt: number;
  updatedAt: number;
};
```

### 1.3 UX & Layout

- Entry point:
  - From the **Profile** or **Parent** area: "Characters" button.
  - Parent gate can be applied for editing / deleting characters; kids can pick characters freely when starting stories.

- Screen layout:
  - Header: "Your Story Characters" with a short helper text ("Add family, pets, and friends who can be in your stories!").
  - Main area: **grid or horizontal list** of **circular character cards**:
    - Circle image (avatar or photo).
    - Name label.
    - Small badge for type (e.g., "Pet", "Family").
  - One extra card: **"+ Add Character"**.

- Add/Edit character flow:
  1. Tap **"+ Add Character"** or an existing character card.
  2. Open a modal / dedicated screen with fields:
     - **Name** (required).
     - **Type**: dropdown (Self, Family, Pet, Friend, Other).
     - **Age** (optional).
     - **Gender** (optional).
     - **Image**:
       - Option A: upload/select a photo (parent gate may be required).
       - Option B: pick from a set of cute, pre-made avatars (recommended for kids to use without photos).
  3. Save / Cancel buttons.

- Constraints & rules:
  - Only **one `type = 'self'`** per child (their own persona).
  - If a photo is attached and the parent has enabled personalization, `photoRefId` can be managed by the backend.
  - Deleting a character:
    - Allowed via parent-gated action.
    - Stories that used the character keep their existing text and images, but that character will no longer appear in new stories.

---

## 2. Story Mode Selector (Auto / Category / Custom)

This runs right before story generation and controls how much choice the child has.

### 2.1 Shared layout

- Screen title: "How do you want to make your story?"
- Three big cards/buttons side by side or stacked (depending on screen width):
  - **Auto** – "You choose for me!"
  - **Category** – "I pick the kind of story"
  - **Custom** – "I tell you what happens"
- Each card has:
  - An icon/illustration.
  - 1–2 line description.

When a mode is selected, the app moves to that mode’s specific flow.

---

### 2.2 Auto Mode

**Goal**: Fast, low-friction mode for younger kids. The system chooses.

**Flow**:

1. Child taps **Auto**.
2. The app may show a very simple confirmation screen:
   - "We’ll pick a fun story for you! Ready?"
   - Start button.
3. Backend logic:
   - Picks a **category** based on:
     - Child’s age, reading level, and interests.
     - Recent history (avoid repeating the exact same theme too often).
   - Picks **0–N characters** from existing `ReadRabbitCharacterProfile`s, including the child’s "self" character if present.
4. The system calls the story generator with:
   - `sourceMode = 'auto'`
   - Chosen theme & characters.
5. User is taken straight into **reading** once the story is ready.

No category UI or character selection is shown in Auto mode.

---

### 2.3 Category Mode

**Goal**: Let the child choose the theme and optionally who appears.

**Flow**:

1. Child taps **Category**.
2. Category selection screen (horizontal scroll of circular icons):
   - Fetch `ReadRabbitCategoryTile[]` from backend.
   - Each tile shows a Nano Banana–generated image and a label (e.g., "Animal Adventures").
   - Child scrolls left-right and taps one.
3. Character selection prompt:
   - After category is chosen, show: "Do you want to pick who is in the story?" (Yes/No buttons).
4. If **No**:
   - Backend selects characters in a similar way to Auto mode, but constrained to the chosen category.
   - Proceed to story generation.
5. If **Yes**:
   - Show a second **horizontal strip of circular character icons**:
     - Each icon shows a `ReadRabbitCharacterProfile` (self, family, pet, friend).
     - Tapping toggles selection (highlighted border or checkmark).
     - Optionally a "Select all" / "Clear" at the end.
   - Once done, child taps **"Make my story"**.
6. Story generation call includes:
   - `sourceMode = 'category'`
   - `theme` from the chosen category.
   - `characterIds` from selected character icons.
   - `personalizationMode` from the separate "Include me in the story images?" toggle (if available).

---

### 2.4 Custom Mode

**Goal**: Give older or more expressive kids (and parents) full creative control over the prompt.

**Flow**:

1. Child taps **Custom**.
2. They see a screen with two input methods:
   - **Microphone button** for **voice dictation**.
   - **Text area** for typing.

3. Voice dictation:
   - Child holds/taps the mic button and speaks: "I want a story where me and Buddy the dog go to space and meet Grandma June on the moon."
   - Speech-to-text (STT) runs on-device or server-side and fills a text box with the transcription.
   - The child or parent can edit the text before continuing.

4. Typed prompt:
   - Child/parent types the prompt directly into the text box.

5. Character name recognition:
   - The backend receives `customPromptText`.
   - It does simple **name matching** against existing `ReadRabbitCharacterProfile`s:
     - Normalize to lowercase.
     - Strip punctuation.
     - Compare words/phrases with character names ("buddy", "grandma june").
     - Maintain a confidence threshold.
   - Any matched characters are added to `characterIds` for that story.

6. Story generation call includes:
   - `sourceMode = 'custom'`.
   - `theme` either inferred from the text or set to `'custom'`.
   - `characterIds` from name-matching.
   - `customPromptText` as a field in the story record.

7. The story is generated and shown like any other story, with reading & quiz flows unchanged.

---

## 3. Development Gameplan – Updates Related to Characters & Modes

This section refines how **characters** and **story modes** show up in each phase.

### Phase 1 – Clickable Flow Skeleton (No Real AI, No Auth)

Add to existing goals:

- **Story Mode Selector**
  - Implement the three-mode screen with static behavior:
    - Auto: immediately navigates to a hardcoded story.
    - Category: shows a static horizontal row of category circles.
    - Custom: shows mic + text area, but doesn’t actually call STT.

- **Character Management (static)**
  - Implement a Characters screen with:
    - A few fake hardcoded characters.
    - "Add" and "Edit" flows that operate purely in local React state.
  - Implement the character selection row in Category mode using this static data.

### Phase 2 – Real AI Text + Nano Banana Images + Auth + DB

Extend Phase 2 to include:

- **Convex `characters.ts`**
  - CRUD operations for `ReadRabbitCharacterProfile` linked to `childId`.
  - Query for characters used in Category and Auto modes.

- **Story mode wiring**
  - Auto mode calls Convex with no UI selections; backend chooses theme + characters.
  - Category mode passes theme + `characterIds` (if the child selected any).
  - Custom mode passes `customPromptText`; backend performs name matching on `characters`.

- **Persisted Characters**
  - Replace Phase 1’s local-only character state with Convex-backed data.
  - Characters screen now reads/writes from Convex.

### Phase 3 – Personalization (Child-in-Story Images)

No change in structure, but now personalization can also apply to:

- Characters marked as `type = 'self'` or those with `photoRefId`.
- Auto/Category/Custom modes that include personalized characters.

### Phase 4 – Styling, Kid UX & Production Hardening

- Add delightful UI polish to:
  - Character cards and selection row.
  - Story mode selector (animations, hover/tap feedback, etc.).

### Phase 5 – Mobile (Expo / React Native)

- Reuse the same modes and character model:
  - Story Mode selector adapted to mobile UI.
  - Character Management screen with touch-friendly grid/list.

---

This addendum should be read together with **ReadRabbit – PRD v0.2**. Together they define:
- The **data model** for reusable characters.
- The **UI flows** for Auto / Category / Custom modes.
- The **phased implementation** plan that gradually adds depth without overloading the MVP.

