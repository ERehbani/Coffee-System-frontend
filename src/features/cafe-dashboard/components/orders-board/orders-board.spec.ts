import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Purchase } from '../../../purchase-history/model/purchase.model';
import { PurchaseService } from '../../../purchase-history/services/purchase.service';
import { PENDING_REVIEW_PURCHASE_FIXTURE } from '../../../purchase-history/utils/purchase.fixture';
import { OrdersBoard } from './orders-board';

function order(id: string, clientName: string, status: string): Purchase {
  return { ...PENDING_REVIEW_PURCHASE_FIXTURE, externalId: id, clientName, status };
}

describe('OrdersBoard', () => {
  let fixture: ComponentFixture<OrdersBoard>;
  let updateStatus: ReturnType<typeof vi.fn>;
  let orders: Purchase[];

  async function render(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [OrdersBoard],
      providers: [{ provide: PurchaseService, useValue: { getOpenOrders: () => of(orders), updateStatus } }],
    }).compileComponents();
    fixture = TestBed.createComponent(OrdersBoard);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function column(title: string): HTMLElement {
    return fixture.nativeElement.querySelector(`section[aria-label="${title}"]`);
  }

  function button(scope: HTMLElement, label: string): HTMLButtonElement {
    const found = Array.from(scope.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
    if (!found) {
      throw new Error(`No button "${label}"`);
    }
    return found as HTMLButtonElement;
  }

  beforeEach(() => {
    orders = [
      order('new-1', 'Lucía Gómez', 'CONFIRMED'),
      order('prep-1', 'Sofía Fernández', 'IN_PREPARATION'),
      order('ready-1', 'Tomás Rodríguez', 'READY'),
    ];
    updateStatus = vi.fn((id: string, status: string) => of({ ...orders.find((o) => o.externalId === id)!, status }));
  });

  it('shows each open order in the column of its state', async () => {
    await render();

    expect(column('Nuevos').textContent).toContain('Lucía Gómez');
    expect(column('En preparación').textContent).toContain('Sofía Fernández');
    expect(column('Listos para retirar').textContent).toContain('Tomás Rodríguez');
    expect(fixture.nativeElement.textContent).toContain('3 pedidos para atender');
  });

  it('accepting a new order moves it to preparation', async () => {
    await render();

    button(column('Nuevos'), 'Aceptar').click();
    fixture.detectChanges();

    expect(updateStatus).toHaveBeenCalledWith('new-1', 'IN_PREPARATION');
    expect(column('Nuevos').textContent).not.toContain('Lucía Gómez');
    expect(column('En preparación').textContent).toContain('Lucía Gómez');
  });

  it('handing over a ready order takes it off the board', async () => {
    await render();

    button(column('Listos para retirar'), 'Entregado').click();
    fixture.detectChanges();

    expect(updateStatus).toHaveBeenCalledWith('ready-1', 'DELIVERED');
    expect(fixture.nativeElement.textContent).not.toContain('Tomás Rodríguez');
  });

  it('asks before cancelling an order', async () => {
    await render();

    button(column('Nuevos'), 'Cancelar').click();
    fixture.detectChanges();
    expect(updateStatus).not.toHaveBeenCalled();

    button(column('Nuevos'), 'Sí, cancelar').click();
    fixture.detectChanges();

    expect(updateStatus).toHaveBeenCalledWith('new-1', 'CANCELLED');
    expect(fixture.nativeElement.textContent).not.toContain('Lucía Gómez');
  });
});
