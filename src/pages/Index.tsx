
import React, { useEffect } from "react";
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
import { useViewportHeight } from "../hooks/use-viewport-height";

const Index = () => {
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();
  
  // Use our custom viewport height hook
  const viewportHeight = useViewportHeight();
  
  // Log device detection for debugging
  useEffect(() => {
    console.log("Device detection - Android:", isAndroid, "iOS:", isIOS);
    console.log("Viewport height:", viewportHeight);
  }, [isAndroid, isIOS, viewportHeight]);
  
  // Apply the custom viewport height to ensure iOS scrolling works correctly
  useEffect(() => {
    if (isIOS) {
      const contentContainer = document.querySelector('.content-container');
      if (contentContainer) {
        // Set explicit minimum height for iOS to ensure proper scrolling
        contentContainer.setAttribute('style', `min-height: calc(var(--vh, 1vh) * 600);`);
      }
    }
  }, [isIOS, viewportHeight]);
  
  return <div className="min-h-screen w-full relative">
      {/* Background pattern (lowest z-index) */}
      <ChladniPattern />
      
      {/* Video fixed at the top (mid z-index) */}
      <ImprovedScrollVideo />
      
      {/* Content overlay (high z-index) */}
      <div className="content-container relative z-10 min-h-[600vh]">
        {/* No separate logo section here - it's included in HeroText */}
        <section>
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
    </div>;
};

export default Index;
