
import React, { useState } from "react";
import ImageSequencePlayer from "../components/ImageSequencePlayer";
import { useIsAndroid } from "../hooks/use-android";

const ImageSequencePage = () => {
  const [imageSequenceReady, setImageSequenceReady] = useState(false);
  const isAndroid = useIsAndroid();

  const handleImageSequenceReady = () => {
    console.log("Image sequence is ready to display on test page");
    setImageSequenceReady(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Simple header to explain the page */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/70 backdrop-blur-md p-4 text-white">
        <h1 className="text-xl font-bold">Image Sequence Scroll Test</h1>
        <p className="text-sm opacity-80">
          {isAndroid ? "Android detected" : "Non-Android device"} - Scroll down to test the image sequence
        </p>
        {!imageSequenceReady && (
          <div className="my-2 text-amber-400">Loading image sequence...</div>
        )}
        {imageSequenceReady && (
          <div className="my-2 text-green-400">Ready! Scroll down to see the sequence.</div>
        )}
      </div>

      {/* Image sequence player with higher z-index */}
      <ImageSequencePlayer 
        totalFrames={99} 
        onReady={handleImageSequenceReady}
      />

      {/* Footer to see when you've reached the end */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/70 backdrop-blur-md p-4 text-white">
        <p className="text-center">End of sequence test</p>
      </div>
    </div>
  );
};

export default ImageSequencePage;
