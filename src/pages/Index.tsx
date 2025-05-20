
import React from "react";
import ImprovedScrollVideo from "../components/ImprovedScrollVideo";
import HeroText from "../components/HeroText";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import ChladniPattern from "../components/ChladniPattern";
import { useIsAndroid } from "../hooks/use-android";
import { useIsIOS } from "../hooks/use-ios";
import Logo from "../components/Logo";

const Index = () => {
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();
  
  // Log device detection for debugging
  React.useEffect(() => {
    console.log("Device detection - Android:", isAndroid, "iOS:", isIOS);
  }, [isAndroid, isIOS]);
  
  return (
    <div className="min-h-screen w-full relative">
      {/* Background pattern (lowest z-index) */}
      <ChladniPattern />
      
      {/* Video fixed in the background (lowest content z-index) */}
      <div className="relative z-0">
        <ImprovedScrollVideo />
      </div>
      
      {/* Content overlay (higher z-index) */}
      <div className="content-container absolute top-0 left-0 w-full z-10">
        {/* HeroText will now be at the very top of the page */}
        <section className="relative w-full">
          <HeroText skipLogoSection={false} />
        </section>
        
        <section id="revealText-section">
          <RevealText />
        </section>
        
        <section>
          <Values title="VALUES" />
        </section>
        
        <section>
          <Rituals title="RITUALS" />
        </section>
        
        <section>
          <Gallery title="SPACE" description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge." address="45 Howard St, New York, NY 10013" mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013" />
        </section>
        
        <section>
          <Questions title="QUESTIONS" />
        </section>
        
        <section>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Index;
