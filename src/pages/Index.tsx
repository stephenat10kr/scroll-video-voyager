
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
        <section className="snap-start snap-always">
          <RevealText />
        </section>
        <section className="snap-start snap-always">
          <Values title="VALUES" />
        </section>
        <section className="snap-start snap-always">
          <Rituals title="RITUALS" />
        </section>
        <section className="snap-start snap-always">
          <Gallery 
            title="SPACE"
            description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge."
            address="45 Howard St, New York, NY 10013"
            mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013"
          />
        </section>
        <section className="snap-start snap-always">
          <Questions title="QUESTIONS" />
        </section>
        <section className="snap-start snap-always">
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default Index;
