import { deleteItemFn } from '#/server/items'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function useDeleteItem(onSuccess?: () => void) {
  const [isDeleting, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteItemFn({ data: { id } })
      toast.success('Item deleted')
      onSuccess?.()
    })
  }

  return { isDeleting, handleDelete }
}
