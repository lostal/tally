import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, serverError, logApiError } from '@/lib/api/validation';
import { calculateOrderTotals } from '@/lib/fiscal';

/**
 * Schema for invoice creation
 */
const CreateInvoiceSchema = z.object({
  orderId: z.string().uuid(),
  restaurantId: z.string().uuid(),
});

/**
 * POST /api/invoices
 *
 * Generate a fiscal invoice from an order
 */
export async function POST(request: Request) {
  try {
    const { data, error: validationError } = await validateBody(request, CreateInvoiceSchema);
    if (validationError) {
      return validationError;
    }

    const { orderId, restaurantId } = data;
    const supabase = createAdminClient();

    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id,
        status,
        subtotal_cents,
        items:order_items(
          id,
          quantity,
          unit_price_cents,
          product:products(name, tax_rate)
        )
      `
      )
      .eq('id', orderId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get restaurant fiscal info
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('fiscal_name, tax_id, fiscal_address, fiscal_city, fiscal_postal_code')
      .eq('id', restaurantId)
      .single();

    // Transform items for calculation
    const items = (
      (order.items as Array<{
        id: string;
        quantity: number;
        unit_price_cents: number;
        product: { name: string; tax_rate: number } | { name: string; tax_rate: number }[] | null;
      }>) || []
    ).map((item) => {
      const productData = item.product;
      const product = Array.isArray(productData) ? productData[0] : productData;

      return {
        productName: product?.name || 'Item',
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
        taxRate: product?.tax_rate || 10,
      };
    });

    // Calculate totals
    const totals = calculateOrderTotals(
      items.map((i) => ({
        unitPriceCents: i.unitPriceCents,
        quantity: i.quantity,
        taxRate: i.taxRate,
      }))
    );

    // Generate invoice number using database function
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
      p_restaurant_id: restaurantId,
      p_series: 'A',
    });

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        restaurant_id: restaurantId,
        order_id: orderId,
        invoice_number: invoiceNumber || `${new Date().getFullYear()}-A-000001`,
        series: 'A',
        subtotal_cents: totals.subtotalCents,
        tax_cents: totals.taxCents,
        total_cents: totals.totalCents,
        tax_breakdown: totals.breakdown,
        status: 'issued',
      })
      .select('id')
      .single();

    if (invoiceError) {
      logApiError('POST /api/invoices', invoiceError);
      return serverError('Failed to create invoice');
    }

    // Create invoice items
    const invoiceItems = items.map((item) => {
      const subtotal = item.unitPriceCents * item.quantity;
      const tax = Math.round((subtotal * item.taxRate) / 100);

      return {
        invoice_id: invoice.id,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        tax_rate: item.taxRate,
        subtotal_cents: subtotal,
        tax_cents: tax,
        total_cents: subtotal + tax,
      };
    });

    await supabase.from('invoice_items').insert(invoiceItems);

    return NextResponse.json(
      {
        invoice: {
          id: invoice.id,
          invoiceNumber,
          ...totals,
          restaurant: restaurant || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logApiError('POST /api/invoices', error);
    return serverError();
  }
}
