import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { BenefitFormat } from '../types/benefit-format.model';
import { BENEFIT_FORMATS_FIXTURE } from '../utils/benefit-format.fixture';
import { BenefitFormatRepository } from './benefit-format.repository';
import { AdminBenefitFormatStore } from './benefit-format.store';

describe('AdminBenefitFormatStore', () => {
  const descuento = BENEFIT_FORMATS_FIXTURE.find((f) => f.code === 'CODIGO_DESCUENTO')!;
  const porPuntos: BenefitFormat = {
    id: 'new',
    code: 'PRODUCTO_POR_PUNTOS',
    displayName: 'Por puntos',
    description: 'Canje con puntos.',
    active: true,
    usageCount: 0,
  };
  const input = {
    code: 'PRODUCTO_POR_PUNTOS',
    displayName: 'Por puntos',
    description: 'Canje con puntos.',
    active: true,
  } as const;

  let getFormats: ReturnType<typeof vi.fn>;
  let createFormat: ReturnType<typeof vi.fn>;
  let updateFormat: ReturnType<typeof vi.fn>;

  function create(
    formats: Observable<readonly BenefitFormat[]> = of([...BENEFIT_FORMATS_FIXTURE].reverse()),
  ) {
    getFormats = vi.fn().mockReturnValue(formats);
    createFormat = vi.fn();
    updateFormat = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        AdminBenefitFormatStore,
        {
          provide: BenefitFormatRepository,
          useValue: { getFormats, createFormat, updateFormat },
        },
      ],
    });
    return TestBed.inject(AdminBenefitFormatStore);
  }

  const conflict = (message: string) => new HttpErrorResponse({ status: 409, error: message });

  it('loads the formats on creation, ordered by name', () => {
    const store = create();

    expect(store.status()).toBe('ready');
    expect(store.formats().map((format) => format.displayName)).toEqual([
      '2x1',
      'Descuento',
      'Producto gratis',
    ]);
  });

  it('is loading until the list arrives', () => {
    const list = new Subject<readonly BenefitFormat[]>();
    const store = create(list);

    expect(store.status()).toBe('loading');
    expect(store.canCreate()).toBe(false);

    list.next(BENEFIT_FORMATS_FIXTURE);

    expect(store.status()).toBe('ready');
  });

  it('reports an error and retries with loadFormats', () => {
    const store = create(throwError(() => new Error('down')));

    expect(store.status()).toBe('error');
    expect(store.formats()).toEqual([]);

    getFormats.mockReturnValue(of(BENEFIT_FORMATS_FIXTURE));
    store.loadFormats();

    expect(store.status()).toBe('ready');
    expect(store.formats()).toHaveLength(3);
  });

  it('is empty only once loaded without formats', () => {
    expect(create(of([])).isEmpty()).toBe(true);
  });

  it('offers only the formats that are not yet in the catalog', () => {
    const store = create();

    expect(store.availableCodes()).toEqual(['PRODUCTO_POR_PUNTOS']);
    expect(store.canCreate()).toBe(true);
  });

  it('offers every format while the catalog is empty and none when it is complete', () => {
    const store = create(of([]));
    expect(store.availableCodes()).toHaveLength(4);

    store.formats.set([...BENEFIT_FORMATS_FIXTURE, porPuntos]);

    expect(store.availableCodes()).toEqual([]);
    expect(store.canCreate()).toBe(false);
  });

  it('does not open the create drawer when every format is already in the catalog', () => {
    const store = create(of([...BENEFIT_FORMATS_FIXTURE, porPuntos]));

    store.openCreateDrawer();

    expect(store.isDrawerOpen()).toBe(false);
  });

  it('opens the drawer to create and to edit, and closes it clearing the form errors', () => {
    const store = create();

    store.openCreateDrawer();
    expect(store.isDrawerOpen()).toBe(true);
    expect(store.drawerMode()).toBe('create');
    expect(store.editingFormat()).toBeNull();

    store.openEditDrawer(descuento);
    expect(store.drawerMode()).toBe('edit');
    expect(store.editingFormat()).toBe(descuento);

    store.formErrors.set({ displayName: 'x' });
    store.closeDrawer();
    expect(store.isDrawerOpen()).toBe(false);
    expect(store.editingFormat()).toBeNull();
    expect(store.formErrors()).toEqual({});
  });

  it('registers a format, keeps the list ordered, closes the drawer and confirms', () => {
    const store = create();
    createFormat.mockReturnValue(of(porPuntos));
    store.openCreateDrawer();

    store.saveFormat(input);

    expect(createFormat).toHaveBeenCalledWith(input);
    expect(store.formats().map((format) => format.displayName)).toEqual([
      '2x1',
      'Descuento',
      'Por puntos',
      'Producto gratis',
    ]);
    expect(store.availableCodes()).toEqual([]);
    expect(store.isDrawerOpen()).toBe(false);
    expect(store.isProcessing()).toBe(false);
    expect(store.actionMessage()).toEqual({
      type: 'success',
      text: 'Tipo de beneficio creado.',
    });
  });

  it('updates the edited format, re-orders the list and confirms', () => {
    const store = create();
    updateFormat.mockReturnValue(of({ ...descuento, displayName: 'Zeta', active: false }));
    store.openEditDrawer(descuento);

    store.saveFormat({ ...input, code: 'CODIGO_DESCUENTO', displayName: 'Zeta', active: false });

    expect(updateFormat).toHaveBeenCalledWith(
      descuento.id,
      expect.objectContaining({ displayName: 'Zeta', active: false }),
    );
    expect(store.formats().at(-1)?.displayName).toBe('Zeta');
    expect(store.formats()).toHaveLength(3);
    expect(store.isDrawerOpen()).toBe(false);
    expect(store.actionMessage()).toEqual({
      type: 'success',
      text: 'Tipo de beneficio actualizado.',
    });
  });

  it('is processing while the save is in flight and ignores a second save', () => {
    const store = create();
    const response = new Subject<BenefitFormat>();
    createFormat.mockReturnValue(response);
    store.openCreateDrawer();

    store.saveFormat(input);
    store.saveFormat(input);

    expect(store.isProcessing()).toBe(true);
    expect(createFormat).toHaveBeenCalledTimes(1);

    response.next(porPuntos);

    expect(store.isProcessing()).toBe(false);
  });

  it('keeps the drawer open and shows a duplicate name under the name field', () => {
    const store = create();
    createFormat.mockReturnValue(
      throwError(() => conflict('A benefit type named Descuento already exists')),
    );
    store.openCreateDrawer();

    store.saveFormat({ ...input, displayName: 'Descuento' });

    expect(store.isDrawerOpen()).toBe(true);
    expect(store.isProcessing()).toBe(false);
    expect(store.formErrors()).toEqual({ displayName: 'Ya existe un tipo con ese nombre.' });
    expect(store.actionMessage()).toBeNull();
    expect(store.formats()).toHaveLength(3);
  });

  it('shows a format already in the catalog under the format field', () => {
    const store = create();
    createFormat.mockReturnValue(
      throwError(() => conflict('The format PRODUCTO_POR_PUNTOS is already in the catalog')),
    );
    store.openCreateDrawer();

    store.saveFormat(input);

    expect(store.formErrors()).toEqual({ code: 'Ese formato ya está en el catálogo.' });
  });

  it('shows an unexpected failure as a form error', () => {
    const store = create();
    updateFormat.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    store.openEditDrawer(descuento);

    store.saveFormat({ ...input, code: 'CODIGO_DESCUENTO' });

    expect(store.formErrors()).toEqual({
      form: 'No pudimos guardar el tipo de beneficio. Inténtalo de nuevo.',
    });
    expect(store.isDrawerOpen()).toBe(true);
  });

  it('clears the previous server errors when a new save starts', () => {
    const store = create();
    store.openCreateDrawer();
    createFormat.mockReturnValueOnce(
      throwError(() => conflict('A benefit type named Descuento already exists')),
    );
    store.saveFormat({ ...input, displayName: 'Descuento' });
    createFormat.mockReturnValueOnce(new Subject<BenefitFormat>());

    store.saveFormat(input);

    expect(store.formErrors()).toEqual({});
  });

  it('clears the server error of a field once it is edited', () => {
    const store = create();
    store.formErrors.set({ displayName: 'a', description: 'b' });

    store.clearFormError('displayName');

    expect(store.formErrors()).toEqual({ description: 'b' });
  });

  it('dismisses the confirmation', () => {
    const store = create();
    createFormat.mockReturnValue(of(porPuntos));
    store.openCreateDrawer();
    store.saveFormat(input);

    store.dismissActionMessage();

    expect(store.actionMessage()).toBeNull();
  });
});
