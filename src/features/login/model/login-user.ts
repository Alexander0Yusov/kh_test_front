import type { CurrentUser } from "@/entities/session";
import type { RestClient } from "@/shared/api";

import type { LoginValues } from "./login-schema";

export type LoginResult =
  | {
      accessToken: string;
      currentUser: CurrentUser;
      status: "authenticated";
    }
  | {
      field?: "email" | "password";
      message: string;
      status: "credentials-error";
    }
  | {
      message: string;
      status: "infrastructure-error";
    };

export async function loginUser(
  client: RestClient,
  values: LoginValues,
): Promise<LoginResult> {
  try {
    const loginResult = await client.POST("/auth/login", {
      body: values,
    });

    if (loginResult.response.status === 401) {
      return {
        message: "Неверный email или пароль.",
        status: "credentials-error",
      };
    }

    if (loginResult.response.status === 400) {
      const field =
        loginResult.error?.field === "email" ||
        loginResult.error?.field === "password"
          ? loginResult.error.field
          : undefined;

      return {
        field,
        message: "Проверьте введённые данные.",
        status: "credentials-error",
      };
    }

    if (!loginResult.data?.accessToken) {
      return {
        message: "Не удалось выполнить вход. Попробуйте позже.",
        status: "infrastructure-error",
      };
    }

    const currentUserResult = await client.GET("/users/me", {
      headers: {
        Authorization: `Bearer ${loginResult.data.accessToken}`,
      },
    });

    if (!currentUserResult.data) {
      return {
        message: "Не удалось получить текущего пользователя.",
        status: "infrastructure-error",
      };
    }

    return {
      accessToken: loginResult.data.accessToken,
      currentUser: currentUserResult.data,
      status: "authenticated",
    };
  } catch {
    return {
      message: "Backend временно недоступен. Повторите попытку.",
      status: "infrastructure-error",
    };
  }
}
