
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
        
        {/* ScrollJack Component */}
        <ScrollJackContainer titles={["OUR ETHOS", "OUR COMMUNITY", "OUR MISSION"]}>
          <section className="min-h-screen bg-[#203435]">
            <div className="container mx-auto px-4 py-16">
              <h1 className="text-4xl font-bold text-white mb-6">OUR ETHOS</h1>
              <p className="text-xl text-white max-w-2xl">
                Lightning Society is more than a place—it's a philosophy. We believe in creating spaces where 
                creativity, connection, and conversation can thrive without boundaries or limitations.
              </p>
            </div>
          </section>
          <section className="min-h-screen bg-[#203435]">
            <div className="container mx-auto px-4 py-16">
              <h1 className="text-4xl font-bold text-white mb-6">OUR COMMUNITY</h1>
              <p className="text-xl text-white max-w-2xl">
                Our members are pioneers, creators, and innovators across industries. Together, we form a 
                collective of individuals who are passionate about making meaningful connections and driving change.
              </p>
            </div>
          </section>
          <section className="min-h-screen bg-[#203435]">
            <div className="container mx-auto px-4 py-16">
              <h1 className="text-4xl font-bold text-white mb-6">OUR MISSION</h1>
              <p className="text-xl text-white max-w-2xl">
                We're dedicated to fostering transformative experiences through thoughtful design, curated 
                programming, and a commitment to building a diverse and inclusive community.
              </p>
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
