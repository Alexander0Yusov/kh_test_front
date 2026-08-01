"use client";

import Image from "next/image";
import { type ReactNode, useEffect } from "react";

import type { PostViewModel } from "@/entities/post";
import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import { useCreateRootPost } from "../model/use-create-root-post";

interface CreateRootPostFormProps {
  attachmentField: ReactNode;
  client: RestClient;
  isAuthenticated: boolean;
  onCreated: (post: PostViewModel) => void;
  onCreatedWithoutEnrichment: () => void;
  onBusyChange: (busy: boolean) => void;
  onSuccess: () => void;
  onUnauthorized: () => void;
  uploadAttachment: () => Promise<string | undefined>;
}

export function CreateRootPostForm({
  attachmentField,
  client,
  isAuthenticated,
  onCreated,
  onCreatedWithoutEnrichment,
  onBusyChange,
  onSuccess,
  onUnauthorized,
  uploadAttachment,
}: CreateRootPostFormProps) {
  const { captcha, form, refreshCaptcha, submit } = useCreateRootPost({
    client,
    isAuthenticated,
    onCreated,
    onCreatedWithoutEnrichment,
    onSuccess,
    onUnauthorized,
    uploadAttachment,
  });
  const {
    formState: { errors, isSubmitting },
    register,
  } = form;

  useEffect(() => {
    onBusyChange(isSubmitting);
    return () => onBusyChange(false);
  }, [isSubmitting, onBusyChange]);

  return (
    <form className="create-post-form" noValidate onSubmit={submit}>
      <FormField
        error={errors.userName?.message}
        htmlFor="create-post-user-name"
        label="User name"
      >
        <Input
          aria-describedby={errors.userName ? "create-post-user-name-error" : undefined}
          aria-invalid={Boolean(errors.userName)}
          autoComplete="username"
          disabled={isSubmitting}
          id="create-post-user-name"
          {...register("userName")}
        />
      </FormField>
      <FormField
        error={errors.email?.message}
        htmlFor="create-post-email"
        label="Email"
      >
        <Input
          aria-describedby={errors.email ? "create-post-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          disabled={isSubmitting}
          id="create-post-email"
          type="email"
          {...register("email")}
        />
      </FormField>
      <FormField
        error={errors.homePage?.message}
        htmlFor="create-post-home-page"
        label="Home page (optional)"
      >
        <Input
          aria-describedby={errors.homePage ? "create-post-home-page-error" : undefined}
          aria-invalid={Boolean(errors.homePage)}
          autoComplete="url"
          disabled={isSubmitting}
          id="create-post-home-page"
          type="url"
          {...register("homePage")}
        />
      </FormField>
      <FormField
        error={errors.message?.message}
        htmlFor="create-post-message"
        label="Message"
      >
        <textarea
          aria-describedby="create-post-message-hint"
          aria-invalid={Boolean(errors.message)}
          className="ui-input create-post-message"
          disabled={isSubmitting}
          id="create-post-message"
          {...register("message")}
        />
        <span className="form-hint" id="create-post-message-hint">
          Allowed tags: a[href,title], strong, i, code. Unsupported markup is rejected.
        </span>
      </FormField>
      {attachmentField}
      <FormField
        error={errors.captchaValue?.message}
        htmlFor="create-post-captcha"
        label="CAPTCHA"
      >
        <div className="captcha-challenge" aria-live="polite">
          {captcha.status === "loading" ? (
            <span role="status">Loading CAPTCHA…</span>
          ) : null}
          {captcha.status === "error" ? (
            <span role="alert">{captcha.message}</span>
          ) : null}
          {captcha.image ? (
            <Image
              alt="CAPTCHA challenge"
              className="captcha-image"
              height={80}
              src={captcha.image}
              unoptimized
              width={200}
            />
          ) : null}
          <Button
            disabled={isSubmitting || captcha.status === "loading"}
            onClick={() => void refreshCaptcha()}
          >
            Refresh CAPTCHA
          </Button>
        </div>
        <Input
          aria-describedby={errors.captchaValue ? "create-post-captcha-error" : undefined}
          aria-invalid={Boolean(errors.captchaValue)}
          autoComplete="off"
          disabled={isSubmitting || captcha.status !== "ready"}
          id="create-post-captcha"
          {...register("captchaValue")}
        />
      </FormField>
      {errors.root?.message ? (
        <p className="form-error" role="alert">{errors.root.message}</p>
      ) : null}
      <Button
        disabled={isSubmitting || captcha.status !== "ready"}
        type="submit"
      >
        {isSubmitting ? "Creating message…" : "Create Message"}
      </Button>
    </form>
  );
}
