import type { RestClient } from "@/shared/api";

export type LogoutResult = "anonymous" | "error" | "success";

export async function logoutUser(
  client: RestClient,
): Promise<LogoutResult> {
  try {
    const result = await client.POST("/auth/logout");

    if (result.response.status === 204) {
      return "success";
    }

    if (result.response.status === 401) {
      return "anonymous";
    }

    return "error";
  } catch {
    return "error";
  }
}
