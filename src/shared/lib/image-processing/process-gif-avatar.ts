import pica from "pica";
import { decompressFrames, parseGIF } from "gifuct-js";
import { GIFEncoder, applyPalette, quantize } from "gifenc";

import {
  MAX_AVATAR_BYTES,
  MAX_AVATAR_HEIGHT,
  MAX_AVATAR_WIDTH,
  type ProcessedAvatar,
} from "./image-contract";

function loopCount(parsed: ReturnType<typeof parseGIF>): number {
  for (const frame of parsed.frames) {
    if (!("application" in frame) || !frame.application.id.startsWith("NETSCAPE")) continue;
    const blocks = frame.application.blocks;
    const marker = blocks.indexOf(1);
    if (marker >= 0 && blocks.length >= marker + 3) {
      return (blocks[marker + 1] ?? 0) | ((blocks[marker + 2] ?? 0) << 8);
    }
  }
  return -1;
}

function clearRect(data: ImageData, left: number, top: number, width: number, height: number): void {
  for (let y = top; y < top + height; y += 1) {
    data.data.fill(0, (y * data.width + left) * 4, (y * data.width + left + width) * 4);
  }
}

export async function processGifAvatar(file: File): Promise<ProcessedAvatar> {
  const parsed = parseGIF(await file.arrayBuffer());
  const sourceWidth = parsed.lsd.width;
  const sourceHeight = parsed.lsd.height;
  const scale = Math.min(1, MAX_AVATAR_WIDTH / sourceWidth, MAX_AVATAR_HEIGHT / sourceHeight);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  if (scale === 1 && file.size <= MAX_AVATAR_BYTES) {
    return { extension: ".gif", file, height, width };
  }

  const frames = decompressFrames(parsed, true);
  if (frames.length === 0) throw new Error("GIF не содержит читаемых кадров.");
  const source = new ImageData(sourceWidth, sourceHeight);
  let restoreSnapshot: Uint8ClampedArray | null = null;
  let previous = frames[0];
  const encoder = GIFEncoder();

  for (const [index, frame] of frames.entries()) {
    if (index > 0) {
      if (previous.disposalType === 2) {
        clearRect(source, previous.dims.left, previous.dims.top, previous.dims.width, previous.dims.height);
      } else if (previous.disposalType === 3 && restoreSnapshot) {
        source.data.set(restoreSnapshot);
      }
    }
    restoreSnapshot = frame.disposalType === 3 ? source.data.slice() : null;
    for (let y = 0; y < frame.dims.height; y += 1) {
      const from = y * frame.dims.width * 4;
      const to = ((y + frame.dims.top) * sourceWidth + frame.dims.left) * 4;
      const patch = frame.patch.subarray(from, from + frame.dims.width * 4);
      for (let x = 0; x < frame.dims.width; x += 1) {
        const patchOffset = x * 4;
        if ((patch[patchOffset + 3] ?? 0) === 0) continue;
        source.data.set(patch.subarray(patchOffset, patchOffset + 4), to + patchOffset);
      }
    }

    const fromCanvas = document.createElement("canvas");
    fromCanvas.width = sourceWidth;
    fromCanvas.height = sourceHeight;
    fromCanvas.getContext("2d")?.putImageData(source, 0, 0);
    const toCanvas = document.createElement("canvas");
    toCanvas.width = width;
    toCanvas.height = height;
    await pica().resize(fromCanvas, toCanvas);
    const rgba = toCanvas.getContext("2d")?.getImageData(0, 0, width, height).data;
    if (!rgba) throw new Error("Не удалось обработать кадр GIF.");
    const palette = quantize(rgba, 256, { format: "rgba4444", oneBitAlpha: true });
    const indexed = applyPalette(rgba, palette, "rgba4444");
    const transparentIndex = palette.findIndex((color) => (color[3] ?? 255) === 0);
    encoder.writeFrame(indexed, width, height, {
      delay: frame.delay,
      dispose: 1,
      palette,
      repeat: loopCount(parsed),
      transparent: transparentIndex >= 0,
      transparentIndex: Math.max(0, transparentIndex),
    });
    previous = frame;
  }
  encoder.finish();
  const bytes = encoder.bytes();
  if (bytes.byteLength > MAX_AVATAR_BYTES) {
    throw new Error("Анимированный GIF после resize превышает 100 KiB.");
  }
  const verified = parseGIF(Uint8Array.from(bytes).buffer);
  if (verified.lsd.width !== width || verified.lsd.height !== height) {
    throw new Error("GIF не прошёл проверку итоговых dimensions.");
  }
  return {
    extension: ".gif",
    file: new File([Uint8Array.from(bytes).buffer], file.name.replace(/\.[^.]+$/, ".gif"), { type: "image/gif" }),
    height,
    width,
  };
}
