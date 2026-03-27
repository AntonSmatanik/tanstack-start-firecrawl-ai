import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { FieldGroup } from '#/components/ui/field'
import { FormTextField } from '#/components/ui/form-text-field'
import { LoadingButton } from '#/components/ui/loading-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { UrlSelectionList } from '#/components/url-selection-list'
import { useBulkImport } from '#/hooks/use-bulk-import'
import { BulkImportSchema, ImportSchema } from '#/schemas/import'
import { mapUrlFn, scrapeUrlFn } from '#/server/items'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, LinkIcon } from 'lucide-react'
import { useForm } from 'node_modules/@tanstack/react-form/dist/esm/useForm'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Import Content',
      },
      {
        property: 'og:title',
        content: 'Import Content',
      },
    ],
  }),
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [bulkData, setBulkData] = useState<SearchResultWeb[]>([])
  const {
    selectedUrls,
    isBulkPending,
    progress,
    handleSelectAll,
    handleUrlToggle,
    handleBulkImport,
  } = useBulkImport(bulkData)

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
                  <UrlSelectionList
                    items={bulkData}
                    selectedUrls={selectedUrls}
                    isBulkPending={isBulkPending}
                    progress={progress}
                    onSelectAll={handleSelectAll}
                    onUrlToggle={handleUrlToggle}
                    onBulkImport={handleBulkImport}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
