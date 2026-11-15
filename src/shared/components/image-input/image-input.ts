import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, input, model, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImageUpload } from '../../services/image-upload';
import { Icon } from '../icon/icon';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Image field that takes a URL or uploads a local file and keeps the uploaded URL in `value`. */
@Component({
  selector: 'app-image-input',
  imports: [Icon],
  templateUrl: './image-input.html',
  host: { class: 'block' },
})
export class ImageInput {
  private readonly imageUpload = inject(ImageUpload);
  private upload: Subscription | null = null;

  readonly value = model('');
  readonly uploading = model(false);
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly previewAlt = input.required<string>();
  readonly previewClass = input('');

  readonly localPreview = signal<string | null>(null);
  readonly notice = signal('');
  readonly error = signal<string | null>(null);
  readonly preview = computed(() => this.localPreview() ?? this.value());

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.upload?.unsubscribe();
      this.setLocalPreview(null);
    });
  }

  changeUrl(url: string): void {
    this.reset();
    this.value.set(url);
  }

  pickFile(fileInput: HTMLInputElement): void {
    const file = fileInput.files?.[0];
    // Clearing the input lets the same file be picked again after an error.
    fileInput.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.error.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.error.set('La imagen no puede pesar más de 5 MB.');
      return;
    }
    this.reset();
    this.setLocalPreview(URL.createObjectURL(file));
    this.uploading.set(true);
    this.notice.set('Subiendo imagen…');
    this.upload = this.imageUpload.upload(file).subscribe({
      next: (url) => {
        this.value.set(url);
        this.setLocalPreview(null);
        this.uploading.set(false);
        this.notice.set('Imagen subida.');
      },
      error: (error: unknown) => {
        this.setLocalPreview(null);
        this.uploading.set(false);
        this.notice.set('');
        this.error.set(
          error instanceof HttpErrorResponse && error.status === HttpStatusCode.ServiceUnavailable
            ? 'La subida de imágenes no está disponible por ahora.'
            : 'No pudimos subir la imagen. Probá de nuevo.',
        );
      },
    });
  }

  remove(): void {
    this.reset();
    this.value.set('');
  }

  private reset(): void {
    this.upload?.unsubscribe();
    this.upload = null;
    this.setLocalPreview(null);
    this.uploading.set(false);
    this.notice.set('');
    this.error.set(null);
  }

  private setLocalPreview(url: string | null): void {
    const previous = this.localPreview();
    if (previous) {
      URL.revokeObjectURL(previous);
    }
    this.localPreview.set(url);
  }
}
