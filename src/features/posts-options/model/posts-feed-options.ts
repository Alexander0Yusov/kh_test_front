import { z } from "zod";

import {
  DEFAULT_POSTS_QUERY_RULES,
  type PostsQueryRules,
} from "@/entities/post";

export const POSTS_FEED_OPTIONS_KEY = "posts-feed-options:v1";

const optionsSchema = z.object({
  fields: z.object({
    attachment: z.boolean(),
    avatar: z.boolean(),
    email: z.boolean(),
    homePage: z.boolean(),
    publishDate: z.boolean(),
  }),
  limit: z.number().int().transform((value) => Math.min(50, Math.max(1, value))),
  sortBy: z.enum(["CREATED_AT", "EMAIL", "USER_NAME"]),
  sortDirection: z.enum(["ASC", "DESC"]),
});

export function parsePostsFeedOptions(value: unknown): PostsQueryRules {
  const parsed = optionsSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_POSTS_QUERY_RULES;
}
