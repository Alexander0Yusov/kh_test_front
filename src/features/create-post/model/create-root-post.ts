import { type PostViewModel, mapRestPost } from "@/entities/post";
import type { RestClient, components } from "@/shared/api";

import type { CreatePostValues } from "./create-post-schema";

type CreatePostRequest = components["schemas"]["CreatePostDto"];
type ErrorResponse = components["schemas"]["ErrorResponseDto"];

export type CreateRootPostResult =
  | { post: PostViewModel; status: "created" }
  | { postId: string; status: "created-without-enrichment" }
  | {
      code: string;
      field: string | null;
      message: string;
      status: "error";
    };

interface CreateRootPostOptions {
  attachmentFileId?: string;
  captchaId: string;
  client: RestClient;
  values: CreatePostValues;
}

function normalizeError(error: ErrorResponse | undefined): Omit<
  Extract<CreateRootPostResult, { status: "error" }>,
  "status"
> {
  return {
    code: error?.code ?? "UNKNOWN",
    field: error?.field ?? null,
    message: error?.message ?? "The post could not be created.",
  };
}

export async function createRootPost({
  attachmentFileId,
  captchaId,
  client,
  values,
}: CreateRootPostOptions): Promise<CreateRootPostResult> {
  const body = {
    ...(attachmentFileId ? { attachmentFileId } : {}),
    captchaId,
    captchaValue: values.captchaValue,
    email: values.email,
    ...(values.homePage ? { homePage: values.homePage } : {}),
    message: values.message,
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
