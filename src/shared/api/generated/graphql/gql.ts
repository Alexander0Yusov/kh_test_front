/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query PublicPosts($cursor: String, $limit: Int! = 25, $sortBy: PostSortField! = CREATED_AT, $sortDirection: SortDirection! = DESC, $includeAvatar: Boolean! = true, $includeHomePage: Boolean! = true, $includeEmail: Boolean! = true, $includeAttachment: Boolean! = true, $includePublishDate: Boolean! = true) {\n  posts(\n    cursor: $cursor\n    limit: $limit\n    sortBy: $sortBy\n    sortDirection: $sortDirection\n  ) {\n    items {\n      id\n      parentId\n      rootId\n      path\n      message\n      userName\n      avatarUrl @include(if: $includeAvatar)\n      homePage @include(if: $includeHomePage)\n      email @include(if: $includeEmail)\n      attachmentUrl @include(if: $includeAttachment)\n      publishDate @include(if: $includePublishDate)\n    }\n    nextCursor\n    hasMore\n  }\n}": typeof types.PublicPostsDocument,
};
const documents: Documents = {
    "query PublicPosts($cursor: String, $limit: Int! = 25, $sortBy: PostSortField! = CREATED_AT, $sortDirection: SortDirection! = DESC, $includeAvatar: Boolean! = true, $includeHomePage: Boolean! = true, $includeEmail: Boolean! = true, $includeAttachment: Boolean! = true, $includePublishDate: Boolean! = true) {\n  posts(\n    cursor: $cursor\n    limit: $limit\n    sortBy: $sortBy\n    sortDirection: $sortDirection\n  ) {\n    items {\n      id\n      parentId\n      rootId\n      path\n      message\n      userName\n      avatarUrl @include(if: $includeAvatar)\n      homePage @include(if: $includeHomePage)\n      email @include(if: $includeEmail)\n      attachmentUrl @include(if: $includeAttachment)\n      publishDate @include(if: $includePublishDate)\n    }\n    nextCursor\n    hasMore\n  }\n}": types.PublicPostsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PublicPosts($cursor: String, $limit: Int! = 25, $sortBy: PostSortField! = CREATED_AT, $sortDirection: SortDirection! = DESC, $includeAvatar: Boolean! = true, $includeHomePage: Boolean! = true, $includeEmail: Boolean! = true, $includeAttachment: Boolean! = true, $includePublishDate: Boolean! = true) {\n  posts(\n    cursor: $cursor\n    limit: $limit\n    sortBy: $sortBy\n    sortDirection: $sortDirection\n  ) {\n    items {\n      id\n      parentId\n      rootId\n      path\n      message\n      userName\n      avatarUrl @include(if: $includeAvatar)\n      homePage @include(if: $includeHomePage)\n      email @include(if: $includeEmail)\n      attachmentUrl @include(if: $includeAttachment)\n      publishDate @include(if: $includePublishDate)\n    }\n    nextCursor\n    hasMore\n  }\n}"): (typeof documents)["query PublicPosts($cursor: String, $limit: Int! = 25, $sortBy: PostSortField! = CREATED_AT, $sortDirection: SortDirection! = DESC, $includeAvatar: Boolean! = true, $includeHomePage: Boolean! = true, $includeEmail: Boolean! = true, $includeAttachment: Boolean! = true, $includePublishDate: Boolean! = true) {\n  posts(\n    cursor: $cursor\n    limit: $limit\n    sortBy: $sortBy\n    sortDirection: $sortDirection\n  ) {\n    items {\n      id\n      parentId\n      rootId\n      path\n      message\n      userName\n      avatarUrl @include(if: $includeAvatar)\n      homePage @include(if: $includeHomePage)\n      email @include(if: $includeEmail)\n      attachmentUrl @include(if: $includeAttachment)\n      publishDate @include(if: $includePublishDate)\n    }\n    nextCursor\n    hasMore\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;