import type { RestClient } from "@/shared/api";

export async function createPostSeeds(client: RestClient): Promise<number> {
  const result = await client.POST("/posts/seeds");

  if (result.response.status !== 201 || !result.data) {
    throw new Error("Seed creation request failed.");
  }

  return result.data.createdCount;
}
