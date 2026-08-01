import { z } from "zod";

import type { components } from "@/shared/api";

type LoginRequest = components["schemas"]["LoginUserDto"];

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Введите email.")
    .email("Введите корректный email."),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов.")
    .max(128, "Пароль должен содержать не более 128 символов."),
}) satisfies z.ZodType<LoginRequest>;

export type LoginValues = z.infer<typeof loginSchema>;
