export type CameraFailure =
  'denied' | 'not-found' | 'busy' | 'unsupported' | 'insecure' | 'unknown';

export class CameraError extends Error {
  constructor(readonly failure: CameraFailure) {
    super(`Camera unavailable: ${failure}`);
    this.name = 'CameraError';
  }
}

const FAILURE_BY_ERROR_NAME: ReadonlyMap<string, CameraFailure> = new Map<string, CameraFailure>([
  ['NotAllowedError', 'denied'],
  ['SecurityError', 'denied'],
  ['NotFoundError', 'not-found'],
  ['OverconstrainedError', 'not-found'],
  ['NotReadableError', 'busy'],
  ['TypeError', 'unsupported'],
]);

const MESSAGES: Readonly<Record<CameraFailure, string>> = {
  denied:
    'No tenemos permiso para usar la cámara. Habilitalo desde la configuración del navegador y volvé a intentar.',
  'not-found': 'No encontramos ninguna cámara en este dispositivo.',
  busy: 'La cámara está ocupada por otra aplicación. Cerrala y volvé a intentar.',
  unsupported: 'Este navegador no permite usar la cámara.',
  insecure: 'La cámara solo funciona si entrás a la app con una conexión segura (https).',
  unknown: 'No pudimos encender la cámara. Volvé a intentar.',
};

const WITHOUT_RETRY: ReadonlySet<CameraFailure> = new Set<CameraFailure>([
  'unsupported',
  'insecure',
]);

function errorName(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return null;
  }
  return typeof error.name === 'string' ? error.name : null;
}

export function toCameraFailure(error: unknown): CameraFailure {
  if (error instanceof CameraError) {
    return error.failure;
  }
  const name = errorName(error);
  return (name && FAILURE_BY_ERROR_NAME.get(name)) || 'unknown';
}

export function cameraFailureMessage(failure: CameraFailure): string {
  return MESSAGES[failure];
}

export function canRetryCamera(failure: CameraFailure): boolean {
  return !WITHOUT_RETRY.has(failure);
}
