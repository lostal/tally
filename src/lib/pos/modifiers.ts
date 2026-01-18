import type { Json } from '@/types/database';

/**
 * Modifier structure for order items
 */
export interface Modifier {
  id: string;
  name: string;
  priceCents: number;
}

/**
 * Parse modifiers from database JSON format
 *
 * @param modifiersJson - Modifiers stored in database (JSONB)
 * @returns Array of parsed modifiers
 *
 * @example
 * const modifiers = parseModifiers(orderItem.modifiers);
 * // Returns: [{ id: '...', name: 'Extra cheese', priceCents: 150 }]
 */
export function parseModifiers(modifiersJson: Json): Modifier[] {
  if (!Array.isArray(modifiersJson)) return [];

  const result: Modifier[] = [];
  for (const item of modifiersJson) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      'priceCents' in item
    ) {
      result.push(item as unknown as Modifier);
    }
  }
  return result;
}

/**
 * Format modifiers as a comma-separated string for display
 *
 * @param modifiers - Array of modifiers
 * @returns Formatted string (e.g., "Extra cheese, No onions")
 *
 * @example
 * formatModifiers([
 *   { id: '1', name: 'Extra cheese', priceCents: 150 },
 *   { id: '2', name: 'No onions', priceCents: 0 }
 * ]);
 * // Returns: "Extra cheese, No onions"
 */
export function formatModifiers(modifiers: Modifier[]): string {
  return modifiers.map((m) => m.name).join(', ');
}

/**
 * Calculate total price of all modifiers
 *
 * @param modifiers - Array of modifiers
 * @returns Total price in cents
 *
 * @example
 * calculateModifierTotal([
 *   { id: '1', name: 'Extra cheese', priceCents: 150 },
 *   { id: '2', name: 'Bacon', priceCents: 200 }
 * ]);
 * // Returns: 350
 */
export function calculateModifierTotal(modifiers: Modifier[]): number {
  return modifiers.reduce((sum, m) => sum + m.priceCents, 0);
}

/**
 * Format modifier price for display
 *
 * @param priceCents - Price in cents
 * @returns Formatted price string (e.g., "+€1.50" or "€0.00")
 *
 * @example
 * formatModifierPrice(150); // Returns: "+€1.50"
 * formatModifierPrice(0);   // Returns: "€0.00"
 */
export function formatModifierPrice(priceCents: number): string {
  const euros = (priceCents / 100).toFixed(2);
  return priceCents > 0 ? `+€${euros}` : `€${euros}`;
}

/**
 * Get modifier IDs for comparison
 *
 * Useful for checking if two items have the same modifiers.
 *
 * @param modifiers - Array of modifiers
 * @returns Sorted array of modifier IDs
 */
export function getModifierIds(modifiers: Modifier[]): string[] {
  return modifiers.map((m) => m.id).sort();
}

/**
 * Check if two modifier arrays are equal
 *
 * @param modifiers1 - First array of modifiers
 * @param modifiers2 - Second array of modifiers
 * @returns True if both arrays contain the same modifiers
 */
export function areModifiersEqual(modifiers1: Modifier[], modifiers2: Modifier[]): boolean {
  const ids1 = getModifierIds(modifiers1);
  const ids2 = getModifierIds(modifiers2);

  if (ids1.length !== ids2.length) return false;

  return ids1.every((id, index) => id === ids2[index]);
}
