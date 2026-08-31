import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/** Verify Clerk session and confirm the agent belongs to the signed-in user. */
export async function resolveUserAgent(agentId: string) {
  const { userId } = await auth()
  if (!userId) return null
  return prisma.agent.findFirst({ where: { id: agentId, userId } })
}

/** Return the Clerk userId from the current session, or null. */
export async function requireUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId ?? null
}
