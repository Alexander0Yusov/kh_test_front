import { z } from "zod";

import type { components } from "@/shared/api";

type LoginRequest = components["schemas"]["LoginUserDto"];

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must contain between 8 and 128 characters.")
    .max(128, "Password must contain between 8 and 128 characters."),
}) satisfies z.ZodType<LoginRequest>;

export type LoginValues = z.infer<typeof loginSchema>;
