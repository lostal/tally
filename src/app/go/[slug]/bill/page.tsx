import { notFound } from 'next/navigation';
import {
  getRestaurantBySlug,
  getActiveOrderForTable,
  transformToSelectableItems,
  calculateOrderTotal,
} from '@/lib/data';
import { getTableByNumber, getFirstTable } from '@/lib/data/restaurants';
import { BillPageClient } from './bill-client';
import { SubscriptionPlan } from '@/types/subscription';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

/**
 * Bill Page (Server Component)
 *
 * Shows the order items for the current table.
 * Fetches order data from Supabase and passes to client component.
 */
export default async function BillPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table: tableNumber } = await searchParams;

  // Fetch restaurant
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }

  // Fetch table
  const table = tableNumber
    ? await getTableByNumber(restaurant.id, tableNumber)
    : await getFirstTable(restaurant.id);

  if (!table) {
    notFound();
  }

  // Fetch active order for this table
  const order = await getActiveOrderForTable(table.id);

  // Transform to UI format
  const items = transformToSelectableItems(order);
  const totalCents = calculateOrderTotal(items);

  // Determine plan
  const settings = restaurant.settings as { subscription_tier?: SubscriptionPlan } | null;
  const plan = settings?.subscription_tier || 'essential';

  return (
    <BillPageClient
      slug={slug}
      restaurantName={restaurant.name}
      tableNumber={table.number}
      items={items}
      billTotalCents={totalCents}
      plan={plan}
    />
  );
}
