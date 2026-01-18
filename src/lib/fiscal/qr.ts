/**
 * QR Code utilities for Veri*factu compliance
 *
 * Veri*factu requires invoices to include a QR code with specific format:
 * TALLY|TAX_ID|INVOICE_NUMBER|ISSUED_AT|TOTAL_CENTS|HASH_PREVIEW
 */

/**
 * Generate QR code image URL using an external QR code service
 *
 * @param qrData - The QR data string (from database)
 * @returns URL to QR code image
 *
 * @example
 * const qrUrl = generateQrImageUrl('TALLY|B12345678|2024-A-000123|...');
 * // Returns: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...
 */
export function generateQrImageUrl(qrData: string): string {
  const encoded = encodeURIComponent(qrData);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}

/**
 * Parse and validate a Veri*factu QR code
 *
 * @param qrCode - The QR code string
 * @returns Parsed QR data or null if invalid
 *
 * @example
 * const parsed = parseVerifactuQr('TALLY|B12345678|2024-A-000123|2024-01-15T10:00:00Z|5000|abc123');
 * // Returns:
 * // {
 * //   taxId: 'B12345678',
 * //   invoiceNumber: '2024-A-000123',
 * //   issuedAt: '2024-01-15T10:00:00Z',
 * //   totalCents: 5000,
 * //   hashPreview: 'abc123'
 * // }
 */
export function parseVerifactuQr(qrCode: string): {
  taxId: string;
  invoiceNumber: string;
  issuedAt: string;
  totalCents: number;
  hashPreview: string;
} | null {
  const parts = qrCode.split('|');

  // Verify format: TALLY|tax_id|invoice_number|issued_at|total_cents|hash_preview
  if (parts.length !== 6 || parts[0] !== 'TALLY') {
    return null;
  }

  const totalCents = parseInt(parts[4], 10);
  if (isNaN(totalCents)) {
    return null;
  }

  return {
    taxId: parts[1],
    invoiceNumber: parts[2],
    issuedAt: parts[3],
    totalCents,
    hashPreview: parts[5],
  };
}

/**
 * Format total amount in euros from cents
 *
 * @param cents - Amount in cents
 * @returns Formatted euro amount (e.g., "€50.00")
 */
export function formatEuros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Generate human-readable QR description for display
 *
 * @param qrCode - The QR code string
 * @returns Human-readable description
 *
 * @example
 * const desc = describeQrCode('TALLY|B12345678|2024-A-000123|2024-01-15T10:00:00Z|5000|abc123');
 * // Returns: "Invoice 2024-A-000123 for €50.00 (Tax ID: B12345678)"
 */
export function describeQrCode(qrCode: string): string {
  const parsed = parseVerifactuQr(qrCode);
  if (!parsed) {
    return 'Invalid QR code';
  }

  const amount = formatEuros(parsed.totalCents);
  return `Invoice ${parsed.invoiceNumber} for ${amount} (Tax ID: ${parsed.taxId})`;
}

/**
 * Verify QR code hash preview matches expected hash
 *
 * This is useful for quick validation before full verification.
 *
 * @param qrCode - The QR code string
 * @param expectedHash - The full invoice hash
 * @returns True if hash preview matches
 */
export function verifyQrHash(qrCode: string, expectedHash: string): boolean {
  const parsed = parseVerifactuQr(qrCode);
  if (!parsed) {
    return false;
  }

  // Hash preview is first 8 chars of the full hash
  return expectedHash.startsWith(parsed.hashPreview);
}
