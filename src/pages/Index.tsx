
import React from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import ChladniPattern from "../components/ChladniPattern";

const Index = () => {
  return (
    <div className="bg-transparent min-h-screen w-full relative">
      {/* Replace the fixed blue background with ChladniPattern component */}
      <div className="fixed top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
        <ChladniPattern />
      </div>
      
      {/* Video section - z-index of container is set in the ScrollVideo component */}
      <div className="relative w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <Video />
      </div>
      
      {/* Content sections with higher z-index to appear above video */}
      <div className="relative" style={{ zIndex: 6 }}>
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
