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
import { UrlSelectionList } from '#/components/url-selection-list'
import { searchWebFn } from '#/data/items'
import { useBulkImport } from '#/hooks/use-bulk-import'
import { SearchSchema } from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'

export const Route = createFileRoute('/dashboard/discover/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchResults, setSearchResults] = useState<SearchResultWeb[]>([])
  const [isPending, startTransition] = useTransition()
  const {
    selectedUrls,
    isBulkPending,
    progress,
    handleSelectAll,
    handleUrlToggle,
    handleBulkImport,
  } = useBulkImport(searchResults)

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
                  children={(field) => (
                    <FormTextField
                      field={field}
                      label="Search Query"
                      placeholder="Enter your search query"
                      autoComplete="off"
                    />
                  )}
                />

                <LoadingButton
                  isPending={isPending}
                  pendingText="Searching..."
                  type="submit"
                >
                  <Search className="size-4" />
                  Search
                </LoadingButton>
              </FieldGroup>
            </form>

            {searchResults.length > 0 && (
              <UrlSelectionList
                items={searchResults}
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
      </div>
    </div>
  )
}
