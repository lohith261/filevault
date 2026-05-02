import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FeaturesSection />
    </>
  )
}
