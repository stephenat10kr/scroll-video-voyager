
import React from "react";
import ImprovedScrollVideo from "../components/ImprovedScrollVideo";
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
      <ChladniPattern />
      {/* Use ImprovedScrollVideo instead of Video component */}
      <ImprovedScrollVideo src="/videos/HeroTest_1-720.mp4" />
      <div className="content-overlay relative" style={{ zIndex: 2 }}>
        <RevealText />
        <Values title="VALUES" />
        <Rituals title="RITUALS" />
        <Gallery 
          title="SPACE"
          description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge."
          address="45 Howard St, New York, NY 10013"
          mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013"
        />
        <Questions title="QUESTIONS" />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
