import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'

export function useSignOut() {
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Logged out successfully')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }

  return { handleSignOut }
}
