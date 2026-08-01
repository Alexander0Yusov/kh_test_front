import { z } from "zod";

import type { components } from "@/shared/api";

type RegistrationFields = Pick<components["schemas"]["RegisterUserDto"], "email" | "password">;

export const registrationSchema = z.object({
  email: z.string().min(1, "Введите email.").email("Введите корректный email.").max(254, "Email слишком длинный."),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов.").max(128, "Пароль должен содержать не более 128 символов."),
}) satisfies z.ZodType<RegistrationFields>;

export type RegistrationValues = z.infer<typeof registrationSchema>;
