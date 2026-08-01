import type { RestClient, components } from "@/shared/api";

type Captcha = components["schemas"]["CaptchaResponseDto"];

export async function loadPostCaptcha(
  client: RestClient,
  signal: AbortSignal,
): Promise<Captcha> {
  const response = await client.GET("/posts/captcha", { signal });

  if (!response.data) {
    throw new Error("CAPTCHA is unavailable. Please try again.");
  }

  return response.data;
}
