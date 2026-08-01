"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { PostViewModel } from "@/entities/post";
import type { RestClient } from "@/shared/api";

import {
  type CreatePostFormInput,
  type CreatePostValues,
  createPostSchema,
} from "./create-post-schema";
import { createRootPost } from "./create-root-post";
import { usePostCaptcha } from "./use-post-captcha";

interface UseCreateRootPostOptions {
  client: RestClient;
  isAuthenticated: boolean;
  onCreated: (post: PostViewModel) => void;
  onCreatedWithoutEnrichment: () => void;
  onSuccess: () => void;
  onUnauthorized: () => void;
  uploadAttachment: () => Promise<string | undefined>;
}

const CREATE_POST_FIELDS = new Set<string>([
  "captchaValue",
  "email",
  "homePage",
  "message",
  "userName",
]);

function isCreatePostField(value: string): value is keyof CreatePostFormInput {
  return CREATE_POST_FIELDS.has(value);
}

export function useCreateRootPost({
  client,
  isAuthenticated,
  onCreated,
  onCreatedWithoutEnrichment,
  onSuccess,
  onUnauthorized,
  uploadAttachment,
}: UseCreateRootPostOptions) {
  const captcha = usePostCaptcha(client);
  const form = useForm<CreatePostFormInput, unknown, CreatePostValues>({
    defaultValues: {
      captchaValue: "",
      email: "",
      homePage: "",
      message: "",
      userName: "",
    },
    resolver: zodResolver(createPostSchema),
  });

  const refreshCaptcha = useCallback(async (): Promise<void> => {
    form.setValue("captchaValue", "", {
      shouldDirty: false,
      shouldValidate: false,
    });
    form.clearErrors("captchaValue");
    await captcha.refresh();
  }, [captcha, form]);

  const submit = form.handleSubmit(async (values) => {
    if (!isAuthenticated) {
      form.setError("root", {
        message: "Sign in before creating a message.",
        type: "session",
      });
      return;
    }

    const captchaId = captcha.captchaId;
    if (!captchaId) {
      form.setError("captchaValue", {
        message: "Load a CAPTCHA challenge before submitting.",
        type: "captcha",
      });
      return;
    }

    let attachmentFileId: string | undefined;
    try {
      attachmentFileId = await uploadAttachment();
    } catch (reason: unknown) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "The attachment could not be uploaded.",
      );
      return;
    }

    try {
      const result = await createRootPost({
        attachmentFileId,
        captchaId,
        client,
        values,
      });

      if (result.status === "created") {
        onCreated(result.post);
        form.reset();
        onSuccess();
        toast.success("Message created.");
        return;
      }

      if (result.status === "created-without-enrichment") {
        form.reset();
        onCreatedWithoutEnrichment();
        onSuccess();
        toast.warning(
          "Message created, but the feed could not be updated. Reloading the feed.",
        );
        return;
      }

      if (result.code === "UNAUTHORIZED") {
        onUnauthorized();
      }

      const field = result.field;
      if (field && isCreatePostField(field)) {
        form.setError(field, {
          message: result.message,
          type: "server",
        });
      } else if (result.code === "INVALID_CAPTCHA") {
        form.setError("captchaValue", {
          message: "CAPTCHA is invalid or expired.",
          type: "server",
        });
      } else {
        form.setError("root", { message: result.message, type: "server" });
      }

      form.setValue("captchaValue", "", {
        shouldDirty: false,
        shouldValidate: false,
      });
      await captcha.refresh();
    } catch {
      toast.error("The message service is unavailable.");
      form.setValue("captchaValue", "", {
        shouldDirty: false,
        shouldValidate: false,
      });
      await captcha.refresh();
    }
  });

  return { captcha, form, refreshCaptcha, submit };
}
