import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Purchase } from '../../model/purchase.model';
import { PurchaseService } from '../../services/purchase.service';
import { canBeRefunded } from '../../utils/purchase-status';

type RefundPhase = 'idle' | 'confirming' | 'refunding';

export const REFUND_ERROR_MESSAGE = 'No se pudo reembolsar el pedido. Probá de nuevo.';

const REFUND_ERRORS: ReadonlyMap<number, string> = new Map([
  [HttpStatusCode.Forbidden, 'No podés reembolsar pedidos de otra cafetería.'],
  [HttpStatusCode.NotFound, 'El pedido ya no existe. Recargá la página.'],
  [
    HttpStatusCode.Conflict,
    'El pedido ya cambió de estado y no se puede reembolsar. Cerrá el detalle y recargá la página.',
  ],
]);

function toRefundErrorMessage(error: unknown): string {
  const status = error instanceof HttpErrorResponse ? error.status : null;
  return (status !== null && REFUND_ERRORS.get(status)) || REFUND_ERROR_MESSAGE;
}

@Component({
  selector: 'app-refund-purchase',
  templateUrl: './refund-purchase.html',
  host: { class: 'block' },
})
export class RefundPurchase {
  private readonly purchaseService = inject(PurchaseService);

  readonly purchase = input.required<Purchase>();
  readonly refunded = output<Purchase>();

  readonly phase = signal<RefundPhase>('idle');
  readonly errorMessage = signal<string | null>(null);

  readonly isRefundable = computed(() => canBeRefunded(this.purchase().status));
  readonly pointsToRevoke = computed(() =>
    this.purchase().details.reduce((total, detail) => total + detail.generatedPoints, 0),
  );
  readonly usedCoupon = computed(() => Boolean(this.purchase().redemptionId));

  askConfirmation(): void {
    this.errorMessage.set(null);
    this.phase.set('confirming');
  }

  cancel(): void {
    this.phase.set('idle');
  }

  confirm(): void {
    this.phase.set('refunding');
    this.purchaseService.updateStatus(this.purchase().externalId, 'REFUNDED').subscribe({
      next: (updated) => {
        this.phase.set('idle');
        this.refunded.emit(updated);
      },
      error: (error: unknown) => {
        this.phase.set('confirming');
        this.errorMessage.set(toRefundErrorMessage(error));
      },
    });
  }
}
