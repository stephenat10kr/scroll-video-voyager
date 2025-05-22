
import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Spinner from "./Spinner";
import { getFallbackImageUrl } from "@/hooks/useContentfulImageSequence";
import { toast } from "@/components/ui/use-toast";

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
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyCalledRef = useRef(false);
  const initialLoadAttempt = useRef(false);
  
  // Determine if we're using direct image URLs or the old approach
  const usingDirectUrls = imageUrls && imageUrls.length > 0;
  console.log(`Using direct URLs: ${usingDirectUrls}, URL count: ${imageUrls.length}`);
  
  const totalFrames = usingDirectUrls ? imageUrls.length : (endFrame - startFrame + 1);
  console.log(`Total frames to load: ${totalFrames}`);
  
  // Fallback to a single image if no images are provided
  const useFallback = totalFrames <= 0 || loadError;
  console.log(`Using fallback: ${useFallback}`);

  // Preload all images in the sequence
  useEffect(() => {
    console.log("Starting image sequence loading process");
    
    // Early exit for fallback mode
    if (useFallback) {
      handleFallbackImage();
      return;
    }
    
    // Set a timeout to ensure we don't wait forever for images to load
    const loadTimeout = setTimeout(() => {
      if (isLoading && !initialLoadAttempt.current) {
        console.error("Image loading timed out after 10 seconds");
        setLoadError(true);
        handleFallbackImage();
      }
    }, 10000); // 10 second timeout
    
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let errorCount = 0;
    initialLoadAttempt.current = true;
    
    // Function to load a single image
    const loadImage = (index: number) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        
        let imgSrc: string;
        
        if (usingDirectUrls) {
          if (!imageUrls[index]) {
            console.error(`Image URL at index ${index} is undefined`);
            reject(new Error(`Image URL at index ${index} is undefined`));
            return;
          }
          imgSrc = imageUrls[index];
        } else {
          const frameNum = index + startFrame;
          imgSrc = `${baseUrl}/${filePrefix}${String(frameNum).padStart(3, '0')}.${fileExtension}`;
        }
        
        // Debug the URL we're trying to load
        console.log(`Trying to load image ${index + 1}/${totalFrames}: ${imgSrc.substring(0, 100)}...`);
        
        img.onload = () => {
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / totalFrames) * 100));
          resolve(img);
        };
        
        img.onerror = (err) => {
          errorCount++;
          console.error(`Failed to load image at index ${index}:`, imgSrc, err);
          
          // If more than 25% of images fail to load, use fallback
          if (errorCount > totalFrames * 0.25) {
            console.error(`Too many image load failures (${errorCount}/${index+1} attempted). Using fallback.`);
            setLoadError(true);
          }
          
          reject(err);
        };
        
        img.crossOrigin = "anonymous"; // For CORS issues
        img.src = imgSrc;
        images[index] = img;
      });
    };

    console.log(`Starting to load ${totalFrames} image frames using ${usingDirectUrls ? 'direct URLs' : 'constructed URLs'}`);
    
    const loadAllImages = async () => {
      try {
        const imagePromises = [];
        
        for (let i = 0; i < totalFrames; i++) {
          imagePromises.push(loadImage(i).catch(err => {
            console.warn(`Image ${i} failed to load:`, err);
            return null; // Return null for failed images
          }));
        }
        
        const results = await Promise.allSettled(imagePromises);
        const successCount = results.filter(result => 
          result.status === 'fulfilled' && result.value !== null
        ).length;
        
        console.log(`Successfully loaded ${successCount} of ${totalFrames} image frames`);
        
        if (successCount === 0) {
          // If no images loaded successfully, use fallback
          console.error("No images loaded successfully, using fallback");
          setLoadError(true);
          handleFallbackImage();
          return;
        } else if (successCount < totalFrames * 0.5) {
          // If less than 50% of images loaded successfully, show warning toast
          console.warn(`Only ${successCount} of ${totalFrames} images loaded successfully`);
          toast({
            title: "Limited Image Quality",
            description: `Only ${successCount} of ${totalFrames} frames loaded. Sequence may appear choppy.`,
            variant: "warning",
          });
        }
        
        // Filter out failed images (nulls) and set the loaded images
        const validImages = images.filter(img => img && img.complete);
        setLoadedImages(validImages);
        setIsLoading(false);
        
        // Draw the first frame on canvas
        if (canvasRef.current && validImages[0]) {
          drawImageOnCanvas(validImages[0]);
        }
        
        // Notify parent that image sequence is ready
        if (onReady && !readyCalledRef.current) {
          onReady();
          readyCalledRef.current = true;
        }
        
      } catch (error) {
        console.error("Error loading image sequence:", error);
        setLoadError(true);
        handleFallbackImage();
      }
    };

    loadAllImages();

    return () => {
      clearTimeout(loadTimeout);
      setLoadedImages([]);
    };
  }, [baseUrl, startFrame, endFrame, filePrefix, fileExtension, totalFrames, onReady, usingDirectUrls, imageUrls, useFallback]);

  const handleFallbackImage = () => {
    console.log("Using fallback image");
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
    fallbackImg.onerror = () => {
      console.error("Even fallback image failed to load!");
      // Try a different fallback from Unsplash
      const backupFallback = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1470";
      fallbackImg.src = backupFallback;
    };
    fallbackImg.src = getFallbackImageUrl();
    
    // Notify user about fallback
    toast({
      title: "Using Fallback Image",
      description: "Could not load all image frames. Using a static image instead.",
      variant: "destructive",
    });
  };

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
