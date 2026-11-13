import jsQR from 'jsqr';

export interface QrImage {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

export function decodeQr({ data, width, height }: QrImage): string | null {
  const qr = jsQR(data, width, height, { inversionAttempts: 'dontInvert' });
  return qr?.data.trim() || null;
}
