import { Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-manual-code-form',
  imports: [Icon],
  templateUrl: './manual-code-form.html',
  host: { class: 'block' },
})
export class ManualCodeForm {
  readonly disabled = input(false);
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
