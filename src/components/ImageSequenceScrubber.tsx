
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Spinner from "./Spinner";
import { getFallbackImageUrl } from "@/hooks/useContentfulImageSequence";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceScrubberProps {
  // Support both old and new approaches
  baseUrl?: string;
  imageUrls?: string[];
  startFrame?: number;
  endFrame?: number;
  filePrefix?: string;
  fileExtension?: string;
  onReady?: () => void;
}

const ImageSequenceScrubber: React.FC<ImageSequenceScrubberProps> = ({
  baseUrl,
  imageUrls = [],
  startFrame = 0,
  endFrame = 236,
  filePrefix = "LS_HeroSequence",
  fileExtension = "jpg",
  onReady
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyCalledRef = useRef(false);
  
  // Determine if we're using direct image URLs or the old approach
  const usingDirectUrls = imageUrls && imageUrls.length > 0;
  console.log(`Using direct URLs: ${usingDirectUrls}, URL count: ${imageUrls.length}`);
  
  const totalFrames = usingDirectUrls ? imageUrls.length : (endFrame - startFrame + 1);
  console.log(`Total frames to load: ${totalFrames}`);
  
  // Fallback to a single image if no images are provided
  const useFallback = totalFrames <= 0;
  console.log(`Using fallback: ${useFallback}`);

  // Preload all images in the sequence
  useEffect(() => {
    console.log("Starting image sequence loading process");
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    // Use a single fallback image if no images are provided
    if (useFallback) {
      console.log("No images provided, using fallback image");
      const img = new Image();
      const fallbackUrl = getFallbackImageUrl();
      
      img.onload = () => {
        setLoadProgress(100);
        setLoadedImages([img]);
        setIsLoading(false);
        
        console.log("Using fallback image:", fallbackUrl);
        
        if (canvasRef.current) {
          drawImageOnCanvas(img);
        }
        
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback with fallback image");
          onReady();
          readyCalledRef.current = true;
        }
      };
      
      img.onerror = (err) => {
        console.error("Failed to load fallback image:", err);
        
        if (onReady && !readyCalledRef.current) {
          onReady();
          readyCalledRef.current = true;
        }
      };
      
      console.log("Loading fallback image:", fallbackUrl);
      img.src = fallbackUrl;
      return;
    }

    // Function to load a single image
    const loadImage = (index: number) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        
        let imgSrc: string;
        
        if (usingDirectUrls) {
          imgSrc = imageUrls[index];
        } else {
          const frameNum = index + startFrame;
          imgSrc = `${baseUrl}/${filePrefix}${String(frameNum).padStart(3, '0')}.${fileExtension}`;
        }
        
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / totalFrames) * 100));
          resolve(img);
        };
        
        img.onerror = (err) => {
          console.error(`Failed to load image at index ${index}:`, imgSrc, err);
          reject(err);
        };
        
        img.src = imgSrc;
        images[index] = img;
      });
    };

    console.log(`Starting to load ${totalFrames} image frames using ${usingDirectUrls ? 'direct URLs' : 'constructed URLs'}`);
    
    const loadAllImages = async () => {
      try {
        const imagePromises = [];
        
        for (let i = 0; i < totalFrames; i++) {
          imagePromises.push(loadImage(i));
        }
        
        // Use Promise.allSettled to continue even if some images fail
        const results = await Promise.allSettled(imagePromises);
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        
        console.log(`Successfully loaded ${successCount} of ${totalFrames} image frames`);
        
        if (successCount === 0) {
          // If no images loaded successfully, use fallback
          console.log("No images loaded successfully, using fallback");
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setLoadedImages([fallbackImg]);
            setIsLoading(false);
            if (canvasRef.current) {
              drawImageOnCanvas(fallbackImg);
            }
            if (onReady && !readyCalledRef.current) {
              onReady();
              readyCalledRef.current = true;
            }
          };
          fallbackImg.src = getFallbackImageUrl();
          return;
        }
        
        setLoadedImages(images.filter(img => img && img.complete));
        setIsLoading(false);
        
        // Draw the first frame on canvas
        if (canvasRef.current && images[0]) {
          drawImageOnCanvas(images[0]);
        }
        
        // Notify parent that image sequence is ready
        if (onReady && !readyCalledRef.current) {
          onReady();
          readyCalledRef.current = true;
        }
        
      } catch (error) {
        console.error("Error loading image sequence:", error);
        
        // Use fallback on error
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setLoadedImages([fallbackImg]);
          setIsLoading(false);
          if (canvasRef.current) {
            drawImageOnCanvas(fallbackImg);
          }
          if (onReady && !readyCalledRef.current) {
            onReady();
            readyCalledRef.current = true;
          }
        };
        fallbackImg.src = getFallbackImageUrl();
        
        // Still call ready callback even on error to prevent getting stuck
        if (onReady && !readyCalledRef.current) {
          onReady();
          readyCalledRef.current = true;
        }
      }
    };

    loadAllImages();

    // Cleanup function
    return () => {
      setLoadedImages([]);
    };
  }, [baseUrl, startFrame, endFrame, filePrefix, fileExtension, totalFrames, onReady, usingDirectUrls, imageUrls, useFallback]);

  // Draw the current image on canvas
  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref is null, cannot draw image");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get 2D context from canvas");
      return;
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate dimensions to cover the canvas (like object-fit: cover)
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      drawHeight = canvasHeight;
      drawWidth = img.width * (canvasHeight / img.height);
      offsetX = (canvasWidth - drawWidth) / 2;
    } else {
      // Image is taller than canvas
      drawWidth = canvasWidth;
      drawHeight = img.height * (canvasWidth / img.width);
      offsetY = (canvasHeight - drawHeight) / 2;
    }
    
    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Set up scroll trigger for image sequence
  useEffect(() => {
    if (isLoading || !containerRef.current || loadedImages.length === 0) {
      console.log("Not setting up scroll trigger yet: loading=", isLoading, "container=", !!containerRef.current, "images=", loadedImages.length);
      return;
    }
    
    console.log("Setting up scroll trigger with", loadedImages.length, "images");
    const container = containerRef.current;
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom+=600% bottom", // Extended scrolling length (same as video)
        scrub: 0.5, // Low value for more responsive scrubbing on Android
        markers: false,
      },
      onUpdate: function() {
        // Calculate the current frame based on progress
        const progress = this.progress();
        const frameIndex = Math.min(
          Math.floor(progress * (loadedImages.length - 1)),
          loadedImages.length - 1
        );
        
        if (frameIndex !== currentFrame) {
          setCurrentFrame(frameIndex);
          
          // Draw the current frame on canvas
          if (loadedImages[frameIndex]) {
            drawImageOnCanvas(loadedImages[frameIndex]);
          }
        }
      }
    });
    
    timeline.to({}, { duration: 1 });
    console.log("Scroll trigger setup complete");
    
    // Resize the canvas when the window resizes
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        console.log("Resizing canvas to match container dimensions");
        // Set canvas dimensions to match container
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        
        // Redraw current image at new size
        if (loadedImages[currentFrame]) {
          drawImageOnCanvas(loadedImages[currentFrame]);
        }
      }
    };
    
    // Initial sizing
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
    };
  }, [isLoading, loadedImages, currentFrame]);

  // Initialize canvas size when component mounts
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      console.log("Canvas or container ref is null during initialization");
      return;
    }
    
    console.log("Initializing canvas dimensions");
    // Set initial canvas dimensions
    canvasRef.current.width = containerRef.current.clientWidth;
    canvasRef.current.height = containerRef.current.clientHeight;
  }, []);

  // Add a fallback timer to ensure we always trigger onReady
  useEffect(() => {
    console.log("Setting up fallback timer for onReady callback");
    const fallbackTimer = setTimeout(() => {
      if (onReady && !readyCalledRef.current) {
        console.log("Fallback: calling onReady callback after timeout for image sequence");
        onReady();
        readyCalledRef.current = true;
      }
    }, 5000); // 5 second fallback
    
    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [onReady]);

  return (
    <div ref={containerRef} className="image-sequence-container w-full h-screen bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <Spinner />
            <div className="mt-4 text-roseWhite">
              Loading frames: {loadProgress}%
            </div>
          </div>
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          backgroundColor: 'black',
          display: isLoading ? 'none' : 'block'
        }}
      />
    </div>
  );
};

export default ImageSequenceScrubber;
