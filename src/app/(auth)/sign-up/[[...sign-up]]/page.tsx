import { SignUp } from '@clerk/nextjs'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function SignUpPage() {
  if (!CLERK_CONFIGURED) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-14 px-4">
        <p className="text-[var(--muted-foreground)]">Authentication is not configured.</p>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen items-center justify-center pt-14 px-4">
      <SignUp />
    </div>
  )
}
