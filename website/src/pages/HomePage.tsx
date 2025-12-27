import { HeroSection } from '../components/home/HeroSection'
import { StatsSection } from '../components/home/StatsSection'
import { HowItWorksSection } from '../components/home/HowItWorksSection'
import { FeaturesSection } from '../components/home/FeaturesSection'
import { DemoSection } from '../components/home/DemoSection'
import { PluginsSection } from '../components/home/PluginsSection'
import { ComparisonSection } from '../components/home/ComparisonSection'
import { CTASection } from '../components/home/CTASection'

export function HomePage() {
  return (
    <div className="pt-16">
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoSection />
      <PluginsSection />
      <ComparisonSection />
      <CTASection />
    </div>
  )
}
