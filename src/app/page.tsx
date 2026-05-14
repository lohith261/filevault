import { Suspense } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'

// Shown while HeroSection awaits the cached DB count.
// Cache TTL is 5 min so this skeleton only flashes on cold cache misses.
function HeroSkeleton() {
  return <div className="min-h-[90vh]" aria-hidden />
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </>
  )
}
