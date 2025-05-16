
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
    <div className="min-h-screen w-full relative">
      <ChladniPattern />
      <Video />
      <div className="content-overlay relative" style={{ zIndex: 2 }}>
        <div className="section-snap">
          <RevealText />
        </div>
        <Values title="VALUES" />
        <div className="section-snap">
          <Rituals title="RITUALS" />
        </div>
        <div className="section-snap">
          <Gallery 
            title="SPACE"
            description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge."
            address="45 Howard St, New York, NY 10013"
            mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013"
          />
        </div>
        <div className="section-snap">
          <Questions title="QUESTIONS" />
        </div>
        <div className="section-snap">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
