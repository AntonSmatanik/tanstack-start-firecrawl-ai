import { MessageResponse } from '#/components/ai-elements/message'
import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { ConfirmModal } from '#/components/ui/confirm-modal'
import { useDeleteItem } from '#/hooks/use-delete-item'
import { cn } from '#/lib/utils'
import { getItemByIdFn, saveSummaryAndGenerateTagsFn } from '#/server/items'
import { useCompletion } from '@ai-sdk/react'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemByIdFn({ data: { id: params.itemId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title ?? 'Item Details',
      },
      {
        property: 'og:image',
        content: loaderData?.ogImage ?? 'Saved Item',
      },
      {
        name: 'twitter:title',
        content: loaderData?.title ?? 'Item Details',
      },
    ],
  }),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const [contentOpen, setContentOpen] = useState(true)
  const router = useRouter()
  const navigate = useNavigate()
  const { isDeleting, handleDelete: deleteItem } = useDeleteItem(() =>
    navigate({ to: '/dashboard/items' }),
  )

  const [modalOpen, setModalOpen] = useState(false)

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/summary',
    initialCompletion: data.summary ?? undefined,
    streamProtocol: 'text',
    body: {
      itemId: data.id,
    },
    onFinish: async (_prompt, summary) => {
      await saveSummaryAndGenerateTagsFn({
        data: {
          id: data.id,
          summary,
        },
      })

      toast.success('Summary generated and tags updated')
      router.invalidate()
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  const handleGenerateSummary = () => {
    if (!data.content) {
      toast.error('No content to summarize')
      return
    }

    complete(data.content)
  }

  return (
    <div className="mx-auto space-y-6 w-full">
      <div className="flex justify-between">
        <Link
          to="/dashboard/items"
          className={buttonVariants({
            variant: 'outline',
          })}
        >
          <ArrowLeft />
          Go Back
        </Link>
        <>
          <Button
            variant="outline"
            onClick={() => setModalOpen(true)}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="size-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>

          <ConfirmModal
            open={modalOpen}
            title="Delete Item"
            description="Are you sure you want to delete this item? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onCancel={() => setModalOpen(false)}
            onConfirm={() => {
              deleteItem(data.id)
              setModalOpen(false)
            }}
          />
        </>
      </div>

      {data.ogImage && (
        <div className="aspect-video w-full overflow-hidden relative rounded-lg bg-muted">
          <img
            src={data.ogImage}
            alt={data.title ?? 'Item Image'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {data.title ?? 'Untitled'}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {data.author && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" />
              {data.author}
            </span>
          )}
          {data.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {data.publishedAt.toLocaleDateString('sk-SK')}
            </span>
          )}

          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {data.createdAt.toLocaleDateString('sk-SK')}
          </span>
        </div>

        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
        >
          View Original
          <ExternalLink className="size-3.5" />
        </a>

        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-orange-500/15 text-orange-600 dark:text-orange-400"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                  Summary
                </h2>

                {completion || data.summary ? (
                  <MessageResponse>{completion}</MessageResponse>
                ) : (
                  <p className="italic text-muted-foreground">
                    {data.content
                      ? 'No summary yet. Generate one with AI'
                      : 'No content to summarize'}
                  </p>
                )}
              </div>

              {data.content && !data.summary && (
                <Button
                  disabled={isLoading}
                  size="sm"
                  onClick={handleGenerateSummary}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 size-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      Generate
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {data.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger
              render={
                <Button variant="outline" className="w-full justify-between" />
              }
            >
              <span className="font-medium">Full Content</span>
              <ChevronDown
                className={cn(
                  contentOpen ? 'rotate-180' : '',
                  'size-4 transition-transform duration-200',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card>
                <CardContent>
                  <MessageResponse>{data.content}</MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
