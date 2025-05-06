
import React, { useRef, useEffect } from "react";
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
  
  useEffect(() => {
    // Create a ScrollTrigger that will allow the video to scroll
    // until the RevealText component is about to reach the top of the viewport
    if (revealTextRef.current) {
      ScrollTrigger.create({
        trigger: revealTextRef.current,
        // Start the trigger earlier, when RevealText is 300px below the viewport top
        start: "top+=300 top",
        onEnter: () => {
          // When RevealText approaches the top, disable scrolling in the video section
          // and trigger the fade-out
          const videoContainer = document.querySelector('.video-scroll-container');
          if (videoContainer) {
            videoContainer.classList.add('scroll-disabled');
            videoContainer.classList.add('video-fading-out');
            console.log("RevealText approaching viewport, video fading out");
          }
        },
        onLeaveBack: () => {
          // When scrolling back up from RevealText, re-enable scrolling in video
          // and fade the video back in
          const videoContainer = document.querySelector('.video-scroll-container');
          if (videoContainer) {
            videoContainer.classList.remove('scroll-disabled');
            videoContainer.classList.remove('video-fading-out');
          }
        },
        markers: false
      });
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-black min-h-screen w-full relative">
      <Video />
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
