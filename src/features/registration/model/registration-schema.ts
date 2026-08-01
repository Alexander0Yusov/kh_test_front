import { z } from "zod";

import type { components } from "@/shared/api";

type RegistrationFields = Pick<components["schemas"]["RegisterUserDto"], "email" | "password">;

export const registrationSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address.").max(254, "Email is too long."),
  password: z.string().min(8, "Password must contain between 8 and 128 characters.").max(128, "Password must contain between 8 and 128 characters."),
}) satisfies z.ZodType<RegistrationFields>;

export type RegistrationValues = z.infer<typeof registrationSchema>;
