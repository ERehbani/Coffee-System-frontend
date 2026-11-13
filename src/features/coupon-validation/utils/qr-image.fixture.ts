import { create } from 'qrcode/lib/core/qrcode';
import { QrImage } from './qr-decoder';

const PIXELS_PER_MODULE = 4;
const QUIET_ZONE_MODULES = 4;
const CHANNELS = 4;

export function blankImage(side: number): QrImage {
  return {
    data: new Uint8ClampedArray(side * side * CHANNELS).fill(255),
    width: side,
    height: side,
  };
}

export function qrImageOf(value: string): QrImage {
  const { modules } = create(value, { errorCorrectionLevel: 'M' });
  const side = (modules.size + QUIET_ZONE_MODULES * 2) * PIXELS_PER_MODULE;
  const image = blankImage(side);

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const row = Math.floor(y / PIXELS_PER_MODULE) - QUIET_ZONE_MODULES;
      const col = Math.floor(x / PIXELS_PER_MODULE) - QUIET_ZONE_MODULES;
      const isInside = row >= 0 && col >= 0 && row < modules.size && col < modules.size;
      if (isInside && modules.get(row, col)) {
        image.data.fill(0, (y * side + x) * CHANNELS, (y * side + x) * CHANNELS + 3);
      }
    }
  }
  return image;
}
