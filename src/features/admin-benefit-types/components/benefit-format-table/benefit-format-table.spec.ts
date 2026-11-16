import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BenefitFormat } from '../../types/benefit-format.model';
import { BENEFIT_FORMATS_FIXTURE } from '../../utils/benefit-format.fixture';
import { BenefitFormatEditRequest, BenefitFormatTable } from './benefit-format-table';

@Component({
  imports: [BenefitFormatTable],
  template: `<app-benefit-format-table [formats]="formats" (edit)="edited = $event" />`,
})
class Host {
  formats: readonly BenefitFormat[] = [
    ...BENEFIT_FORMATS_FIXTURE,
    {
      id: 'inactive',
      code: 'PRODUCTO_POR_PUNTOS',
      displayName: 'Por puntos',
      description: 'Canje con puntos.',
      active: false,
      usageCount: 1234,
    },
  ];
  edited: BenefitFormatEditRequest | null = null;
}

describe('BenefitFormatTable', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return fixture;
  }

  it('emits the format of the clicked row together with the button that was clicked', async () => {
    const fixture = await render();
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Editar Descuento"]',
    ) as HTMLButtonElement;

    button.click();

    expect(fixture.componentInstance.edited?.format.displayName).toBe('Descuento');
    expect(fixture.componentInstance.edited?.trigger).toBe(button);
  });

  it('formats the usage count for es-AR', async () => {
    const fixture = await render();

    expect(fixture.nativeElement.textContent).toContain('1.234');
  });

  it('names the format with its Spanish label', async () => {
    const fixture = await render();

    expect(fixture.nativeElement.textContent).toContain('Código de descuento');
    expect(fixture.nativeElement.textContent).toContain('Producto gratis para socios');
  });

  it('shows the state as a text badge, not only as a colour', async () => {
    const fixture = await render();
    const states = [...fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(5)')].map(
      (cell) => (cell as HTMLElement).textContent?.trim(),
    );

    expect(states).toEqual(['Activo', 'Activo', 'Activo', 'Inactivo']);
  });
});
