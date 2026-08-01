import type { operations } from "@/shared/api";

import type { PostViewModel } from "./posts-slice";

type GetPostResponse = operations["getPost"]["responses"][200]["content"]["application/json"];

export function mapRestPost(post: GetPostResponse): PostViewModel {
  return {
    attachmentUrl: post.attachmentUrl,
    avatarUrl: post.avatarUrl,
    email: post.email,
    homePage: post.homePage,
    id: post.id,
    message: post.message,
    parentId: post.parentId,
    path: post.path,
    publishDate: post.publishDate,
    rootId: post.rootId,
    userName: post.userName,
  };
}
