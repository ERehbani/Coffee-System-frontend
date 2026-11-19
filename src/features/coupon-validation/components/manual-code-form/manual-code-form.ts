import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-manual-code-form',
  imports: [],
  templateUrl: './manual-code-form.html',
  host: { class: 'block' },
})
export class ManualCodeForm {
  readonly disabled = input(false);
  readonly submitLabel = input('Validar código');
  readonly submitted = output<string>();

  protected readonly code = signal('');
  protected readonly canSubmit = computed(() => !this.disabled() && this.code().trim() !== '');

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.canSubmit()) {
      this.submitted.emit(this.code().trim());
    }
  }
}
