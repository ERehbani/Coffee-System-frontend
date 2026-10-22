import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPageHeader } from './admin-page-header';

@Component({
  imports: [AdminPageHeader],
  template: `
    <app-admin-page-header title="Tiers" subtitle="Niveles de fidelidad">
      <button actions type="button">Nuevo tier</button>
      <button type="button">Contenido sin proyectar</button>
    </app-admin-page-header>
  `,
})
class HeaderWithActionHost {}

describe('AdminPageHeader', () => {
  function createHeader(title: string): ComponentFixture<AdminPageHeader> {
    const fixture = TestBed.createComponent(AdminPageHeader);
    fixture.componentRef.setInput('title', title);
    return fixture;
  }

  it('renders the title as the page heading', async () => {
    const fixture = createHeader('Usuarios');
    await fixture.whenStable();

    const heading = (fixture.nativeElement as HTMLElement).querySelector('h1');

    expect(heading?.textContent?.trim()).toBe('Usuarios');
  });

  it('renders the subtitle only when it is provided', async () => {
    const fixture = createHeader('Usuarios');
    const root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    expect(root.querySelector('p')).toBeNull();

    fixture.componentRef.setInput('subtitle', 'Auditoría de perfiles registrados');
    await fixture.whenStable();

    expect(root.querySelector('p')?.textContent?.trim()).toBe('Auditoría de perfiles registrados');
  });

  it('projects only the content marked as actions into the action slot', async () => {
    const hostFixture = TestBed.createComponent(HeaderWithActionHost);
    await hostFixture.whenStable();
    const host = hostFixture.nativeElement as HTMLElement;

    const actions = host.querySelectorAll('app-admin-page-header button[actions]');
    const slot = actions[0]?.parentElement;

    expect(actions.length).toBe(1);
    expect(actions[0].textContent?.trim()).toBe('Nuevo tier');
    expect(slot?.textContent).not.toContain('Contenido sin proyectar');
  });
});
