/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_factory from "../ai/factory.js";
import type * as ai_providers_google from "../ai/providers/google.js";
import type * as ai_providers_mock from "../ai/providers/mock.js";
import type * as categories from "../categories.js";
import type * as characters from "../characters.js";
import type * as children from "../children.js";
import type * as debug from "../debug.js";
import type * as migrations from "../migrations.js";
import type * as personalization from "../personalization.js";
import type * as progress from "../progress.js";
import type * as quizzes from "../quizzes.js";
import type * as rewards from "../rewards.js";
import type * as stories from "../stories.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/factory": typeof ai_factory;
  "ai/providers/google": typeof ai_providers_google;
  "ai/providers/mock": typeof ai_providers_mock;
  categories: typeof categories;
  characters: typeof characters;
  children: typeof children;
  debug: typeof debug;
  migrations: typeof migrations;
  personalization: typeof personalization;
  progress: typeof progress;
  quizzes: typeof quizzes;
  rewards: typeof rewards;
  stories: typeof stories;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
