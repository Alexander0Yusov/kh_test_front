declare module "gifenc" {
  type Palette = number[][];
  interface QuantizeOptions {
    format?: "rgb444" | "rgb565" | "rgba4444";
    oneBitAlpha?: boolean | number;
  }
  interface FrameOptions {
    delay?: number;
    dispose?: number;
    palette: Palette;
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
  }
  interface Encoder {
    bytes(): Uint8Array;
    finish(): void;
    writeFrame(index: Uint8Array, width: number, height: number, options: FrameOptions): void;
  }
  export function GIFEncoder(): Encoder;
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: "rgb444" | "rgb565" | "rgba4444",
  ): Uint8Array;
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions,
  ): Palette;
}
