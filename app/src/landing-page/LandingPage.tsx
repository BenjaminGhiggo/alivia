import ExamplesCarousel from "./components/ExamplesCarousel";
import FAQ from "./components/FAQ";
import FeaturesGrid from "./components/FeaturesGrid";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Testimonials from "./components/Testimonials";
import {
  examples,
  faqs,
  features,
  footerNavigation,
  testimonials,
} from "./contentSections";
import AIReady from "./ExampleHighlightedFeature";
import Clients from "./components/Clients";
import StatsSection from "./Stats";
import HowItWorks from "./HowItWorks";
import BlockchainSection from "./BlockchainSection";
import SecurityFeatures from "./SecurityFeatures";
import CTA from "./CTA";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <main className="isolate">
        <Hero />
        <Clients />
        <ExamplesCarousel examples={examples} />
        <AIReady />
        <FeaturesGrid features={features} />
        <HowItWorks />
        <BlockchainSection />
        <SecurityFeatures />
        <StatsSection />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
        <CTA />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
