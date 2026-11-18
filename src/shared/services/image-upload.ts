import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

interface UploadSignatureDto {
  readonly cloudName: string;
  readonly apiKey: string;
  readonly timestamp: number;
  readonly folder: string;
  readonly allowedFormats: string;
  readonly signature: string;
}

export type UploadTarget = 'CAFE_LOGO' | 'CAFE_COVER' | 'PRODUCT_IMAGE' | 'CLIENT_AVATAR';

interface CloudinaryUploadDto {
  readonly secure_url: string;
}

@Injectable({ providedIn: 'root' })
export class ImageUpload {
  private readonly http = inject(HttpClient);

  upload(file: File, target: UploadTarget): Observable<string> {
    return this.http.post<UploadSignatureDto>(`${environment.apiBaseUrl}/media/signature`, { target }).pipe(
      switchMap((signed) => {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', signed.apiKey);
        form.append('timestamp', String(signed.timestamp));
        form.append('folder', signed.folder);
        form.append('allowed_formats', signed.allowedFormats);
        form.append('signature', signed.signature);
        // Cloudinary responde con Access-Control-Allow-Origin: *, que el navegador rechaza si la petición lleva credenciales.
        return this.http.post<CloudinaryUploadDto>(
          `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`,
          form,
          { credentials: 'omit' },
        );
      }),
      map((response) => response.secure_url),
    );
  }
}
