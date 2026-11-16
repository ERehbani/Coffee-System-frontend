import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { Icon } from '../icon/icon';

@Component({
  imports: [AdminPageHeader, Icon],
  selector: 'app-admin-placeholder-page',
  templateUrl: './admin-placeholder-page.html',
})
export class AdminPlaceholderPage {
  private readonly data = toSignal(inject(ActivatedRoute).data);

  protected readonly title = computed<string>(() => this.data()?.['title'] ?? '');
}
