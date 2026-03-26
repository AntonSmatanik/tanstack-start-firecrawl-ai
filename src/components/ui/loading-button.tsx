import { Button } from '#/components/ui/button'
import { Loader2 } from 'lucide-react'

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  isPending: boolean
  pendingText: string
}

export function LoadingButton({
  isPending,
  pendingText,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={isPending} {...props}>
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
