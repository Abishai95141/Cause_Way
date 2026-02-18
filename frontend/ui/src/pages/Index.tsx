import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductivitySection from "@/components/ProductivitySection";
import VirtualOfficeSection from "@/components/VirtualOfficeSection";
import GitHubSyncSection from "@/components/GitHubSyncSection";
import MetaBrainSection from "@/components/MetaBrainSection";
import KnowledgeSection from "@/components/KnowledgeSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Alternating backgrounds: odd sections dark, even sections white */}
        <div className="section-light bg-white">
          <ProductivitySection />
        </div>
        <div className="bg-background">
          <VirtualOfficeSection />
        </div>
        <div className="section-light bg-white">
          <GitHubSyncSection />
        </div>
        <div className="bg-background">
          <MetaBrainSection />
        </div>
        <div className="section-light bg-white">
          <KnowledgeSection />
        </div>
        <div className="bg-background">
          <CTASection />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
