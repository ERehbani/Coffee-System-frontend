import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { SaveTierInput, Tier } from '../types/tier.model';
import { TIERS_FIXTURE } from '../utils/tier.fixture';
import { TierRepository } from './tier.repository';
import { AdminTierStore } from './tier.store';

describe('AdminTierStore', () => {
  const plata = TIERS_FIXTURE.find((tier) => tier.name === 'PLATA')!;
  const bronce = TIERS_FIXTURE.find((tier) => tier.name === 'BRONCE')!;

  let getTiers: ReturnType<typeof vi.fn>;
  let createTier: ReturnType<typeof vi.fn>;
  let updateTier: ReturnType<typeof vi.fn>;

  function create(tiers: Observable<readonly Tier[]> = of([...TIERS_FIXTURE].reverse())) {
    getTiers = vi.fn().mockReturnValue(tiers);
    createTier = vi.fn();
    updateTier = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        AdminTierStore,
        { provide: TierRepository, useValue: { getTiers, createTier, updateTier } },
      ],
    });
    return TestBed.inject(AdminTierStore);
  }

  const conflict = (message: string) => new HttpErrorResponse({ status: 409, error: message });

  it('loads the tiers on creation, sorted from the fewest points to the most', () => {
    const store = create();

    expect(store.status()).toBe('ready');
    expect(store.tiers().map((tier) => tier.name)).toEqual(['BRONCE', 'PLATA', 'ORO', 'DIAMANTE']);
  });

  it('is loading until the list arrives', () => {
    const list = new Subject<readonly Tier[]>();
    const store = create(list);

    expect(store.status()).toBe('loading');

    list.next(TIERS_FIXTURE);

    expect(store.status()).toBe('ready');
  });

  it('reports an error and retries with loadTiers', () => {
    const store = create(throwError(() => new Error('down')));

    expect(store.status()).toBe('error');
    expect(store.tiers()).toEqual([]);

    getTiers.mockReturnValue(of(TIERS_FIXTURE));
    store.loadTiers();

    expect(store.status()).toBe('ready');
    expect(store.tiers()).toHaveLength(4);
  });

  it('treats the tier with 0 points as the base tier', () => {
    const store = create();

    expect(store.isBaseTier(bronce)).toBe(true);
    expect(store.isBaseTier(plata)).toBe(false);
  });

  it('opens the drawer to create and to edit, and closes it clearing the form errors', () => {
    const store = create();

    store.openCreateDrawer();
    expect(store.isDrawerOpen()).toBe(true);
    expect(store.drawerMode()).toBe('create');
    expect(store.editingTier()).toBeNull();

    store.openEditDrawer(plata);
    expect(store.drawerMode()).toBe('edit');
    expect(store.editingTier()).toBe(plata);

    store.formErrors.set({ name: 'x' });
    store.closeDrawer();
    expect(store.isDrawerOpen()).toBe(false);
    expect(store.editingTier()).toBeNull();
    expect(store.formErrors()).toEqual({});
  });

  it('creates a tier, keeps the list sorted, closes the drawer and confirms', () => {
    const store = create();
    createTier.mockReturnValue(of({ id: 'new', name: 'Platino', minPoints: 5000 }));
    store.openCreateDrawer();

    store.saveTier({ name: 'Platino', minPoints: 5000 });

    expect(createTier).toHaveBeenCalledWith({ name: 'Platino', minPoints: 5000 });
    expect(store.tiers().map((tier) => tier.name)).toEqual([
      'BRONCE',
      'PLATA',
      'ORO',
      'Platino',
      'DIAMANTE',
    ]);
    expect(store.isDrawerOpen()).toBe(false);
    expect(store.isProcessing()).toBe(false);
    expect(store.actionMessage()).toEqual({ type: 'success', text: 'Tier creado.' });
  });

  it('updates the edited tier, re-sorts the list and confirms', () => {
    const store = create();
    updateTier.mockReturnValue(of({ ...plata, name: 'Plata plus', minPoints: 8000 }));
    store.openEditDrawer(plata);

    store.saveTier({ name: 'Plata plus', minPoints: 8000 });

    expect(updateTier).toHaveBeenCalledWith(plata.id, { name: 'Plata plus', minPoints: 8000 });
    expect(store.tiers().at(-1)?.name).toBe('Plata plus');
    expect(store.tiers()).toHaveLength(4);
    expect(store.isDrawerOpen()).toBe(false);
    expect(store.actionMessage()).toEqual({ type: 'success', text: 'Tier actualizado.' });
  });

  it('is processing while the save is in flight and ignores a second save', () => {
    const store = create();
    const response = new Subject<Tier>();
    createTier.mockReturnValue(response);
    store.openCreateDrawer();

    store.saveTier({ name: 'Platino', minPoints: 5000 });
    store.saveTier({ name: 'Platino', minPoints: 5000 });

    expect(store.isProcessing()).toBe(true);
    expect(createTier).toHaveBeenCalledTimes(1);

    response.next({ id: 'new', name: 'Platino', minPoints: 5000 });

    expect(store.isProcessing()).toBe(false);
  });

  it('keeps the drawer open and shows a duplicate name under the name field', () => {
    const store = create();
    createTier.mockReturnValue(throwError(() => conflict('A tier named Oro already exists')));
    store.openCreateDrawer();

    store.saveTier({ name: 'Oro', minPoints: 4000 });

    expect(store.isDrawerOpen()).toBe(true);
    expect(store.isProcessing()).toBe(false);
    expect(store.formErrors()).toEqual({ name: 'Ya existe un tier con ese nombre.' });
    expect(store.actionMessage()).toBeNull();
    expect(store.tiers()).toHaveLength(4);
  });

  it('shows duplicate points under the points field', () => {
    const store = create();
    updateTier.mockReturnValue(
      throwError(() => conflict('A tier with 3000 points already exists')),
    );
    store.openEditDrawer(plata);

    store.saveTier({ name: 'PLATA', minPoints: 3000 });

    expect(store.formErrors()).toEqual({
      minPoints: 'Ya existe un tier con esa cantidad de puntos.',
    });
  });

  it('shows an unexpected failure as a form error', () => {
    const store = create();
    createTier.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    store.openCreateDrawer();

    store.saveTier({ name: 'Nuevo', minPoints: 10 });

    expect(store.formErrors()).toEqual({ form: 'No pudimos guardar el tier. Inténtalo de nuevo.' });
    expect(store.isDrawerOpen()).toBe(true);
  });

  it('clears the previous server errors when a new save starts', () => {
    const store = create();
    store.openCreateDrawer();
    createTier.mockReturnValueOnce(throwError(() => conflict('A tier named Oro already exists')));
    store.saveTier({ name: 'Oro', minPoints: 4000 });
    const response = new Subject<Tier>();
    createTier.mockReturnValueOnce(response);

    store.saveTier({ name: 'Otro', minPoints: 4000 });

    expect(store.formErrors()).toEqual({});
  });

  it('clears the server error of a field once it is edited', () => {
    const store = create();
    store.formErrors.set({ name: 'a', minPoints: 'b' });

    store.clearFormError('name');

    expect(store.formErrors()).toEqual({ minPoints: 'b' });
  });

  it('dismisses the confirmation', () => {
    const store = create();
    createTier.mockReturnValue(of({ id: 'new', name: 'Nuevo', minPoints: 10 }));
    store.saveTier({ name: 'Nuevo', minPoints: 10 } satisfies SaveTierInput);

    store.dismissActionMessage();

    expect(store.actionMessage()).toBeNull();
  });
});
