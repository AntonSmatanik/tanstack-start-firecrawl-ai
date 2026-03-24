import { authClient } from '#/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const { data: session, isPending } = authClient.useSession()

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

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex itemds-center gap-2">
          <img
            src="https://thumb-cdn77.xvideos-cdn.com/4fe5278a-4ce6-4c55-89c0-423defdd48b5/3/xv_2_t.jpg"
            alt="Logo"
            className="size-9"
          />
          <h1 className="text-lg font-bold">TanStack</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isPending ? null : session ? (
            <>
              <Button onClick={handleSignOut}>Log Out</Button>
              <Link
                to="/dashboard"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'secondary' })}
              >
                Login
              </Link>
              <Link to="/signup" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
