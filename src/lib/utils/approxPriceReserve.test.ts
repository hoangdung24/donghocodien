import { describe, expect, it } from 'vitest';
import { formatApproxPrice } from '@/lib/utils/currency';
import { approxPriceReserve, approxPriceReserveText } from '@/lib/utils/approxPriceReserve';

const WIDEST_USD_AMOUNT = '999999';
const VIETNAM_RATE = 30500;
const EURO_RATE = 0.95;

describe('approxPriceReserve', () => {
  it('reserves the widest realistic figure for vietnamese visitors', () => {
    expect(approxPriceReserve('250000', 'VN')).toContain(
      formatApproxPrice(WIDEST_USD_AMOUNT, 'VND', { VND: VIETNAM_RATE })
    );
  });

  it('reserves the widest realistic figure for eurozone visitors', () => {
    expect(approxPriceReserve('250000', 'DE')).toContain(
      formatApproxPrice(WIDEST_USD_AMOUNT, 'EUR', { EUR: EURO_RATE })
    );
  });

  it('keeps the reserve text width independent of the displayed price', () => {
    expect(approxPriceReserveText('1999', 'VN')).toBe(approxPriceReserveText('250000', 'VN'));
  });

  it('keeps every market reserve at least as wide as its own formatted price', () => {
    for (const country of ['VN', 'DE']) {
      const reserve = approxPriceReserveText('1999', country) ?? '';
      const rendered = formatApproxPrice('1999', country === 'VN' ? 'VND' : 'EUR', {
        VND: VIETNAM_RATE,
        EUR: EURO_RATE,
      });
      expect(reserve.length).toBeGreaterThanOrEqual(rendered.length);
    }
  });

  it('never reserves a figure for visitors priced in us dollars', () => {
    expect(approxPriceReserve('1999', 'US')).toBeNull();
  });

  it('never reserves a figure while the visitor country is unknown', () => {
    expect(approxPriceReserve('1999', null)).toBeNull();
    expect(approxPriceReserveText('1999', null)).toBeNull();
  });
});
