import { Card, CardHeader } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'

export function ItemsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="overflow-hidden pt-0">
          <Skeleton className="aspect-video w-full rounded-none" />
          <CardHeader className="space-y-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
