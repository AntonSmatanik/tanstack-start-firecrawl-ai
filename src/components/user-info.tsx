import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

type UserInfoProps = {
  name: string
  email: string
  avatarSrc: string
  avatarClassName?: string
  fallbackClassName?: string
}

export function UserInfo({
  name,
  email,
  avatarSrc,
  avatarClassName,
  fallbackClassName,
}: UserInfoProps) {
  return (
    <>
      <Avatar className={avatarClassName}>
        <AvatarImage src={avatarSrc} alt={name} />
        <AvatarFallback className={fallbackClassName}>CN</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </>
  )
}
