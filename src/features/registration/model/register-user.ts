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
      return { message: "Пользователь с таким email уже существует.", status: "duplicate" };
    }
    if (result.response.status === 400) {
      return { message: "Проверьте данные и выбранный avatar.", status: "validation-error" };
    }
    return { message: "Регистрация временно недоступна.", status: "infrastructure-error" };
  } catch {
    return { message: "Backend временно недоступен. Повторите попытку.", status: "infrastructure-error" };
  }
}
