
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
  
  // Preload the first few frames to ensure faster initial loading
  const [preloadedFrames, setPreloadedFrames] = useState<string[]>([]);
  const totalFrames = 437; // Total number of frames in the sequence

  // Preload important frames for smoother experience
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const framesToPreload = [1, 50, 100, 150, 200, 250, 300, 350, 400];
        const preloaded: string[] = [];
        
        for (const frame of framesToPreload) {
          const frameNumber = String(frame).padStart(4, '0');
          const imageSrc = `/Image Sequence/${frameNumber}.webp`;
          
          try {
            // Check if image exists
            const response = await fetch(imageSrc, { method: 'HEAD' });
            if (response.ok) {
              // Preload image
              const img = new Image();
              img.src = imageSrc;
              preloaded.push(imageSrc);
            } else {
              console.error(`Frame ${frameNumber} not found`, response.status);
            }
          } catch (error) {
            console.error(`Error preloading frame ${frameNumber}:`, error);
          }
        }
        
        if (preloaded.length === 0) {
          console.error("No frames could be preloaded, setting image error state");
          setImageError(true);
          toast({
            title: "Image loading issue",
            description: "Could not load image sequence. Using fallback.",
            variant: "destructive"
          });
        } else {
          setPreloadedFrames(preloaded);
        }
      } catch (error) {
        console.error("Error in preload function:", error);
        setImageError(true);
      }
    };
    
    preloadImages();
  }, [toast]);

  useEffect(() => {
    console.log("ImageSequencePlayer mounted");
    
    const container = containerRef.current;
    if (!container) {
      console.error("Container ref is null");
      return;
    }

    try {
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
      
      // Use a try-catch block for ScrollTrigger creation
      try {
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
      } catch (scrollError) {
        console.error("Error creating ScrollTrigger:", scrollError);
        setImageError(true);
        toast({
          title: "Scroll initialization failed",
          description: "Using static fallback image",
          variant: "destructive"
        });
      }
      
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
    } catch (error) {
      console.error("Error in ImageSequencePlayer setup:", error);
      setImageError(true);
      toast({
        title: "Error setting up image player",
        description: "Using static fallback image",
        variant: "destructive"
      });
    }
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, onTextIndexChange, onAfterVideoChange, toast]);

  // Format frame number with padding
  const frameNumber = String(currentFrame).padStart(4, '0');
  const imageSrc = `/Image Sequence/${frameNumber}.webp`;

  // Handle missing image fallback
  const handleImageError = () => {
    console.error(`Failed to load image: ${imageSrc}`);
    setImageError(true);
    toast({
      title: "Image loading error",
      description: "Could not load image sequence frames",
      variant: "destructive"
    });
  };

  return (
    <>
      {imageError ? (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black text-white z-10">
          <div className="text-center p-6">
            <img 
              src={FALLBACK_IMAGES[0]} 
              alt="Fallback placeholder" 
              className="mx-auto max-w-full max-h-60vh mb-4" 
            />
            <p className="text-lg font-semibold mb-2">Image sequence failed to load</p>
            <p className="text-sm opacity-70 mt-2">Please check your connection and try again</p>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={`Sequence frame ${frameNumber}`}
          className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black"
          style={{ minHeight: '100vh' }}
          onError={handleImageError}
        />
      )}
    </>
  );
};

export default ImageSequencePlayer;
