import type { CurrentUser } from "@/entities/session";
import type { RestClient } from "@/shared/api";

export type RestoreSessionResult =
  | {
      accessToken: string;
      currentUser: CurrentUser;
      status: "authenticated";
    }
  | {
      status: "anonymous";
    }
  | {
      message: string;
      status: "error";
    };

export async function restoreSession(
  client: RestClient,
): Promise<RestoreSessionResult> {
  try {
    const refreshResult = await client.POST("/auth/refresh");

    if (refreshResult.response.status === 401) {
      return { status: "anonymous" };
    }

    if (!refreshResult.data?.accessToken) {
      return {
        message: "Не удалось восстановить сессию. Попробуйте ещё раз.",
        status: "error",
      };
    }

    const currentUserResult = await client.GET("/users/me", {
      headers: {
        Authorization: `Bearer ${refreshResult.data.accessToken}`,
      },
    });

    if (currentUserResult.response.status === 401) {
      return { status: "anonymous" };
    }

    if (!currentUserResult.data) {
      return {
        message: "Не удалось получить текущего пользователя.",
        status: "error",
      };
    }

    return {
      accessToken: refreshResult.data.accessToken,
      currentUser: currentUserResult.data,
      status: "authenticated",
    };
  } catch {
    return {
      message: "Backend временно недоступен. Повторите попытку.",
      status: "error",
    };
  }
}
