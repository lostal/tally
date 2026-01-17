import { describe, it, expect } from 'vitest';
import {
  calculateTax,
  calculateBaseFromTotal,
  generateTaxBreakdown,
  calculateOrderTotals,
  formatCurrency,
  formatTaxRate,
  validateSpanishTaxId,
} from '@/lib/fiscal/calculations';

/**
 * CRITICAL TESTS: Fiscal Calculations (Legal Compliance)
 *
 * These tests ensure compliance with Spanish fiscal regulations (Verifactu).
 * ANY failure here means potential legal/tax violations in production.
 *
 * Priority: HIGHEST
 * Category: Legal Compliance + Financial Logic
 * Jurisdiction: Spain (IVA rates: 4%, 10%, 21%)
 */

describe('Fiscal Calculations - CRITICAL', () => {
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

  // ============================================================================
  // CRITICAL EDGE CASES: Rounding & Precision
  // ============================================================================

  describe('Tax Calculation - Rounding Edge Cases', () => {
    it('should handle rounding edge case: 333 cents * 10% = 33 cents (rounds down)', () => {
      // 333 * 0.10 = 33.3 → rounds to 33
      expect(calculateTax(333, 10)).toBe(33);
    });

    it('should handle rounding edge case: 335 cents * 10% = 34 cents (rounds up)', () => {
      // 335 * 0.10 = 33.5 → rounds to 34
      expect(calculateTax(335, 10)).toBe(34);
    });

    it('should handle very small amounts (1 cent with 21% IVA)', () => {
      // 1 * 0.21 = 0.21 → rounds to 0
      expect(calculateTax(1, 21)).toBe(0);
    });

    it('should handle very small amounts (5 cents with 21% IVA)', () => {
      // 5 * 0.21 = 1.05 → rounds to 1
      expect(calculateTax(5, 21)).toBe(1);
    });

    it('should handle large amounts without overflow (€1,000,000)', () => {
      const largAmount = 100000000; // €1,000,000
      const tax = calculateTax(largAmount, 21);
      expect(tax).toBe(21000000); // €210,000
    });

    it('should maintain precision: base + tax = total (within 1 cent)', () => {
      const baseCents = 1234;
      const taxRate = 21;
      const taxCents = calculateTax(baseCents, taxRate);
      const totalCents = baseCents + taxCents;

      // Verify reverse calculation
      const calculatedBase = calculateBaseFromTotal(totalCents, taxRate);
      const difference = Math.abs(calculatedBase - baseCents);

      // Allow 1 cent difference due to rounding
      expect(difference).toBeLessThanOrEqual(1);
    });
  });

  // ============================================================================
  // CRITICAL: Spanish IVA Rates (Legal Requirements)
  // ============================================================================

  describe('Spanish IVA Rates - Legal Compliance', () => {
    it('should calculate 21% IVA (General rate) - Most products/services', () => {
      expect(calculateTax(10000, 21)).toBe(2100); // €100 → €21 tax
    });

    it('should calculate 10% IVA (Reduced rate) - Food, hospitality', () => {
      expect(calculateTax(10000, 10)).toBe(1000); // €100 → €10 tax
    });

    it('should calculate 4% IVA (Super-reduced rate) - Basic foods', () => {
      expect(calculateTax(10000, 4)).toBe(400); // €100 → €4 tax
    });

    it('should calculate 0% IVA (Exempt) - Education, health', () => {
      expect(calculateTax(10000, 0)).toBe(0); // €100 → €0 tax
    });
  });

  // ============================================================================
  // CRITICAL: Real-World Restaurant Scenarios
  // ============================================================================

  describe('Real-World Restaurant Scenarios', () => {
    it('should calculate correct totals for typical restaurant bill', () => {
      const items = [
        { unitPriceCents: 1200, quantity: 2, taxRate: 10 }, // 2 mains @ €12 (10% IVA)
        { unitPriceCents: 300, quantity: 3, taxRate: 10 }, // 3 drinks @ €3 (10% IVA)
        { unitPriceCents: 500, quantity: 1, taxRate: 10 }, // 1 dessert @ €5 (10% IVA)
      ];

      const totals = calculateOrderTotals(items);

      // Subtotal: (12*2) + (3*3) + (5*1) = 38€ = 3800 cents
      expect(totals.subtotalCents).toBe(3800);

      // Tax: 3800 * 0.10 = 380 cents
      expect(totals.taxCents).toBe(380);

      // Total: 3800 + 380 = 4180 cents (€41.80)
      expect(totals.totalCents).toBe(4180);
    });

    it('should handle mixed IVA rates in same bill', () => {
      const items = [
        { unitPriceCents: 1000, quantity: 1, taxRate: 10 }, // Restaurant service (10%)
        { unitPriceCents: 2000, quantity: 1, taxRate: 21 }, // Packaged goods (21%)
        { unitPriceCents: 500, quantity: 1, taxRate: 4 }, // Basic food (4%)
      ];

      const totals = calculateOrderTotals(items);

      // Subtotal: 1000 + 2000 + 500 = 3500
      expect(totals.subtotalCents).toBe(3500);

      // Tax breakdown:
      // 10%: 1000 * 0.10 = 100
      // 21%: 2000 * 0.21 = 420
      // 4%:  500 * 0.04 = 20
      // Total tax: 100 + 420 + 20 = 540
      expect(totals.taxCents).toBe(540);

      expect(totals.totalCents).toBe(4040);
      expect(totals.breakdown).toHaveLength(3);
    });

    it('should generate correct breakdown sorted by rate (descending)', () => {
      const items = [
        { unitPriceCents: 1000, quantity: 1, taxRate: 4 },
        { unitPriceCents: 2000, quantity: 1, taxRate: 21 },
        { unitPriceCents: 1500, quantity: 1, taxRate: 10 },
      ];

      const breakdown = generateTaxBreakdown(items);

      // Should be sorted: 21%, 10%, 4%
      expect(breakdown[0].rate).toBe(21);
      expect(breakdown[1].rate).toBe(10);
      expect(breakdown[2].rate).toBe(4);
    });
  });

  // ============================================================================
  // CRITICAL: Mathematical Invariants (Money Safety)
  // ============================================================================

  describe('Mathematical Invariants - Money Safety', () => {
    it('should ALWAYS satisfy: subtotal + tax = total', () => {
      const testCases = [
        [
          { unitPriceCents: 1234, quantity: 1, taxRate: 10 },
          { unitPriceCents: 5678, quantity: 2, taxRate: 21 },
        ],
        [
          { unitPriceCents: 333, quantity: 3, taxRate: 10 },
          { unitPriceCents: 999, quantity: 1, taxRate: 21 },
        ],
        [{ unitPriceCents: 1, quantity: 1, taxRate: 21 }],
      ];

      testCases.forEach((items) => {
        const totals = calculateOrderTotals(items);
        const calculated = totals.subtotalCents + totals.taxCents;
        expect(calculated).toBe(totals.totalCents);
      });
    });

    it('should ALWAYS satisfy: sum(breakdown.baseCents) = subtotal', () => {
      const items = [
        { unitPriceCents: 1000, quantity: 2, taxRate: 10 },
        { unitPriceCents: 500, quantity: 1, taxRate: 10 },
        { unitPriceCents: 300, quantity: 3, taxRate: 21 },
      ];

      const totals = calculateOrderTotals(items);
      const breakdownSubtotal = totals.breakdown.reduce((sum, item) => sum + item.baseCents, 0);

      expect(breakdownSubtotal).toBe(totals.subtotalCents);
    });

    it('should ALWAYS satisfy: sum(breakdown.taxCents) = taxCents', () => {
      const items = [
        { unitPriceCents: 1000, quantity: 2, taxRate: 10 },
        { unitPriceCents: 500, quantity: 1, taxRate: 10 },
        { unitPriceCents: 300, quantity: 3, taxRate: 21 },
      ];

      const totals = calculateOrderTotals(items);
      const breakdownTax = totals.breakdown.reduce((sum, item) => sum + item.taxCents, 0);

      expect(breakdownTax).toBe(totals.taxCents);
    });

    it('should maintain cent precision (no floating point errors)', () => {
      // Classic floating point issue: 0.1 + 0.2 = 0.30000000000000004
      // Our cent-based system should avoid this
      const items = [
        { unitPriceCents: 10, quantity: 1, taxRate: 10 }, // 10 cents
        { unitPriceCents: 20, quantity: 1, taxRate: 10 }, // 20 cents
      ];

      const totals = calculateOrderTotals(items);

      // Should be exactly 30, not 30.000000000000004
      expect(totals.subtotalCents).toBe(30);
      expect(Number.isInteger(totals.subtotalCents)).toBe(true);
      expect(Number.isInteger(totals.taxCents)).toBe(true);
      expect(Number.isInteger(totals.totalCents)).toBe(true);
    });
  });

  // ============================================================================
  // CRITICAL: Tax ID Validation (Legal Compliance)
  // ============================================================================

  describe('Spanish Tax ID Validation - Extended Cases', () => {
    it('should validate all CIF organization types', () => {
      const cifPrefixes = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'J',
        'K',
        'L',
        'M',
        'N',
        'P',
        'Q',
        'R',
        'S',
        'U',
        'V',
        'W',
      ];

      cifPrefixes.forEach((prefix) => {
        const cif = `${prefix}1234567J`;
        expect(validateSpanishTaxId(cif)).toBe(true);
      });
    });

    it('should validate all NIE prefixes (X, Y, Z)', () => {
      expect(validateSpanishTaxId('X1234567A')).toBe(true);
      expect(validateSpanishTaxId('Y1234567B')).toBe(true);
      expect(validateSpanishTaxId('Z1234567C')).toBe(true);
    });

    it('should reject invalid NIF (wrong length)', () => {
      expect(validateSpanishTaxId('1234567A')).toBe(false); // 7 digits
      expect(validateSpanishTaxId('123456789A')).toBe(false); // 9 digits
    });

    it('should reject invalid CIF (wrong control character)', () => {
      // CIF requires control character 0-9 or A-J, not K-Z
      expect(validateSpanishTaxId('A1234567Z')).toBe(false);
    });

    it('should reject invalid characters', () => {
      expect(validateSpanishTaxId('12345678@')).toBe(false);
      expect(validateSpanishTaxId('A1234567#')).toBe(false);
    });

    it('should handle hyphens and dots (common formatting)', () => {
      expect(validateSpanishTaxId('12.345.678-A')).toBe(true);
      expect(validateSpanishTaxId('A-12.345.678')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(validateSpanishTaxId('a1234567j')).toBe(true);
      expect(validateSpanishTaxId('x1234567a')).toBe(true);
    });
  });

  // ============================================================================
  // CRITICAL: Reverse Calculation (Base from Total)
  // ============================================================================

  describe('Reverse Tax Calculation - Edge Cases', () => {
    it('should correctly reverse calculate with 21% IVA', () => {
      const totalCents = 1210; // €12.10
      const baseCents = calculateBaseFromTotal(totalCents, 21);

      // €12.10 / 1.21 = €10.00 = 1000 cents
      expect(baseCents).toBe(1000);
    });

    it('should handle rounding in reverse calculation', () => {
      const totalCents = 1111; // Arbitrary amount
      const baseCents = calculateBaseFromTotal(totalCents, 21);

      // Verify forward calculation matches (within rounding)
      const recalculatedTax = calculateTax(baseCents, 21);
      const recalculatedTotal = baseCents + recalculatedTax;

      // Should be within 1 cent due to rounding
      expect(Math.abs(recalculatedTotal - totalCents)).toBeLessThanOrEqual(1);
    });

    it('should handle 0% rate (no tax)', () => {
      const totalCents = 1000;
      const baseCents = calculateBaseFromTotal(totalCents, 0);

      // With 0% tax, base = total
      expect(baseCents).toBe(totalCents);
    });
  });

  // ============================================================================
  // CRITICAL: Empty/Zero Cases
  // ============================================================================

  describe('Edge Cases - Empty/Zero Values', () => {
    it('should handle empty order', () => {
      const totals = calculateOrderTotals([]);

      expect(totals.subtotalCents).toBe(0);
      expect(totals.taxCents).toBe(0);
      expect(totals.totalCents).toBe(0);
      expect(totals.breakdown).toEqual([]);
    });

    it('should handle zero quantity items', () => {
      const items = [{ unitPriceCents: 1000, quantity: 0, taxRate: 10 }];

      const totals = calculateOrderTotals(items);

      expect(totals.subtotalCents).toBe(0);
      expect(totals.taxCents).toBe(0);
    });

    it('should handle zero price items', () => {
      const items = [{ unitPriceCents: 0, quantity: 5, taxRate: 10 }];

      const totals = calculateOrderTotals(items);

      expect(totals.subtotalCents).toBe(0);
      expect(totals.taxCents).toBe(0);
    });
  });
});
