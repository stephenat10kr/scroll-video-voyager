
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

const Index = () => {
  const isAndroid = useIsAndroid();
  
  return (
    <div className="min-h-screen w-full relative">
      {/* Background pattern (lowest z-index) */}
      <ChladniPattern />
      
      {/* Video fixed at the top (mid z-index) */}
      <ImprovedScrollVideo />
      
      {/* Content overlay (highest z-index) */}
      <div className="content-container relative z-10">
        {/* Content stacked in the requested order with proper spacing */}
        <section className="pt-0">
          <HeroText />
        </section>
        
        <section>
          <RevealText />
        </section>
        
        <section>
          <Values title="VALUES" />
        </section>
        
        <section>
          <Rituals title="RITUALS" />
        </section>
        
        <section>
          <Gallery 
            title="SPACE"
            description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge."
            address="45 Howard St, New York, NY 10013"
            mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013"
          />
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
