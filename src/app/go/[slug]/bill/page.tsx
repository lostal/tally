```typescript
import { notFound } from 'next/navigation';
import {
  getActiveOrderForTable,
  transformToSelectableItems,
  calculateOrderTotal,
} from '@/lib/data';
import { getRestaurantWithTable } from '@/lib/data/restaurants';
import { BillPageClient } from './bill-client-premium';
import { SubscriptionPlan } from '@/types/subscription';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

/**
 * Restaurant Bill Page (Server Component)
 *
 * Displays the bill for a specific table.
 * Fetches order data from Supabase and passes to client component.
 */
export default async function BillPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table: tableNumber } = await searchParams;

  // Fetch restaurant and table from Supabase
  const data = await getRestaurantWithTable(slug, tableNumber);

  if (!data) {
    notFound();
  }

  const { restaurant, table } = data;

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
