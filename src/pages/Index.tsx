
import React from "react";
import ImprovedScrollVideo from "../components/ImprovedScrollVideo";
import HeroText from "../components/HeroText";
import RevealText from "../components/RevealText";
import Values from "../components/Values";
import Rituals from "../components/Rituals";
import Gallery from "../components/Gallery";
import Questions from "../components/Questions";
import Footer from "../components/Footer";
import ChladniPattern from "../components/ChladniPattern";
import { useIsAndroid } from "../hooks/use-android";
import Logo from "../components/Logo";
const Index = () => {
  const isAndroid = useIsAndroid();
  return <div className="min-h-screen w-full relative">
      {/* Background pattern (lowest z-index) */}
      <ChladniPattern />
      
      {/* Logo section at the top (highest z-index) */}
      <div className="relative z-20 w-full h-screen flex flex-col justify-center items-center bg-transparent">
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
      </div>
      
      {/* Video fixed at the top (mid z-index) */}
      <ImprovedScrollVideo />
      
      {/* Content overlay (high z-index, but below logo) */}
      <div className="content-container relative z-10">
        {/* Skip the logo section since we moved it above */}
        <section className="pt-32 mt-[50vh]">
          {/* Modified to only show the remaining two hero text sections */}
          <HeroText skipLogoSection={true} />
        </section>
        
        <section>
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
    </div>;
};
export default Index;
