
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useToast } from '@/hooks/use-toast';

gsap.registerPlugin(ScrollTrigger);

// Placeholder images for fallback if sequence fails
const FALLBACK_IMAGES = [
  '/placeholder.svg'
];

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
  const [currentFrame, setCurrentFrame] = useState(1);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.01;
  const { toast } = useToast();
  
  const totalFrames = 437; // Total number of frames in the sequence

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

    const updateFrame = (progress: number) => {
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      lastProgressRef.current = progress;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        const frame = Math.max(1, Math.min(Math.ceil(progress * totalFrames), totalFrames));
        setCurrentFrame(frame);

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
      });
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
        updateFrame(progress);
      }
    });

    setIsLoaded(true);
    console.log("ScrollTrigger created in ImageSequencePlayer");
      
    return () => {
      console.log("ImageSequencePlayer unmounting");
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, onTextIndexChange, onAfterVideoChange]);

  // Format frame number with padding
  const frameNumber = String(currentFrame).padStart(4, '0');
  
  // Use absolute URL path to ensure it works on all environments
  const imageSrc = `${window.location.origin}/Image%20Sequence/${frameNumber}.webp`;
  
  console.log("Current image path:", imageSrc);

  return (
    <img
      src={imageSrc}
      alt={`Sequence frame ${frameNumber}`}
      className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black"
      style={{ minHeight: '100vh' }}
    />
  );
};

export default ImageSequencePlayer;
