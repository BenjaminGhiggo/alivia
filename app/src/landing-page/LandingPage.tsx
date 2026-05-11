import ExamplesCarousel from "./components/ExamplesCarousel";
import FAQ from "./components/FAQ";
import FeaturesGrid from "./components/FeaturesGrid";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import {
  examples,
  faqs,
  features,
  footerNavigation,
} from "./contentSections";
import AIReady from "./ExampleHighlightedFeature";
import Clients from "./components/Clients";
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
        <FAQ faqs={faqs} />
        <CTA />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
