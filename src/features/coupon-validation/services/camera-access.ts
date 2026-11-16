import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CameraError, toCameraFailure } from '../utils/camera-failure';

const REAR_CAMERA: MediaStreamConstraints = {
  audio: false,
  video: { facingMode: { ideal: 'environment' } },
};

export interface CameraSession {
  stop(): void;
}

@Injectable({ providedIn: 'root' })
export class CameraAccess {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async start(video: HTMLVideoElement): Promise<CameraSession> {
    const stream = await this.openRearCamera();
    try {
      await this.show(video, stream);
    } catch {
      this.release(video, stream);
      throw new CameraError('unknown');
    }
    return { stop: () => this.release(video, stream) };
  }

  private async openRearCamera(): Promise<MediaStream> {
    const mediaDevices = this.mediaDevices();
    try {
      return await mediaDevices.getUserMedia(REAR_CAMERA);
    } catch (error) {
      throw new CameraError(toCameraFailure(error));
    }
  }

  private mediaDevices(): MediaDevices {
    const view = this.isBrowser ? this.document.defaultView : null;
    const mediaDevices = view?.navigator.mediaDevices;
    if (mediaDevices?.getUserMedia) {
      return mediaDevices;
    }
    throw new CameraError(view?.isSecureContext === false ? 'insecure' : 'unsupported');
  }

  private async show(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
  }

  private release(video: HTMLVideoElement, stream: MediaStream): void {
    stream.getTracks().forEach((track) => track.stop());
    if (video.srcObject === stream) {
      video.srcObject = null;
    }
  }
}
