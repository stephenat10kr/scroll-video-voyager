
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

  // Just testing with frame 1 for now
  const testFrame = "0001";
  
  useEffect(() => {
    console.log("ImageSequencePlayer mounted");
    
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

  // Test loading a single image with different URL formats to see which works
  // Adding query param to avoid caching
  const cacheParam = `?t=${Date.now()}`;
  
  // Log what we're attempting to load for debugging
  console.log(`Attempting to load test image: ${testFrame}.webp`);
  
  // Try absolute URL without encoding spaces
  const imageUrl = `${window.location.origin}/Image Sequence/${testFrame}.webp${cacheParam}`;
  console.log("Image URL:", imageUrl);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black flex flex-col items-center justify-center">
      {/* Display the test image */}
      <img
        src={imageUrl}
        alt={`Test frame ${testFrame}`}
        className="w-full h-full object-cover pointer-events-none"
        style={{ minHeight: '100vh' }}
        onLoad={() => console.log("Image loaded successfully!")}
        onError={(e) => console.error("Image failed to load:", e)}
      />
      
      {/* Also try with encoded URL */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-4 text-white text-sm rounded">
        {`Testing image: ${testFrame}.webp`}
      </div>
    </div>
  );
};

export default ImageSequencePlayer;
