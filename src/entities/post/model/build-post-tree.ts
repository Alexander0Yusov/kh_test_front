import type { PostViewModel } from "./posts-slice";

export interface PostTreeRow {
  depth: number;
  post: PostViewModel;
}

function comparePathSegment(left: string, right: string): number {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }

  return left.localeCompare(right);
}

function compareMaterializedPaths(left: string, right: string): number {
  const leftSegments = left.split(".");
  const rightSegments = right.split(".");
  const length = Math.max(leftSegments.length, rightSegments.length);

  for (let index = 0; index < length; index += 1) {
    const leftSegment = leftSegments[index];
    const rightSegment = rightSegments[index];

    if (leftSegment === undefined) return -1;
    if (rightSegment === undefined) return 1;

    const result = comparePathSegment(leftSegment, rightSegment);
    if (result !== 0) return result;
  }

  return 0;
}

export function buildPostTreeRows(
  postsById: Record<string, PostViewModel>,
  rootIds: string[],
): PostTreeRow[] {
  const childIdsByParent = new Map<string, string[]>();

  for (const post of Object.values(postsById)) {
    if (post.parentId === null || post.parentId === post.id) continue;
    const childIds = childIdsByParent.get(post.parentId) ?? [];
    childIds.push(post.id);
    childIdsByParent.set(post.parentId, childIds);
  }

  for (const childIds of childIdsByParent.values()) {
    childIds.sort((leftId, rightId) =>
      compareMaterializedPaths(
        postsById[leftId]?.path ?? "",
        postsById[rightId]?.path ?? "",
      ),
    );
  }

  const rows: PostTreeRow[] = [];
  const visited = new Set<string>();

  const appendFamily = (firstId: string): void => {
    const stack = [{ depth: 0, id: firstId }];

    while (stack.length > 0) {
      const entry = stack.pop();
      if (!entry || visited.has(entry.id)) continue;
      const post = postsById[entry.id];
      if (!post) continue;

      visited.add(entry.id);
      rows.push({ depth: entry.depth, post });

      const childIds = childIdsByParent.get(entry.id) ?? [];
      for (let index = childIds.length - 1; index >= 0; index -= 1) {
        const childId = childIds[index];
        if (childId !== undefined) {
          stack.push({ depth: entry.depth + 1, id: childId });
        }
      }
    }
  };

  for (const rootId of rootIds) appendFamily(rootId);

  for (const post of Object.values(postsById)) {
    if (!visited.has(post.id)) appendFamily(post.id);
  }

  return rows;
}
