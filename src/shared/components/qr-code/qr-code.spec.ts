import { TestBed } from '@angular/core/testing';
import { create } from 'qrcode/lib/core/qrcode';
import { QrCode, toQrSymbol } from './qr-code';

describe('toQrSymbol', () => {
  it('draws exactly the dark modules of the QR matrix, inside a 4-module quiet zone', () => {
    const value = 'VLD-8492-C0FF';
    const { modules } = create(value, { errorCorrectionLevel: 'M' });
    const symbol = toQrSymbol(value);

    expect(symbol.dimension).toBe(modules.size + 8);

    const drawn = new Set<string>();
    for (const [, x, y, run] of symbol.path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      for (let i = 0; i < Number(run); i++) {
        drawn.add(`${Number(y) - 4},${Number(x) - 4 + i}`);
      }
    }

    let dark = 0;
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        const isDark = Boolean(modules.get(row, col));
        expect(drawn.has(`${row},${col}`)).toBe(isDark);
        if (isDark) dark++;
      }
    }
    expect(drawn.size).toBe(dark);
  });

  it('produces different symbols for different values', () => {
    expect(toQrSymbol('AAA-1111').path).not.toBe(toQrSymbol('BBB-2222').path);
  });
});

describe('QrCode', () => {
  it('renders an accessible SVG with a white background', () => {
    const fixture = TestBed.createComponent(QrCode);
    fixture.componentRef.setInput('value', 'VLD-8492-C0FF');
    fixture.componentRef.setInput('label', 'Código QR de VLD-8492-C0FF');
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Código QR de VLD-8492-C0FF');
    expect(svg.querySelector('rect')?.getAttribute('fill')).toBe('#fff');
    expect(svg.querySelector('path')?.getAttribute('d')).toBe(toQrSymbol('VLD-8492-C0FF').path);
  });
});
