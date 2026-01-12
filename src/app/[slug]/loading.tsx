import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="bg-background min-h-dvh">
      <div className="container-app flex min-h-dvh flex-col justify-center py-8">
        <div className="space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-1 text-center">
            <span className="text-muted-foreground text-sm font-medium">powered by</span>
            <h2 className="text-xl font-bold tracking-tight">tally.</h2>
          </div>

          {/* Trust Card Skeleton */}
          <Card className="overflow-hidden rounded-2xl border-2 shadow-sm">
            <CardHeader className="space-y-4 pt-8 pb-4">
              <div className="flex flex-col items-center text-center">
                {/* Logo Skeleton */}
                <Skeleton className="size-20 rounded-full" />
                {/* Name Skeleton */}
                <Skeleton className="mt-4 h-8 w-48" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              {/* Location/Table info Skeleton */}
              <div className="bg-secondary/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>

              {/* Button Skeleton */}
              <Skeleton className="h-14 w-full rounded-2xl" />

              {/* Footer text Skeleton */}
              <div className="space-y-2 pt-2">
                <Skeleton className="mx-auto h-3 w-48" />
                <Skeleton className="mx-auto h-3 w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Page Footer Skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>
    </main>
  );
}
