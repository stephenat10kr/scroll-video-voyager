
import React from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import colors from "@/lib/theme";

const Index = () => {
  return (
    <div className="bg-[#203435] min-h-screen w-full relative">
      <Video />
      <div className="relative" style={{ zIndex: 2 }}>
        <RevealText />
        <Values title="VALUES" />
        <Rituals title="RITUALS" />
        <div className="relative">
          {/* Curved top SVG */}
          <div className="absolute top-0 left-0 right-0 w-full transform -translate-y-[1px] z-10">
            <svg width="100%" height="210" viewBox="0 0 1440 210" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M312.58 89.2563C150.65 54.8844 0 75.5117 0 0V210H1440L1439.64 0C1439.64 75.5117 1288.99 54.8844 1127.06 89.2563C919.9 133.222 898.46 194.76 719.82 194.76C541.18 194.76 519.75 133.222 312.58 89.2563Z" fill={colors.darkGreen} />
            </svg>
          </div>
          <Gallery 
            title="SPACE"
            description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge."
            address="45 Howard St, New York, NY 10013"
            mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013"
          />
        </div>
        <Questions title="QUESTIONS" />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
