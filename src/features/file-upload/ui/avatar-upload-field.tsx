"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ProcessedAvatar } from "@/shared/lib/image-processing";

import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import type { AvatarUploadController } from "../model/use-avatar-upload";

const STATUS_LABELS = {
  awaitingConfirmation: "Ожидание подтверждения Files service…",
  failed: "Требуется исправление",
  idle: "Avatar не выбран",
  processing: "Обработка изображения…",
  ready: "Готов к загрузке",
  requesting: "Подготовка Presigned POST…",
  subscribing: "Подписка на подтверждение…",
  uploaded: "Avatar подтверждён",
  uploading: "Загрузка в storage…",
  validating: "Проверка изображения…",
} as const;

export function AvatarUploadField({ controller }: { controller: AvatarUploadController }) {
  return (
    <FormField error={controller.error ?? undefined} htmlFor="register-avatar" label="Avatar">
      <Input
        accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
        disabled={["requesting", "subscribing", "uploading", "awaitingConfirmation"].includes(controller.status)}
        id="register-avatar"
        key={controller.inputKey}
        onChange={controller.onFileChange}
        type="file"
      />
      {controller.file ? (
        <AvatarPreview
          controller={controller}
          file={controller.file}
          key={`${controller.file.file.name}-${controller.file.file.lastModified}-${controller.file.file.size}`}
        />
      ) : (
        <span className="avatar-status" role="status">{STATUS_LABELS[controller.status]}</span>
      )}
    </FormField>
  );
}

function AvatarPreview({
  controller,
  file,
}: {
  controller: AvatarUploadController;
  file: ProcessedAvatar;
}) {
  const [previewUrl] = useState(() => URL.createObjectURL(file.file));
  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  return (
    <div className="avatar-preview">
      <Image alt="Предпросмотр avatar" className="avatar-preview-image" height={80} src={previewUrl} unoptimized width={80} />
      <div className="avatar-preview-details">
        <span>{file.file.name}</span>
        <span>{file.file.type}</span>
        <span>{file.file.size} bytes</span>
        <span>{file.width} × {file.height}px</span>
        <span>{STATUS_LABELS[controller.status]}</span>
      </div>
      <Button disabled={["requesting", "subscribing", "uploading", "awaitingConfirmation"].includes(controller.status)} onClick={controller.remove}>
        Удалить
      </Button>
    </div>
  );
}
