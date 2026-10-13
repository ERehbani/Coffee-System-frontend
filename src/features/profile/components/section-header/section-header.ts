import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-section-header',
  template: `
    <div class="flex items-center justify-between gap-3">
      <h2 [id]="headingId()" class="text-xl leading-tight font-extrabold tracking-tight text-text">
        {{ heading() }}
      </h2>
      @if (badge(); as badge) {
        <span class="shrink-0 text-xs font-bold tracking-wide text-primary uppercase">
          {{ badge }}
        </span>
      } @else if (actionLabel(); as actionLabel) {
        <button
          type="button"
          (click)="action.emit()"
          class="shrink-0 rounded-md px-1 py-0.5 text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class SectionHeader {
  readonly headingId = input.required<string>();
  readonly heading = input.required<string>();
  readonly badge = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
