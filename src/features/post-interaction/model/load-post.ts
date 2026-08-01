import { type PostViewModel, mapRestPost } from "@/entities/post";
import type { RestClient } from "@/shared/api";

export type LoadPostResult =
  | { post: PostViewModel; status: "ready" }
  | { status: "not-found" }
  | { status: "error" };

export async function loadPost(
  client: RestClient,
  postId: string,
  signal: AbortSignal,
): Promise<LoadPostResult> {
  const response = await client.GET("/posts/{postId}", {
    params: { path: { postId } },
    signal,
  });

  if (response.data) {
    return { post: mapRestPost(response.data), status: "ready" };
  }
  if (response.response.status === 404) return { status: "not-found" };
  return { status: "error" };
}
