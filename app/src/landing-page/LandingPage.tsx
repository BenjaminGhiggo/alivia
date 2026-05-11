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
  testimonials,
  footerNavigation,
} from "./contentSections";
import TransparentAudit from "./ExampleHighlightedFeature";
import Clients from "./components/Clients";
import HowItWorks from "./HowItWorks";
import BlockchainSection from "./BlockchainSection";
import SecurityFeatures from "./SecurityFeatures";
import CTA from "./CTA";
import StatsSection from "./Stats";
import Reveal from "./Reveal";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <main className="isolate">
        <Hero />
        <Reveal><HowItWorks /></Reveal>
        <Reveal><Clients /></Reveal>
        <Reveal><FeaturesGrid features={features} /></Reveal>
        <Reveal><TransparentAudit /></Reveal>
        <Reveal><ExamplesCarousel examples={examples} /></Reveal>
        <Reveal><SecurityFeatures /></Reveal>
        <Reveal><BlockchainSection /></Reveal>
        <Reveal><StatsSection /></Reveal>
        <Reveal><Testimonials testimonials={testimonials} /></Reveal>
        <Reveal><FAQ faqs={faqs} /></Reveal>
        <Reveal><CTA /></Reveal>
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
