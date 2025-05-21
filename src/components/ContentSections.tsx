
import React from "react";
import HeroText from "./HeroText";
import RevealText from "./RevealText";
import Values from "./Values";
import Rituals from "./Rituals";
import Gallery from "./Gallery";
import Questions from "./Questions";
import Footer from "./Footer";
import Logo from "./Logo";
import colors from "../lib/theme";

const ContentSections: React.FC = () => {
  return (
    <>
      {/* Content overlay - now on top of everything */}
      <div 
        className="content-container relative z-20"
        style={{ backgroundColor: 'transparent', position: 'relative' }}
      >
        {/* Logo section at the top */}
        <section className="relative w-full h-screen flex flex-col justify-center items-center bg-transparent">
          <div className="w-full max-w-[90%] mx-auto">
            <div className="flex flex-col items-center">
              <h2 className="title-sm text-roseWhite mb-0 text-center py-0">WELCOME TO</h2>
              <div className="flex justify-center items-center mt-12 w-full">
                <div className="w-[320px] md:w-[420px] lg:w-[520px] mx-auto">
                  <div className="aspect-w-444 aspect-h-213 w-full">
                    <Logo />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Content sections */}
        <section>
          <HeroText skipLogoSection={true} />
        </section>
        
        <section id="revealText-section">
          <RevealText />
        </section>
        
        <section>
          <Values title="VALUES" />
        </section>
        
        <section>
          <Rituals title="RITUALS" />
        </section>
        
        <section>
          <Gallery title="SPACE" description="Nestled in Soho's iconic cast-iron district, 45 Howard is the new home of Lightning Society. Once part of New York's industrial backbone, this multi-level wonder is now a space where history and possibility converge." address="45 Howard St, New York, NY 10013" mapUrl="https://www.google.com/maps/place/45+Howard+St,+New+York,+NY+10013" />
        </section>
        
        <section>
          <Questions title="QUESTIONS" />
        </section>
        
        <section>
          <Footer />
        </section>
      </div>
      
      {/* 600vh spacer to push content down (updated from 700vh) */}
      <div className="w-full" style={{ height: '600vh', backgroundColor: colors.darkGreen }} />
    </>
  );
};

export default ContentSections;
