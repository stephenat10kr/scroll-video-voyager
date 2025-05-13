
import React from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import { ScrollJackContainer } from "../components/scroll-jack";

const Index = () => {
  return (
    <div className="bg-[#203435] min-h-screen w-full relative">
      <Video />
      <div className="relative" style={{ zIndex: 2 }}>
        <RevealText />
        
        <ScrollJackContainer 
          titles={[
            "Our Ethos", 
            "Our Community", 
            "Our Mission"
          ]}
        >
          <section className="bg-darkGreen w-full px-4 md:px-10">
            <div className="max-w-5xl mx-auto text-roseWhite">
              <div className="md:w-3/4 mx-auto text-center">
                <p className="title-sm mb-6">
                  Lightning Society is a gathering of creative minds, entrepreneurs, artists, and visionaries committed to exploring the boundaries of human potential.
                </p>
              </div>
            </div>
          </section>
          
          <section className="bg-darkGreen w-full px-4 md:px-10">
            <div className="max-w-5xl mx-auto text-roseWhite">
              <div className="md:w-3/4 mx-auto text-center">
                <p className="title-sm mb-6">
                  Our community fosters deep connections through shared experiences, collaborative projects, and transformative events that inspire growth.
                </p>
              </div>
            </div>
          </section>
          
          <section className="bg-darkGreen w-full px-4 md:px-10">
            <div className="max-w-5xl mx-auto text-roseWhite">
              <div className="md:w-3/4 mx-auto text-center">
                <p className="title-sm mb-6">
                  We believe in the power of human connection to catalyze innovation and meaningful change in ourselves and the world around us.
                </p>
              </div>
            </div>
          </section>
        </ScrollJackContainer>
        
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
