import { Component, computed, input } from '@angular/core';
import { create } from 'qrcode/lib/core/qrcode';

/** Blank border (in modules) required around the symbol so scanners can find it. */
const QUIET_ZONE = 4;

export interface QrSymbol {
  /** Side of the square, quiet zone included, in modules. */
  readonly dimension: number;
  /** SVG path with one rectangle per horizontal run of dark modules. */
  readonly path: string;
}

export function toQrSymbol(value: string): QrSymbol {
  const { modules } = create(value, { errorCorrectionLevel: 'M' });
  const size = modules.size;
  const commands: string[] = [];

  for (let row = 0; row < size; row++) {
    let col = 0;
    while (col < size) {
      if (!modules.get(row, col)) {
        col++;
        continue;
      }
      const start = col;
      while (col < size && modules.get(row, col)) {
        col++;
      }
      const run = col - start;
      commands.push(`M${start + QUIET_ZONE} ${row + QUIET_ZONE}h${run}v1h-${run}z`);
    }
  }

  return { dimension: size + QUIET_ZONE * 2, path: commands.join('') };
}

/** Renders `value` as a QR code (black on white, so it stays scannable in dark mode). */
@Component({
  selector: 'app-qr-code',
  template: `
    <svg
      role="img"
      [attr.aria-label]="label()"
      [attr.viewBox]="'0 0 ' + symbol().dimension + ' ' + symbol().dimension"
      [attr.width]="size()"
      [attr.height]="size()"
      shape-rendering="crispEdges"
      class="block max-w-full"
    >
      <rect [attr.width]="symbol().dimension" [attr.height]="symbol().dimension" fill="#fff" />
      <path [attr.d]="symbol().path" fill="#000" />
    </svg>
  `,
  host: { class: 'inline-block' },
})
export class QrCode {
  readonly value = input.required<string>();
  readonly size = input(240);
  readonly label = input('Código QR');

  protected readonly symbol = computed(() => toQrSymbol(this.value()));
}
