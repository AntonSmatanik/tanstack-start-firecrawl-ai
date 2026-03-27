import type { BulkScrapeProgress } from '#/server/items'
import { bulkScrapeUrlFn } from '#/server/items'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export function useBulkImport(items: SearchResultWeb[]) {
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [isBulkPending, startBulkTransition] = useTransition()
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)

  const handleSelectAll = () => {
    if (selectedUrls.size === items.length) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(items.map((item) => item.url)))
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

  return {
    selectedUrls,
    isBulkPending,
    progress,
    handleSelectAll,
    handleUrlToggle,
    handleBulkImport,
  }
}
