// --- Domain Types ---

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
  sourceMode: 'auto' | 'category' | 'custom';
  customPromptText?: string;
};

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

// --- AI Interfaces ---

export type AIProviderType = 'google' | 'openai' | 'mock';

export interface StoryGenerationParams {
  theme: string;
  age: number;
  readingLevel: string;
  interests: string[];
  characters?: { name: string; type: string }[];
  customPrompt?: string;
}

export interface GeneratedStory {
  title: string;
  pages: {
    text: string;
    illustrationPrompt?: string;
  }[];
}

export interface ImageGenerationParams {
  prompt: string;
  style?: string;
  personalization?: {
    imageRefId: string;
  };
  aspectRatio?: '1:1' | '16:9' | '4:3';
}

export interface StoryGenerator {
  generateStory(params: StoryGenerationParams): Promise<GeneratedStory>;
}

export interface ImageGenerator {
  generateImage(params: ImageGenerationParams): Promise<string>;
}

