import { type PostViewModel, mapRestPost } from "@/entities/post";
import type { RestClient, components } from "@/shared/api";

import type { CreatePostValues } from "./create-post-schema";

type CreatePostRequest = components["schemas"]["CreatePostDto"];
type ErrorResponse = components["schemas"]["ErrorResponseDto"];

export type CreatePostResult =
  | { post: PostViewModel; status: "created" }
  | { postId: string; status: "created-without-enrichment" }
  | {
      code: string;
      field: string | null;
      message: string;
      status: "error";
    };

interface CreatePostOptions {
  attachmentFileId?: string;
  captchaId: string;
  client: RestClient;
  parentId?: string;
  values: CreatePostValues;
}

function normalizeError(error: ErrorResponse | undefined): Omit<
  Extract<CreatePostResult, { status: "error" }>,
  "status"
> {
  return {
    code: error?.code ?? "UNKNOWN",
    field: error?.field ?? null,
    message: error?.field ? "Check this field." : "Could not create the message.",
  };
}

export async function createPost({
  attachmentFileId,
  captchaId,
  client,
  parentId,
  values,
}: CreatePostOptions): Promise<CreatePostResult> {
  const body = {
    ...(attachmentFileId ? { attachmentFileId } : {}),
    captchaId,
    captchaValue: values.captchaValue,
    email: values.email,
    ...(values.homePage ? { homePage: values.homePage } : {}),
    message: values.message,
    ...(parentId ? { parentId } : {}),
    userName: values.userName,
  } satisfies CreatePostRequest;

  const created = await client.POST("/posts", { body });

  if (!created.data) {
    return { ...normalizeError(created.error), status: "error" };
  }

  const postId = created.data.id;
  const enriched = await client.GET("/posts/{postId}", {
    params: { path: { postId } },
  });

  if (!enriched.data) {
    return { postId, status: "created-without-enrichment" };
  }

  return { post: mapRestPost(enriched.data), status: "created" };
}
