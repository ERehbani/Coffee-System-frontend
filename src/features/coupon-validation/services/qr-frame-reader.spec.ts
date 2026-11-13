import { TestBed } from '@angular/core/testing';
import { QrImage } from '../utils/qr-decoder';
import { blankImage, qrImageOf } from '../utils/qr-image.fixture';
import { fitFrame, QrFrameReader } from './qr-frame-reader';

describe('fitFrame', () => {
  it('scales a large frame down to 640 pixels on its longest side', () => {
    expect(fitFrame(1280, 720)).toEqual({ width: 640, height: 360 });
    expect(fitFrame(1080, 1920)).toEqual({ width: 360, height: 640 });
  });

  it('keeps a small frame as it is', () => {
    expect(fitFrame(320, 240)).toEqual({ width: 320, height: 240 });
  });

  it('has no frame while the video has no size', () => {
    expect(fitFrame(0, 0)).toBeNull();
    expect(fitFrame(640, 0)).toBeNull();
  });
});

describe('QrFrameReader', () => {
  let reader: QrFrameReader;
  let drawImage: ReturnType<typeof vi.fn>;
  let getImageData: ReturnType<typeof vi.fn>;
  let getContext: ReturnType<typeof vi.spyOn>;

  function videoOfSize(width: number, height: number): HTMLVideoElement {
    const video = document.createElement('video');
    Object.defineProperty(video, 'videoWidth', { value: width });
    Object.defineProperty(video, 'videoHeight', { value: height });
    return video;
  }

  function showOnCanvas(image: QrImage): void {
    getImageData.mockReturnValue(image);
  }

  beforeEach(() => {
    drawImage = vi.fn();
    getImageData = vi.fn();
    getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage, getImageData } as unknown as CanvasRenderingContext2D);
    TestBed.configureTestingModule({ providers: [QrFrameReader] });
    reader = TestBed.inject(QrFrameReader);
  });

  afterEach(() => vi.restoreAllMocks());

  it('draws the current frame scaled down and decodes the QR in it', () => {
    const code = '3f2b8c1e-9d4a-4c7b-8e21-5a6f0d9b7c34';
    const video = videoOfSize(1280, 720);
    showOnCanvas(qrImageOf(code));

    expect(reader.read(video)).toBe(code);
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 360);
    expect(getImageData).toHaveBeenCalledWith(0, 0, 640, 360);
  });

  it('asks the canvas for a context meant to be read often', () => {
    showOnCanvas(blankImage(10));

    reader.read(videoOfSize(320, 240));

    expect(getContext).toHaveBeenCalledWith('2d', { willReadFrequently: true });
  });

  it('returns null when the frame has no QR', () => {
    showOnCanvas(blankImage(120));

    expect(reader.read(videoOfSize(320, 240))).toBeNull();
  });

  it('reads nothing until the video has frames', () => {
    expect(reader.read(videoOfSize(0, 0))).toBeNull();
    expect(drawImage).not.toHaveBeenCalled();
  });

  it('returns null when the browser has no 2d canvas', () => {
    getContext.mockReturnValue(null);

    expect(reader.read(videoOfSize(320, 240))).toBeNull();
  });
});
