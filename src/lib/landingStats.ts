import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/** Cached for 5 minutes — used in HeroSection stats panel. */
export const getLandingStats = unstable_cache(
  async () => {
    const [agents, embeddings] = await Promise.all([
      prisma.agent.count().catch(() => 0),
      prisma.embedding.count().catch(() => 0),
    ])
    return { agents, embeddings }
  },
  ['landing-stats'],
  { revalidate: 300 }
)
