import { CheckoutLine, CheckoutSummary, ServerCart } from '../types/checkout.model';

const PRICE_TOLERANCE = 0.005;

function isInServerCart(line: CheckoutLine, cart: ServerCart): boolean {
  return cart.lines.some(
    (saved) => saved.productId === line.productId && saved.quantity === line.quantity,
  );
}

function hasSameLines(summary: CheckoutSummary, cart: ServerCart): boolean {
  return (
    summary.lines.length === cart.lines.length &&
    summary.lines.every((line) => isInServerCart(line, cart))
  );
}

function hasSameTotal(summary: CheckoutSummary, cart: ServerCart): boolean {
  return Math.abs(summary.total - cart.total) < PRICE_TOLERANCE;
}

export function matchesServerCart(summary: CheckoutSummary, cart: ServerCart): boolean {
  return hasSameLines(summary, cart) && hasSameTotal(summary, cart);
}
