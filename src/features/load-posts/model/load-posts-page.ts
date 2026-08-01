import type { PostsPage, PostsQueryRules } from "@/entities/post";
import type { GraphqlClient } from "@/shared/api";
import {
  PublicPostsDocument,
  type PublicPostsQueryVariables,
} from "@/shared/api/generated/graphql/graphql";

function isValidPost(value: PostsPage["items"][number]): boolean {
  return (
    value.id.length > 0 &&
    value.path.length > 0 &&
    value.message.length > 0 &&
    value.userName.length > 0
  );
}

export async function loadPostsPage(
  client: GraphqlClient,
  rules: PostsQueryRules,
  cursor: string | null,
  signal: AbortSignal,
): Promise<PostsPage> {
  const variables: PublicPostsQueryVariables = {
    cursor,
    includeAttachment: rules.fields.attachment,
    includeAvatar: rules.fields.avatar,
    includeEmail: rules.fields.email,
    includeHomePage: rules.fields.homePage,
    includePublishDate: rules.fields.publishDate,
    limit: rules.limit,
    sortBy: rules.sortBy,
    sortDirection: rules.sortDirection,
  };

  const result = await client.request(PublicPostsDocument, variables, signal);

  if (!result.posts.items.every(isValidPost)) {
    throw new Error("The posts service returned invalid post data.");
  }

  return {
    hasMore: result.posts.hasMore,
    items: result.posts.items,
    nextCursor: result.posts.nextCursor,
  };
}
