import { DOCUMENT, inject, Injectable } from '@angular/core';
import { decodeQr } from '../utils/qr-decoder';

const MAX_FRAME_SIDE = 640;

export interface FrameSize {
  readonly width: number;
  readonly height: number;
}

export function fitFrame(width: number, height: number): FrameSize | null {
  if (width <= 0 || height <= 0) {
    return null;
  }
  const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

@Injectable()
export class QrFrameReader {
  private readonly document = inject(DOCUMENT);
  private canvas: HTMLCanvasElement | null = null;

  read(video: HTMLVideoElement): string | null {
    const size = fitFrame(video.videoWidth, video.videoHeight);
    if (!size) {
      return null;
    }
    const context = this.contextFor(size);
    if (!context) {
      return null;
    }
    context.drawImage(video, 0, 0, size.width, size.height);
    return decodeQr(context.getImageData(0, 0, size.width, size.height));
  }

  private contextFor({ width, height }: FrameSize): CanvasRenderingContext2D | null {
    this.canvas ??= this.document.createElement('canvas');
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    return this.canvas.getContext('2d', { willReadFrequently: true });
  }
}
