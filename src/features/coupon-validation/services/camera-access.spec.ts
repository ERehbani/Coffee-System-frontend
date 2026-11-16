import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CameraError, CameraFailure } from '../utils/camera-failure';
import { CameraAccess } from './camera-access';

interface FakeStream {
  readonly stream: MediaStream;
  readonly tracks: { stop: ReturnType<typeof vi.fn> }[];
}

function fakeStream(): FakeStream {
  const tracks = [{ stop: vi.fn() }, { stop: vi.fn() }];
  return { tracks, stream: { getTracks: () => tracks } as unknown as MediaStream };
}

describe('CameraAccess', () => {
  let getUserMedia: ReturnType<typeof vi.fn>;
  let play: ReturnType<typeof vi.spyOn>;
  let video: HTMLVideoElement;

  function setUpBrowser(options: { secure: boolean; withCameraApi: boolean }): void {
    Object.defineProperty(window, 'isSecureContext', { value: options.secure, configurable: true });
    Object.defineProperty(navigator, 'mediaDevices', {
      value: options.withCameraApi ? { getUserMedia } : undefined,
      configurable: true,
    });
  }

  function create(platform = 'browser'): CameraAccess {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });
    return TestBed.inject(CameraAccess);
  }

  async function failureOf(start: Promise<unknown>): Promise<CameraFailure> {
    const error = await start.catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CameraError);
    return (error as CameraError).failure;
  }

  beforeEach(() => {
    getUserMedia = vi.fn();
    play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    video = document.createElement('video');
    setUpBrowser({ secure: true, withCameraApi: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, 'isSecureContext');
    Reflect.deleteProperty(navigator, 'mediaDevices');
  });

  it('asks for the rear camera, without audio, and plays it muted and inline', async () => {
    const { stream } = fakeStream();
    getUserMedia.mockResolvedValue(stream);

    await create().start(video);

    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: { facingMode: { ideal: 'environment' } },
    });
    expect(video.srcObject).toBe(stream);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(play).toHaveBeenCalledOnce();
  });

  it('stops every track and frees the video when the session stops', async () => {
    const { stream, tracks } = fakeStream();
    getUserMedia.mockResolvedValue(stream);

    const session = await create().start(video);
    session.stop();

    expect(tracks.every((track) => track.stop.mock.calls.length === 1)).toBe(true);
    expect(video.srcObject).toBeNull();
  });

  it('leaves alone a video that already shows another stream', async () => {
    const { stream, tracks } = fakeStream();
    const other = fakeStream().stream;
    getUserMedia.mockResolvedValue(stream);

    const session = await create().start(video);
    video.srcObject = other;
    session.stop();

    expect(tracks[0].stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBe(other);
  });

  it('explains a denied permission', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'));

    expect(await failureOf(create().start(video))).toBe('denied');
  });

  it('explains a device without camera', async () => {
    getUserMedia.mockRejectedValue(new DOMException('Requested device not found', 'NotFoundError'));

    expect(await failureOf(create().start(video))).toBe('not-found');
  });

  it('reports a browser without camera API', async () => {
    setUpBrowser({ secure: true, withCameraApi: false });

    expect(await failureOf(create().start(video))).toBe('unsupported');
  });

  it('reports that the camera needs a secure connection', async () => {
    setUpBrowser({ secure: false, withCameraApi: false });

    expect(await failureOf(create().start(video))).toBe('insecure');
  });

  it('never asks for the camera on the server', async () => {
    expect(await failureOf(create('server').start(video))).toBe('unsupported');
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('turns the camera off when the video cannot play', async () => {
    const { stream, tracks } = fakeStream();
    getUserMedia.mockResolvedValue(stream);
    play.mockRejectedValue(new DOMException('Interrupted', 'AbortError'));

    expect(await failureOf(create().start(video))).toBe('unknown');
    expect(tracks[0].stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });
});
