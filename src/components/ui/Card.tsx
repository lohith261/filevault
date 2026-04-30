import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)}>{children}</div>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>
}
