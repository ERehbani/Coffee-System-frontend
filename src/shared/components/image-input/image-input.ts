import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, input, model, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImageUpload, UploadTarget } from '../../services/image-upload';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const UPLOAD_ERROR_MESSAGES: ReadonlyMap<number, string> = new Map([
  [HttpStatusCode.Forbidden, 'No tenés permiso para subir esta imagen.'],
  [HttpStatusCode.ServiceUnavailable, 'La subida de imágenes no está disponible por ahora.'],
]);

@Component({
  selector: 'app-image-input',
  imports: [],
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
  readonly target = input.required<UploadTarget>();
  readonly previewClass = input('');

  readonly localPreview = signal<string | null>(null);
  readonly notice = signal('');
  readonly error = signal<string | null>(null);
  readonly dragging = signal(false);
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
    // Vaciar el input permite volver a elegir el mismo archivo después de un error.
    fileInput.value = '';
    this.takeFile(file);
  }

  dragOver(event: DragEvent): void {
    // Sin preventDefault el navegador abre el archivo soltado en vez de entregarlo.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.dragging.set(true);
  }

  dragLeave(event: DragEvent): void {
    // Pasar sobre un hijo de la zona también dispara dragleave; solo salir de la zona termina el arrastre.
    const zone = event.currentTarget as Node;
    if (!zone.contains(event.relatedTarget as Node | null)) {
      this.dragging.set(false);
    }
  }

  drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.takeFile(event.dataTransfer?.files[0]);
  }

  remove(): void {
    this.reset();
    this.value.set('');
  }

  private takeFile(file: File | undefined): void {
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
    this.upload = this.imageUpload.upload(file, this.target()).subscribe({
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
          (error instanceof HttpErrorResponse && UPLOAD_ERROR_MESSAGES.get(error.status)) ||
            'No pudimos subir la imagen. Probá de nuevo.',
        );
      },
    });
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
