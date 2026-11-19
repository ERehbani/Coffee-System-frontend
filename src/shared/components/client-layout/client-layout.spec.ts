import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TOAST_DURATION_MS, ToastService } from '../toast/toast.service';
import { ClientLayout } from './client-layout';

describe('ClientLayout toasts', () => {
  let fixture: ComponentFixture<ClientLayout>;
  let root: HTMLElement;
  let toast: ToastService;

  const toastElement = (role: 'status' | 'alert') => root.querySelector<HTMLElement>(`[role="${role}"]`);

  function show(action: () => void): void {
    action();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] }).compileComponents();
    fixture = TestBed.createComponent(ClientLayout);
    root = fixture.nativeElement;
    toast = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  it('shows a success as a status fixed at the top of the screen', () => {
    show(() => toast.success('¡Listo!'));

    expect(toastElement('status')?.textContent).toContain('¡Listo!');
    const container = root.querySelector('app-toast-host > div')!;
    expect(container.classList).toContain('fixed');
    expect(container.classList).toContain('top-0');
    expect(container.classList).toContain('pointer-events-none');
    expect(toastElement('status')?.classList).toContain('pointer-events-auto');
  });

  it('shows an error as an alert', () => {
    show(() => toast.error('No pudimos agregar el producto.'));

    expect(toastElement('alert')?.textContent).toContain('No pudimos agregar el producto.');
    expect(toastElement('status')).toBeNull();
  });

  it('offers the link of the notice and closes it when followed', () => {
    show(() => toast.success('¡Canjeaste!', { label: 'Ver mis cupones', route: '/profile/coupons' }));

    const link = root.querySelector<HTMLAnchorElement>('[role="status"] a')!;
    expect(link.getAttribute('href')).toBe('/profile/coupons');
    expect(link.textContent).toContain('Ver mis cupones');

    link.click();

    expect(toast.toasts()).toEqual([]);
  });

  it('dismisses a success after its time and keeps an error longer', () => {
    show(() => {
      toast.success('Guardado');
      toast.error('Falló');
    });

    vi.advanceTimersByTime(TOAST_DURATION_MS.success);
    fixture.detectChanges();
    expect(toast.toasts().map(({ message }) => message)).toEqual(['Falló']);

    vi.advanceTimersByTime(TOAST_DURATION_MS.error - TOAST_DURATION_MS.success);
    fixture.detectChanges();
    expect(toast.toasts()).toEqual([]);
  });

  it('replaces a repeated notice and keeps only the latest three', () => {
    show(() => ['A', 'A', 'B', 'C', 'D'].forEach((message) => toast.success(message)));

    expect(toast.toasts().map(({ message }) => message)).toEqual(['B', 'C', 'D']);
  });

  it('removes the toast from the screen once it is dismissed', () => {
    show(() => toast.success('Guardado'));

    show(() => toast.dismiss(toast.toasts()[0].id));
    vi.runAllTimers();
    fixture.detectChanges();

    expect(toastElement('status')).toBeNull();
  });

  it('closes a toast with its close button', () => {
    show(() => toast.error('Falló'));

    root.querySelector<HTMLButtonElement>('[role="alert"] button[aria-label="Cerrar"]')!.click();

    expect(toast.toasts()).toEqual([]);
  });
});
