import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-admin-page-header',
  templateUrl: './admin-page-header.html',
  host: { class: 'block' },
})
export class AdminPageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
