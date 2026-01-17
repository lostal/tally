import { notFound } from 'next/navigation';
import { getRestaurantWithTable } from '@/lib/data';
import { TrustPageClient } from './trust-client';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

/**
 * Restaurant Trust Screen (Server Component)
 *
 * First page users see after scanning QR code.
 * Fetches restaurant data from Supabase and passes to client component.
 */
export default async function RestaurantPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table: tableNumber } = await searchParams;

  // Fetch restaurant and table from Supabase
  const data = await getRestaurantWithTable(slug, tableNumber);

  if (!data || !data.restaurant) {
    notFound();
  }

  const { restaurant, table } = data;

  return (
    <TrustPageClient
      slug={slug}
      restaurantName={restaurant.name}
      logoUrl={restaurant.logo_url}
      tableNumber={table?.number || '1'}
      isVerified={restaurant.is_active ?? true}
    />
  );
}
