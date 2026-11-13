import {
  CameraError,
  CameraFailure,
  cameraFailureMessage,
  canRetryCamera,
  toCameraFailure,
} from './camera-failure';

describe('toCameraFailure', () => {
  it.each([
    ['NotAllowedError', 'denied'],
    ['SecurityError', 'denied'],
    ['NotFoundError', 'not-found'],
    ['OverconstrainedError', 'not-found'],
    ['NotReadableError', 'busy'],
  ])('maps the browser error %s to "%s"', (name, failure) => {
    expect(toCameraFailure(new DOMException('camera', name))).toBe(failure);
  });

  it('treats a TypeError from the camera API as an unsupported browser', () => {
    expect(toCameraFailure(new TypeError('getUserMedia is not a function'))).toBe('unsupported');
  });

  it('keeps the failure of a CameraError', () => {
    expect(toCameraFailure(new CameraError('insecure'))).toBe('insecure');
  });

  it('falls back to unknown for anything else', () => {
    expect(toCameraFailure(new DOMException('camera', 'AbortError'))).toBe('unknown');
    expect(toCameraFailure(new Error('boom'))).toBe('unknown');
    expect(toCameraFailure('NotAllowedError')).toBe('unknown');
    expect(toCameraFailure(undefined)).toBe('unknown');
  });
});

describe('cameraFailureMessage', () => {
  const failures: CameraFailure[] = [
    'denied',
    'not-found',
    'busy',
    'unsupported',
    'insecure',
    'unknown',
  ];

  it('has a different Spanish explanation for every failure', () => {
    const messages = failures.map(cameraFailureMessage);

    expect(new Set(messages).size).toBe(failures.length);
    expect(messages.every((message) => message.length > 0)).toBe(true);
  });

  it('tells the cafe how to unblock the camera', () => {
    expect(cameraFailureMessage('denied')).toContain('permiso');
    expect(cameraFailureMessage('insecure')).toContain('https');
    expect(cameraFailureMessage('not-found')).toContain('No encontramos ninguna cámara');
  });
});

describe('canRetryCamera', () => {
  it('offers a retry when the cafe can fix the problem', () => {
    expect(canRetryCamera('denied')).toBe(true);
    expect(canRetryCamera('not-found')).toBe(true);
    expect(canRetryCamera('busy')).toBe(true);
    expect(canRetryCamera('unknown')).toBe(true);
  });

  it('does not offer a retry when the browser or the connection cannot use a camera', () => {
    expect(canRetryCamera('unsupported')).toBe(false);
    expect(canRetryCamera('insecure')).toBe(false);
  });
});
