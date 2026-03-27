import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Progress } from '#/components/ui/progress'
import type { BulkScrapeProgress } from '#/server/items'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { Loader2 } from 'lucide-react'

interface UrlSelectionListProps {
  items: SearchResultWeb[]
  selectedUrls: Set<string>
  isBulkPending: boolean
  progress: BulkScrapeProgress | null
  onSelectAll: () => void
  onUrlToggle: (url: string) => void
  onBulkImport: () => void
}

export function UrlSelectionList({
  items,
  selectedUrls,
  isBulkPending,
  progress,
  onSelectAll,
  onUrlToggle,
  onBulkImport,
}: UrlSelectionListProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Found {items.length} URLs</p>

        <Button variant="outline" size="sm" onClick={onSelectAll}>
          {selectedUrls.size === items.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-4">
        {items.map((item) => (
          <label
            key={item.url}
            className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2"
          >
            <Checkbox
              className="mt-0.5"
              checked={selectedUrls.has(item.url)}
              onCheckedChange={() => onUrlToggle(item.url)}
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
              {Math.round((progress.completed / progress.total) * 100)}
            </span>
          </div>
          <Progress value={(progress.completed / progress.total) * 100} />
        </div>
      )}

      <Button
        disabled={isBulkPending}
        className="w-full"
        onClick={onBulkImport}
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
  )
}
