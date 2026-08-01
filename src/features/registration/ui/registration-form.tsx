"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import { type RegistrationValues, registrationSchema } from "../model/registration-schema";
import { registerUser } from "../model/register-user";

interface RegistrationFormProps {
  avatarField: ReactNode;
  avatarReady: boolean;
  client: RestClient;
  onBusyChange: (busy: boolean) => void;
  onSuccess: () => void;
  uploadAvatar: () => Promise<string>;
}

export function RegistrationForm({
  avatarField,
  avatarReady,
  client,
  onBusyChange,
  onSuccess,
  uploadAvatar,
}: RegistrationFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<RegistrationValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(registrationSchema),
  });

  const submit = handleSubmit(async (values) => {
    if (!avatarReady) {
      setError("root", { message: "Выберите и подготовьте обязательный avatar." });
      return;
    }
    onBusyChange(true);
    try {
      const avatarFileId = await uploadAvatar();
      const result = await registerUser(client, values, avatarFileId);
      if (result.status === "registered") {
        reset();
        onSuccess();
        toast.success("Регистрация завершена. Теперь выполните Login.");
      } else if (result.status === "duplicate") {
        setError("email", { message: result.message, type: "server" });
      } else if (result.status === "validation-error") {
        setError("root", { message: result.message, type: "server" });
      } else {
        toast.error(result.message);
      }
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Не удалось зарегистрироваться.");
    } finally {
      onBusyChange(false);
    }
  });

  return (
    <form className="registration-form" noValidate onSubmit={submit}>
      <FormField error={errors.email?.message} htmlFor="register-email" label="Email">
        <Input aria-describedby={errors.email ? "register-email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" disabled={isSubmitting} id="register-email" type="email" {...register("email")} />
      </FormField>
      <FormField error={errors.password?.message} htmlFor="register-password" label="Пароль">
        <Input aria-describedby={errors.password ? "register-password-error" : undefined} aria-invalid={Boolean(errors.password)} autoComplete="new-password" disabled={isSubmitting} id="register-password" type="password" {...register("password")} />
      </FormField>
      {avatarField}
      {errors.root?.message ? <p className="form-error" role="alert">{errors.root.message}</p> : null}
      <Button disabled={isSubmitting || !avatarReady} type="submit">
        {isSubmitting ? "Регистрация…" : "Register"}
      </Button>
    </form>
  );
}
