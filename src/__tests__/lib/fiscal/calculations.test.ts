import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateTax,
  calculateBaseFromTotal,
  generateTaxBreakdown,
  calculateOrderTotals,
  formatCurrency,
  formatTaxRate,
  validateSpanishTaxId,
} from '@/lib/fiscal/calculations';

describe('Fiscal Calculations', () => {
  describe('calculateTax', () => {
    it('should calculate 10% IVA correctly', () => {
      expect(calculateTax(1000, 10)).toBe(100);
      expect(calculateTax(1550, 10)).toBe(155);
    });

    it('should calculate 21% IVA correctly', () => {
      expect(calculateTax(1000, 21)).toBe(210);
    });

    it('should handle 0% (exempt)', () => {
      expect(calculateTax(1000, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateTax(333, 10)).toBe(33);
    });
  });

  describe('calculateBaseFromTotal', () => {
    it('should extract base from total with 10% IVA', () => {
      // Total 1100 = Base 1000 + IVA 100
      expect(calculateBaseFromTotal(1100, 10)).toBe(1000);
    });

    it('should extract base from total with 21% IVA', () => {
      // Total 1210 = Base 1000 + IVA 210
      expect(calculateBaseFromTotal(1210, 21)).toBe(1000);
    });
  });

  describe('generateTaxBreakdown', () => {
    it('should group items by tax rate', () => {
      const items = [
        { unitPriceCents: 1000, quantity: 2, taxRate: 10 },
        { unitPriceCents: 500, quantity: 1, taxRate: 10 },
        { unitPriceCents: 100, quantity: 3, taxRate: 21 },
      ];

      const breakdown = generateTaxBreakdown(items);

      expect(breakdown).toHaveLength(2);

      const rate21 = breakdown.find((b) => b.rate === 21);
      const rate10 = breakdown.find((b) => b.rate === 10);

      expect(rate21).toBeDefined();
      expect(rate21?.baseCents).toBe(300); // 100 * 3
      expect(rate21?.taxCents).toBe(63); // 300 * 0.21

      expect(rate10).toBeDefined();
      expect(rate10?.baseCents).toBe(2500); // 1000*2 + 500*1
      expect(rate10?.taxCents).toBe(250); // 2500 * 0.10
    });

    it('should return empty array for no items', () => {
      expect(generateTaxBreakdown([])).toEqual([]);
    });
  });

  describe('calculateOrderTotals', () => {
    it('should calculate complete order totals', () => {
      const items = [
        { unitPriceCents: 1000, quantity: 1, taxRate: 10 },
        { unitPriceCents: 500, quantity: 2, taxRate: 10 },
      ];

      const totals = calculateOrderTotals(items);

      expect(totals.subtotalCents).toBe(2000);
      expect(totals.taxCents).toBe(200);
      expect(totals.totalCents).toBe(2200);
      expect(totals.breakdown).toHaveLength(1);
    });
  });

  describe('formatCurrency', () => {
    it('should format euros correctly', () => {
      const result = formatCurrency(1550, 'EUR');
      // Spanish locale formats with comma as decimal
      expect(result).toContain('15');
      expect(result).toContain('50');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'EUR');
      expect(result).toContain('0');
    });
  });

  describe('formatTaxRate', () => {
    it('should format integer rates without decimals', () => {
      expect(formatTaxRate(10)).toBe('10%');
      expect(formatTaxRate(21)).toBe('21%');
    });

    it('should format decimal rates with decimals', () => {
      expect(formatTaxRate(10.5)).toBe('10.50%');
    });
  });

  describe('validateSpanishTaxId', () => {
    it('should validate NIF format', () => {
      expect(validateSpanishTaxId('12345678A')).toBe(true);
      expect(validateSpanishTaxId('12345678Z')).toBe(true);
    });

    it('should validate CIF format', () => {
      expect(validateSpanishTaxId('A12345678')).toBe(true);
      expect(validateSpanishTaxId('B1234567J')).toBe(true);
    });

    it('should validate NIE format', () => {
      expect(validateSpanishTaxId('X1234567A')).toBe(true);
      expect(validateSpanishTaxId('Y1234567B')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateSpanishTaxId('')).toBe(false);
      expect(validateSpanishTaxId('123')).toBe(false);
      expect(validateSpanishTaxId('ABCDEFGH')).toBe(false);
    });

    it('should handle whitespace and case', () => {
      expect(validateSpanishTaxId('12345678a')).toBe(true);
      // Function cleans input with regex, but doesn't trim leading/trailing
      // Since clean uses replace(/[^A-Z0-9]/g, ''), spaces are removed
      expect(validateSpanishTaxId(' 12345678A ')).toBe(true);
    });
  });
});
