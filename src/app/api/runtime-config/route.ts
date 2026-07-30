import { connection } from "next/server";

import { RuntimeConfigError } from "@/shared/config";
import { readRuntimeConfig } from "@/shared/config/server";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  await connection();

  try {
    return Response.json(readRuntimeConfig(), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    if (error instanceof RuntimeConfigError) {
      return Response.json(
        {
          code: "RUNTIME_CONFIG_INVALID",
          message: "Frontend runtime configuration is unavailable.",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
          status: 500,
        },
      );
    }

    throw error;
  }
}
