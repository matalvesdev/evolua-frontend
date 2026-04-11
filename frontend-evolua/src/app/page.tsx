import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import FeatureVoice from '@/components/landing/FeatureVoice';
import FeatureSchedule from '@/components/landing/FeatureSchedule';
import FeatureSecurity from '@/components/landing/FeatureSecurity';
import Demo from '@/components/landing/Demo';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import Signup from '@/components/landing/Signup';
import Footer from '@/components/landing/Footer';
import HimetricaAnalytics from '@/components/landing/HimetricaAnalytics';

export const metadata: Metadata = {
  title: 'Evolua - Sua Jornada Clínica',
  description:
    'Simplifique sua rotina clínica com relatórios por voz, agenda inteligente e prontuário digital.',
};

export default function LandingPage() {
  return (
    <div className="bg-white text-text-light antialiased selection:bg-primary/20 font-sans">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <HimetricaAnalytics />
      <Navbar />
      <main id="main-content" className="pt-24 pb-32">
        <Hero />
        <FeatureVoice />
        <FeatureSchedule />
        <FeatureSecurity />
        <Demo />
        <SocialProof />
        <Pricing />
        <Signup />
      </main>
      <Footer />
    </div>
  );
}
