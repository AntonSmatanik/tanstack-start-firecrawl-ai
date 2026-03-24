import { ItemsGridSkeleton } from '#/components/items-grid-skeleton'
import { ItemsList } from '#/components/items-list'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { getItemsFn } from '#/data/items'
import { ItemStatus } from '#/generated/prisma/enums'
import { ItemsSearchSchema } from '#/schemas/items'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { Suspense, useEffect, useState } from 'react'

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => ({ itemsPromise: getItemsFn() }),
  validateSearch: zodValidator(ItemsSearchSchema),
  head: () => ({
    meta: [
      {
        title: 'Your Saved Items',
      },
      {
        property: 'og:title',
        content: 'Your Saved Items',
      },
    ],
  }),
})

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData()
  const { query, status } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(query)
  const navigate = useNavigate({
    from: Route.fullPath,
  })

  useEffect(() => {
    if (searchInput !== query) {
      const timeoutId = setTimeout(() => {
        navigate({
          search: (prev) => ({
            ...prev,
            query: searchInput,
          }),
        })
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [searchInput, navigate, query])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">
          Your saved items are listed below.
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by title or tags"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                status: value as typeof status,
              }),
            })
          }
        >
          <SelectTrigger className="w-[160]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.values(ItemStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLocaleLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<ItemsGridSkeleton />}>
        <ItemsList data={itemsPromise} query={query} status={status} />
      </Suspense>
    </div>
  )
}
