import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <SocialProofSection />
      <TestimonialsSection />
      <FeaturesSection />
    </>
  )
}
