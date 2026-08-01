import type { RestClient, components } from "@/shared/api";

import type { RegistrationValues } from "./registration-schema";

type RegisterUserRequest = components["schemas"]["RegisterUserDto"];

export type RegistrationResult =
  | { status: "registered" }
  | { message: string; status: "duplicate" }
  | { message: string; status: "validation-error" }
  | { message: string; status: "infrastructure-error" };

export async function registerUser(
  client: RestClient,
  values: RegistrationValues,
  avatarFileId: string,
): Promise<RegistrationResult> {
  const body = { ...values, avatarFileId } satisfies RegisterUserRequest;
  try {
    const result = await client.POST("/users/register", { body });
    if (result.response.status === 201 && result.data) return { status: "registered" };
    if (result.response.status === 409) {
      return { message: "A user with this email already exists.", status: "duplicate" };
    }
    if (result.response.status === 400) {
      return { message: "Check the entered information and selected avatar.", status: "validation-error" };
    }
    return { message: "Registration is temporarily unavailable.", status: "infrastructure-error" };
  } catch {
    return { message: "Service is temporarily unavailable.", status: "infrastructure-error" };
  }
}
