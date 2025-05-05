
import React, { useRef, useEffect, useState } from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const revealTextRef = useRef<HTMLDivElement>(null);
  const [videoComplete, setVideoComplete] = useState(false);
  
  useEffect(() => {
    if (revealTextRef.current) {
      // Create a ScrollTrigger that detects when RevealText enters the viewport
      ScrollTrigger.create({
        trigger: revealTextRef.current,
        start: "top bottom",
        onEnter: () => {
          console.log("RevealText entered viewport");
          setVideoComplete(true);
        },
        markers: false
      });
    }
  }, []);

  return (
    <div className="bg-black min-h-screen w-full relative">
      <Video onVideoComplete={videoComplete ? undefined : () => setVideoComplete(true)} />
      <div className="relative" style={{ zIndex: 2 }}>
        <div ref={revealTextRef}>
          <RevealText />
        </div>
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
