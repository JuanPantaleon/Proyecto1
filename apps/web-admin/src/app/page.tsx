'use client';

import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { BentoPillars } from '@/components/landing/bento-pillars';
import { AboutSection } from '@/components/landing/about-section';
import { DivisionsGrid } from '@/components/landing/divisions-grid';
import { CtaBanner } from '@/components/landing/cta-banner';
import { EcosystemSection } from '@/components/landing/ecosystem-section';
import { CoachesMarketplace } from '@/components/landing/coaches-marketplace';
import { SocialFeed } from '@/components/landing/social-feed';
import { ISGSimulator } from '@/components/landing/isg-simulator';
import { PricingSection } from '@/components/landing/pricing-section';
import { RecentRecords } from '@/components/landing/recent-records';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <BentoPillars />
        <AboutSection />
        <DivisionsGrid />
        <CtaBanner />
        <EcosystemSection />
        <CoachesMarketplace />
        <SocialFeed />
        <ISGSimulator />
        <PricingSection />
        <RecentRecords />
      </main>
      <Footer />
    </div>
  );
}