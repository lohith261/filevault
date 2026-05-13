import { Suspense } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'

// Skeleton shown while SocialProofSection makes its DB queries.
// Prevents DB latency from blocking the initial page render.
function SocialProofSkeleton() {
  return <div className="h-40 w-full" aria-hidden />
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<SocialProofSkeleton />}>
        <SocialProofSection />
      </Suspense>
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </>
  )
}
