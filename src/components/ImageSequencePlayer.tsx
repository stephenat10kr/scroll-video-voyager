
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ImageSequencePlayerProps = {
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
};

const ImageSequencePlayer: React.FC<ImageSequencePlayerProps> = ({
  segmentCount,
  onTextIndexChange,
  onAfterVideoChange,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastProgressRef = useRef(0);

  // Testing different URL formats
  const testImageNumber = "0001";
  
  // Test URLs
  const urlWithoutSpaces = `/Image%20Sequence/${testImageNumber}.webp`;
  const absoluteUrlWithoutSpaces = `${window.location.origin}/Image%20Sequence/${testImageNumber}.webp`;
  const publicPath = `/public/Image%20Sequence/${testImageNumber}.webp`;
  const absolutePublicPath = `${window.location.origin}/public/Image%20Sequence/${testImageNumber}.webp`;
  
  // Bare minimum path - this should work if the files are properly served
  const simplePath = `/${testImageNumber}.webp`;
  
  useEffect(() => {
    console.log("ImageSequencePlayer mounted");
    console.log("URL paths being tested:");
    console.log("- urlWithoutSpaces:", urlWithoutSpaces);
    console.log("- absoluteUrlWithoutSpaces:", absoluteUrlWithoutSpaces);
    console.log("- publicPath:", publicPath);
    console.log("- absolutePublicPath:", absolutePublicPath);
    console.log("- simplePath:", simplePath);
    
    const container = containerRef.current;
    if (!container) {
      console.error("Container ref is null");
      return;
    }

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    const segLen = 1 / (segmentCount + 1);

    const updateScroll = (progress: number) => {
      if (Math.abs(progress - lastProgressRef.current) < 0.01) {
        return;
      }
      lastProgressRef.current = progress;

      // Just update text indices based on scroll
      let textIdx: number | null = null;
      for (let i = 0; i < segmentCount; ++i) {
        if (progress >= segLen * i && progress < segLen * (i + 1)) {
          textIdx = i;
          break;
        }
      }
      if (progress >= segLen * segmentCount) {
        textIdx = null;
      }
      onTextIndexChange(textIdx);
      onAfterVideoChange(progress >= 1);
    };

    console.log("Creating ScrollTrigger in ImageSequencePlayer");
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${SCROLL_EXTRA_PX}`,
      scrub: 0.1,
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (isNaN(progress)) {
          console.warn("Progress is NaN");
          return;
        }
        updateScroll(progress);
      }
    });

    console.log("ScrollTrigger created in ImageSequencePlayer");
    
    return () => {
      console.log("ImageSequencePlayer unmounting");
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, onTextIndexChange, onAfterVideoChange]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex flex-col items-center justify-center">
      <div className="grid grid-cols-2 grid-rows-3 gap-4 p-4 bg-black/90 w-full h-full">
        {/* Test image 1 */}
        <div className="relative border border-gray-700 flex flex-col">
          <div className="text-white text-xs mb-1 bg-black p-1">URL without spaces:</div>
          <img
            src={urlWithoutSpaces}
            alt={`Test 1`}
            className="w-full h-full object-contain"
            onLoad={() => console.log("Image 1 loaded successfully!")}
            onError={(e) => console.error("Image 1 failed to load:", e)}
          />
        </div>
        
        {/* Test image 2 */}
        <div className="relative border border-gray-700 flex flex-col">
          <div className="text-white text-xs mb-1 bg-black p-1">Absolute URL without spaces:</div>
          <img
            src={absoluteUrlWithoutSpaces}
            alt={`Test 2`}
            className="w-full h-full object-contain"
            onLoad={() => console.log("Image 2 loaded successfully!")}
            onError={(e) => console.error("Image 2 failed to load:", e)}
          />
        </div>
        
        {/* Test image 3 */}
        <div className="relative border border-gray-700 flex flex-col">
          <div className="text-white text-xs mb-1 bg-black p-1">Public path:</div>
          <img
            src={publicPath}
            alt={`Test 3`}
            className="w-full h-full object-contain"
            onLoad={() => console.log("Image 3 loaded successfully!")}
            onError={(e) => console.error("Image 3 failed to load:", e)}
          />
        </div>
        
        {/* Test image 4 */}
        <div className="relative border border-gray-700 flex flex-col">
          <div className="text-white text-xs mb-1 bg-black p-1">Absolute public path:</div>
          <img
            src={absolutePublicPath}
            alt={`Test 4`}
            className="w-full h-full object-contain"
            onLoad={() => console.log("Image 4 loaded successfully!")}
            onError={(e) => console.error("Image 4 failed to load:", e)}
          />
        </div>
        
        {/* Test image 5 */}
        <div className="relative border border-gray-700 flex flex-col">
          <div className="text-white text-xs mb-1 bg-black p-1">Simple path:</div>
          <img
            src={simplePath}
            alt={`Test 5`}
            className="w-full h-full object-contain"
            onLoad={() => console.log("Image 5 loaded successfully!")}
            onError={(e) => console.error("Image 5 failed to load:", e)}
          />
        </div>
        
        {/* Debug info */}
        <div className="border border-gray-700 p-2 overflow-auto">
          <div className="text-white text-xs">
            <p>Origin: {window.location.origin}</p>
            <p>Pathname: {window.location.pathname}</p>
            <p>Current URL: {window.location.href}</p>
            <p>Test image: {testImageNumber}.webp</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSequencePlayer;
