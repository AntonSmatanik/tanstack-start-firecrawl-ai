import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import { FieldGroup } from '#/components/ui/field'
import { FormTextField } from '#/components/ui/form-text-field'
import { LoadingButton } from '#/components/ui/loading-button'
import { Progress } from '#/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { BulkScrapeProgress } from '#/data/items'
import { bulkScrapeUrlFn, mapUrlFn, scrapeUrlFn } from '#/data/items'
import { BulkImportSchema, ImportSchema } from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, LinkIcon, Loader2 } from 'lucide-react'
import { useForm } from 'node_modules/@tanstack/react-form/dist/esm/useForm'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()
  const [bulkData, setBulkData] = useState<SearchResultWeb[]>([])
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)

  const handleSelectAll = () => {
    if (selectedUrls.size === bulkData.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(bulkData.map((item) => item.url)))
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
      url: '',
    },
    validators: {
      onSubmit: ImportSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await scrapeUrlFn({ data: value })
        toast.success('URL scraped successfully!')
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    },
    validators: {
      onSubmit: BulkImportSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const data = await mapUrlFn({ data: value })
        setBulkData(data)
        toast.success('Bulk import completed successfully!')
      })
    },
  })

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Content</h1>
          <p className="text-muted-foreground pt-1">
            Save web pages to your library for easy access later.
          </p>
        </div>

        <Tabs defaultValue={'single'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <LinkIcon className="size-4" />
              Single URL
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <GlobeIcon className="size-4" />
              Bulk import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import a Single URL</CardTitle>
                <CardDescription>
                  Scrap and save content from any web app!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <form.Field
                      name="url"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="URL"
                          placeholder="https://example.com"
                          type="url"
                          autoComplete="off"
                        />
                      )}
                    />

                    <LoadingButton
                      isPending={isPending}
                      pendingText="Importing..."
                      type="submit"
                    >
                      Import
                    </LoadingButton>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Discover and import multiple URLs from a website at once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field
                      name="url"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="URL"
                          placeholder="https://example.com"
                          type="url"
                          autoComplete="off"
                        />
                      )}
                    />

                    <bulkForm.Field
                      name="search"
                      children={(field) => (
                        <FormTextField
                          field={field}
                          label="Search"
                          placeholder="e.g. blog, articles, etc."
                          type="text"
                          autoComplete="off"
                        />
                      )}
                    />

                    <LoadingButton
                      isPending={isPending}
                      pendingText="Importing..."
                      type="submit"
                    >
                      Import
                    </LoadingButton>
                  </FieldGroup>
                </form>

                {bulkData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Found {bulkData.length} URLs
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedUrls.size === bulkData.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
                      {bulkData.map((item) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
