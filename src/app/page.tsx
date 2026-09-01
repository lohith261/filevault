import { Suspense } from 'react'
import { headers } from 'next/headers'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { ComparisonSection } from '@/components/landing/ComparisonSection'
import DashboardAppPage from './dashboard-app/page'

function HeroSkeleton() {
  return <div className="min-h-[80vh]" aria-hidden />
}

export default async function Home() {
  const host = (await headers()).get('host') ?? ''
  if (host === 'dashboard.filevault.host' || host.startsWith('dashboard.')) {
    return <DashboardAppPage />
  }

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <ComparisonSection />
    </>
  )
}
