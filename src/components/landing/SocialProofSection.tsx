import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { StatsStrip } from './StatsStrip'
import { ShowcaseCards } from './ShowcaseCards'

const DEPLOYMENT_FLOOR = 50

// Cache counts for 5 minutes — these numbers don't need to be real-time.
const getCounts = unstable_cache(
  async () => {
    const [files, agents] = await Promise.all([
      prisma.site.count().catch(() => DEPLOYMENT_FLOOR),
      prisma.agent.count().catch(() => 10),
    ])
    return { files, agents }
  },
  ['landing-counts'],
  { revalidate: 300 }
)

export async function SocialProofSection() {
  const { files, agents } = await getCounts()

  return (
    <>
      <StatsStrip agents={agents} files={files} />
      <ShowcaseCards />
    </>
  )
}
