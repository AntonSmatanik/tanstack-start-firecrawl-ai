import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Progress } from '#/components/ui/progress'
import type { BulkScrapeProgress } from '#/data/items'
import { bulkScrapeUrlFn, searchWebFn } from '#/data/items'
import { SearchSchema } from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/discover/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchResults, setSearchResults] = useState<SearchResultWeb[]>([])
  const [isPending, startTransition] = useTransition()
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [isBulkPending, startBulkTransition] = useTransition()
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)

  const handleSelectAll = () => {
    if (selectedUrls.size === searchResults.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(searchResults.map((item) => item.url)))
    }
  }

  const handleUrlToggle = (url: string) => {
    setSelectedUrls((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(url)) {
        newSet.delete(url)
      } else {
        newSet.add(url)
      }
      return newSet
    })
  }

  const handleBulkImport = async () => {
    startBulkTransition(async () => {
      if (selectedUrls.size === 0) {
        toast.error('Please select at least one URL to import.')
        return
      }

      setProgress({
        completed: 0,
        total: selectedUrls.size,
        url: '',
        status: 'success',
      })

      let successCount = 0
      let failedCount = 0

      for await (const update of await bulkScrapeUrlFn({
        data: {
          urls: Array.from(selectedUrls),
        },
      })) {
        setProgress(update)

        if (update.status === 'success') {
          successCount++
        } else {
          failedCount++
        }
      }

      setProgress(null)

      if (failedCount > 0) {
        toast.success(
          `Successfully imported ${successCount} URLs, ${failedCount} failed.`,
        )
      } else {
        toast.success(`Successfully imported ${successCount} URLs!`)
      }
    })
  }

  const form = useForm({
    defaultValues: {
      query: '',
    },
    validators: {
      onSubmit: SearchSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const results = await searchWebFn({
          data: {
            query: value.query,
          },
        })
        setSearchResults(results)
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Discover</h1>
          <p className="text-muted-foreground pt-2">
            Search the web for articles on any topic.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" /> Topic Search
            </CardTitle>
            <CardDescription>
              Search the web for articles on any topic and save them to your
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field
                  name="query"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Search Query
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter your search query"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <Button disabled={isPending} type="submit">
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Search
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Found {searchResults.length} URLs
                  </p>

                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedUrls.size === searchResults.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>

                <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
                  {searchResults.map((item) => (
                    <label
                      key={item.url}
                      className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2"
                    >
                      <Checkbox
                        className="mt-0.5"
                        checked={selectedUrls.has(item.url)}
                        onCheckedChange={() => handleUrlToggle(item.url)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.title ?? 'No title'}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {item.description ?? 'No description'}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {item.url}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between trext-sm">
                      <span className="text-muted-foreground">
                        Importing: {progress.completed}/{progress.total}
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          (progress.completed / progress.total) * 100,
                        )}
                      </span>
                    </div>
                    <Progress
                      value={(progress.completed / progress.total) * 100}
                    />
                  </div>
                )}

                <Button
                  disabled={isBulkPending}
                  className="w-full"
                  onClick={handleBulkImport}
                  type="button"
                >
                  {isBulkPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {progress
                        ? `Importing ${progress.completed}/${progress.total}...`
                        : 'Starting...'}
                    </>
                  ) : (
                    `Import ${selectedUrls.size} URLs`
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
