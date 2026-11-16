import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tier } from '../../types/tier.model';
import { TIERS_FIXTURE } from '../../utils/tier.fixture';
import { TierTable } from './tier-table';

@Component({
  imports: [TierTable],
  template: `<app-tier-table [tiers]="tiers" baseTierId="tier-bronce" (edit)="edited = $event" />`,
})
class Host {
  tiers: readonly Tier[] = TIERS_FIXTURE;
  edited: Tier | null = null;
}

describe('TierTable', () => {
  it('emits the tier of the clicked row', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('button[aria-label="Editar ORO"]').click();

    expect(fixture.componentInstance.edited?.name).toBe('ORO');
  });

  it('formats the points for es-AR', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('7.000');
  });
});
