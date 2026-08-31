import { Suspense } from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { ComparisonSection } from '@/components/landing/ComparisonSection'

function HeroSkeleton() {
  return <div className="min-h-[80vh]" aria-hidden />
}

export default function Home() {
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
