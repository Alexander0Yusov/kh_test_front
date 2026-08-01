import type { RestClient } from "@/shared/api";

export async function eraseAllData(client: RestClient): Promise<void> {
  const result = await client.DELETE("/erase-all-data");
  if (result.response.status !== 204) {
    throw new Error("Erase request failed.");
  }
}
