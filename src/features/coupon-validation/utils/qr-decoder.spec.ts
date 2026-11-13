import { decodeQr } from './qr-decoder';
import { blankImage, qrImageOf } from './qr-image.fixture';

describe('decodeQr', () => {
  it('reads the validation code a client shows as a QR', () => {
    const code = '3f2b8c1e-9d4a-4c7b-8e21-5a6f0d9b7c34';

    expect(decodeQr(qrImageOf(code))).toBe(code);
  });

  it('trims the spaces around the decoded text', () => {
    expect(decodeQr(qrImageOf('  VLD-8492-C0FF  '))).toBe('VLD-8492-C0FF');
  });

  it('returns null when the image has no QR', () => {
    expect(decodeQr(blankImage(120))).toBeNull();
  });

  it('returns null when the QR only holds spaces', () => {
    expect(decodeQr(qrImageOf('   '))).toBeNull();
  });
});
