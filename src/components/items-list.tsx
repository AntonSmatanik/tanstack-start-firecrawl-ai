import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { useDeleteItem } from '#/hooks/use-delete-item'
import { copyToClipboardFn } from '#/lib/clipboard'
import type { getItemsFn } from '#/server/items'
import { Link, useRouter } from '@tanstack/react-router'
import { Copy, Inbox, Trash2 } from 'lucide-react'
import { use, useMemo } from 'react'

export const ItemsList = ({
  data,
  query,
  status,
}: {
  data: ReturnType<typeof getItemsFn>
  query: string
  status: string
}) => {
  const items = use(data)
  const router = useRouter()
  const { isDeleting, handleDelete } = useDeleteItem(() => router.invalidate())

  const filteredData = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery =
          query === '' ||
          item.title?.toLowerCase().includes(query.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          )

        const matchesStatus = status === 'all' || item.status === status

        return matchesQuery && matchesStatus
      }),
    [items, query, status],
  )

  if (filteredData.length === 0) {
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox className="size-12" />
          </EmptyMedia>
          <EmptyTitle>
            {items.length === 0 ? 'No saved items yet' : 'No items found'}
          </EmptyTitle>
          <EmptyDescription>
            {items.length === 0
              ? 'Import a URL to get started.'
              : 'No items match your current search filters.'}
          </EmptyDescription>
        </EmptyHeader>
        {items.length === 0 && (
          <EmptyContent>
            <Link className={buttonVariants()} to="/dashboard/import">
              Import URL
            </Link>
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredData.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all pt-0 hover:shadow-lg"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{
              itemId: item.id,
            }}
            className="block"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={item.ogImage ?? 'https://i.sstatic.net/DZeBT.png'}
                alt={item.title ?? 'Article thumbnail'}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={item.status === 'COMPLETED' ? 'default' : 'outline'}
                >
                  {item.status.toLocaleLowerCase()}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    onClick={async (e) => {
                      e.preventDefault()
                      await copyToClipboardFn(item.url)
                    }}
                    variant="outline"
                    size="icon"
                    className="size-8"
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(item.id)
                    }}
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    disabled={isDeleting}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-amber-300 transition-colors">
                {item.title}
              </CardTitle>

              {item.author && (
                <p className="text-xs text-muted-foreground">{item.author}</p>
              )}

              {item.summary && (
                <CardDescription className="line-clamp-3 text-sm">
                  {item.summary}
                </CardDescription>
              )}

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}
