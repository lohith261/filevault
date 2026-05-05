import { prisma } from '@/lib/prisma'
import { StatsStrip } from './StatsStrip'
import { ShowcaseCards } from './ShowcaseCards'

const DEPLOYMENT_FLOOR = 50

async function getDeploymentCount(): Promise<number> {
  try {
    return await prisma.site.count()
  } catch {
    return DEPLOYMENT_FLOOR
  }
}

async function getAgentCount(): Promise<number> {
  try {
    return await prisma.agent.count()
  } catch {
    return 10
  }
}

export async function SocialProofSection() {
  const [files, agents] = await Promise.all([
    getDeploymentCount(),
    getAgentCount(),
  ])

  return (
    <>
      <StatsStrip agents={agents} files={files} />
      <ShowcaseCards />
    </>
  )
}
