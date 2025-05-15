
import React from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import HeroText from "../components/HeroText";
import GreenBox from "../components/GreenBox";
import colors from "../lib/theme";

const Index = () => {
  return (
    <div className="bg-[#203435] min-h-screen w-full relative">
      <div className="relative">
        <Video />
        <div className="absolute top-0 left-0 w-full" style={{ zIndex: 2 }}>
          <HeroText />
        </div>
      </div>
      <div className="relative" style={{ zIndex: 2 }}>
        <RevealText />
        <GreenBox />
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
