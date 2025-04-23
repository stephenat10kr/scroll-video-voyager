
import React from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Gallery from "../components/Gallery";

const Index = () => {
  return (
    <div className="bg-black min-h-screen w-full relative">
      <Video />
      <div className="relative" style={{ zIndex: 2 }}>
        <RevealText />
        <Values title="VALUES" />
        <Gallery 
          title="SPACE"
          images={[
            "/lovable-uploads/f852ba8f-0d71-4ebf-b3a6-f46917758d4a.png",
            "/lovable-uploads/85c65114-173a-445d-9420-ea7890ad0bf4.png"
          ]}
          description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge."
          address="45 Howard St, New York, NY 10013"
          mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013"
        />
      </div>
    </div>
  );
};

export default Index;
