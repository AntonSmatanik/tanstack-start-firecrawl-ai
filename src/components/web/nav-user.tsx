'use client'

import { ChevronsUpDown, LogOut } from 'lucide-react'

import { UserInfo } from '#/components/user-info'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import type { NavUserProps } from '@/lib/types'

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/',
          })
          toast.success('Signed out successfully')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <UserInfo
              name={user.name}
              email={user.email}
              avatarSrc={
                user.image ??
                `https://api.dicebear.com/9.x/glass/svg?seed=${user.name}`
              }
              avatarClassName="h-8 w-8 rounded-lg"
              fallbackClassName="rounded-lg"
            />
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserInfo
                    name={user.name}
                    email={user.email}
                    avatarSrc={
                      user.image ??
                      `https://api.dicebear.com/9.x/glass/svg?seed=${user.name}`
                    }
                    avatarClassName="h-8 w-8 rounded-lg"
                    fallbackClassName="rounded-lg"
                  />
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
