export const MAX_AVATAR_BYTES = 102_400;
export const MAX_AVATAR_WIDTH = 320;
export const MAX_AVATAR_HEIGHT = 240;

export type AvatarExtension = ".gif" | ".jpg" | ".png";

export interface ProcessedAvatar {
  extension: AvatarExtension;
  file: File;
  height: number;
  width: number;
}

export type ImageProcessingStage = "processing" | "validating";
