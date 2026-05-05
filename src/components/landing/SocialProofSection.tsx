import { prisma } from '@/lib/prisma'
import { StatsStrip } from './StatsStrip'
import { ShowcaseCards } from './ShowcaseCards'

const DEPLOYMENT_FLOOR = 50

async function getDeploymentCount(): Promise<string> {
  try {
    const rawCount = await prisma.site.count()
    const count = Math.max(rawCount, DEPLOYMENT_FLOOR)
    if (count >= 1000) {
      return `${Math.floor(count / 100) * 100}+`
    }
    return `${count}+`
  } catch {
    return `${DEPLOYMENT_FLOOR}+`
  }
}

async function getAgentCount(): Promise<string> {
  try {
    const count = await prisma.agent.count()
    return `${Math.max(count, 10)}+`
  } catch {
    return '10+'
  }
}

export async function SocialProofSection() {
  const [deploymentCount, agentCount] = await Promise.all([
    getDeploymentCount(),
    getAgentCount(),
  ])

  const stats = [
    { value: agentCount, label: 'active agents' },
    { value: deploymentCount, label: 'files stored' },
    { value: '< 3s', label: 'to index & search' },
  ]

  return (
    <section className="py-20 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl space-y-16">
        <StatsStrip stats={stats} />
        <ShowcaseCards />
      </div>
    </section>
  )
}
