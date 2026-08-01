"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CurrentUser } from "@/entities/session";
import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";

import {
  type LoginValues,
  loginSchema,
} from "../model/login-schema";
import { loginUser } from "../model/login-user";

interface LoginFormProps {
  client: RestClient;
  onAuthenticated: (
    accessToken: string,
    currentUser: CurrentUser,
  ) => void;
  onSuccess: () => void;
}

export function LoginForm({
  client,
  onAuthenticated,
  onSuccess,
}: LoginFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const submit = handleSubmit(async (values) => {
    const result = await loginUser(client, values);

    if (result.status === "authenticated") {
      onAuthenticated(result.accessToken, result.currentUser);
      reset();
      onSuccess();
      toast.success("Вы вошли в систему.");
      return;
    }

    if (result.status === "credentials-error") {
      setError(result.field ?? "root", {
        message: result.message,
        type: "server",
      });
      return;
    }

    toast.error(result.message);
  });

  return (
    <form className="login-form" noValidate onSubmit={submit}>
      <FormField
        error={errors.email?.message}
        htmlFor="login-email"
        label="Email"
      >
        <Input
          aria-describedby={
            errors.email ? "login-email-error" : undefined
          }
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          id="login-email"
          type="email"
          {...register("email")}
        />
      </FormField>
      <FormField
        error={errors.password?.message}
        htmlFor="login-password"
        label="Пароль"
      >
        <PasswordInput
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          aria-invalid={Boolean(errors.password)}
          autoComplete="current-password"
          id="login-password"
          {...register("password")}
        />
      </FormField>
      {errors.root?.message ? (
        <p className="form-error" role="alert">
          {errors.root.message}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Вход…" : "Войти"}
      </Button>
    </form>
  );
}
