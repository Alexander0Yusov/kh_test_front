import { z } from "zod";

import {
  isSanitizedPostMessageEmpty,
  sanitizePostMessage,
} from "@/entities/post";

const latinLettersAndNumbers = /^[A-Za-z0-9]+$/;

const optionalHomePageSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .url("Enter an absolute HTTP or HTTPS URL.")
    .refine(
      (value) => ["http:", "https:"].includes(new URL(value).protocol),
      "Home page must use HTTP or HTTPS.",
    )
    .optional(),
);

const messageSchema = z
  .string()
  .min(1, "Message is required.")
  .superRefine((value, context) => {
    const sanitized = sanitizePostMessage(value);

    if (sanitized !== value) {
      context.addIssue({
        code: "custom",
        message:
          "Message contains unsupported markup. Use only a[href,title], strong, i and code.",
      });
      return;
    }

    if (isSanitizedPostMessageEmpty(sanitized)) {
      context.addIssue({
        code: "custom",
        message: "Message must contain visible text.",
      });
    }
  })
  .transform((value) => sanitizePostMessage(value));

export const createPostSchema = z.object({
  captchaValue: z
    .string()
    .min(1, "CAPTCHA is required.")
    .regex(latinLettersAndNumbers, "Use only Latin letters and numbers."),
  email: z.email("Enter a valid email address."),
  homePage: optionalHomePageSchema,
  message: messageSchema,
  userName: z
    .string()
    .min(1, "User name is required.")
    .regex(latinLettersAndNumbers, "Use only Latin letters and numbers."),
});

export type CreatePostFormInput = z.input<typeof createPostSchema>;
export type CreatePostValues = z.output<typeof createPostSchema>;
