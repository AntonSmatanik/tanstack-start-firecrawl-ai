import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Navbar } from '#/components/custom/navbar'

vi.mock('#/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
    // signIn: vi.fn(),
    // signUp: vi.fn(),
    // signOut: vi.fn(),
  },
}))

// vi.mock('#/hooks/use-sign-out', () => ({
//   useSignOut: () => ({ handleSignOut: vi.fn() }),
// }))

vi.mock('#/components/custom/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: (props: any) => <a {...props} />,
}))

describe('Navbar', () => {
  it('shows brand and auth links for unauthenticated user', () => {
    render(<Navbar />)

    expect(screen.getByText(/TanStack/i)).toBeDefined()
    expect(screen.getByText(/Login/i)).toBeDefined()
    expect(screen.getByText(/Get Started/i)).toBeDefined()
    expect(screen.getByTestId('theme-toggle')).toBeDefined()
  })
})
