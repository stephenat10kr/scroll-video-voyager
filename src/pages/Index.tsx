
import React from "react";
import Video from "../components/Video";
import RevealText from "../components/RevealText";
import Values from "../components/Values";

const Index = () => {
  return (
    <div className="bg-black min-h-screen w-full relative">
      <Video />
      <div className="relative" style={{ zIndex: 2 }}>
        <RevealText />
        <Values title="VALUES" />
      </div>
    </div>
  );
};

export default Index;
