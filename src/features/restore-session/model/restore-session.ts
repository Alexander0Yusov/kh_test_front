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
        message: "Could not restore the session. Please try again.",
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
        message: "Could not load the current user.",
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
      message: "Service is temporarily unavailable.",
      status: "error",
    };
  }
}
