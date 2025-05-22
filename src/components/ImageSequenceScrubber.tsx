
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spinner from './Spinner';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceScrubberProps {
  onReady?: () => void;
}

const ImageSequenceScrubber: React.FC<ImageSequenceScrubberProps> = ({ onReady }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedImages = useRef<boolean[]>([]);
  const [isReady, setIsReady] = useState(false);
  const readyCalledRef = useRef(false);
  
  // Generate image paths for the sequence
  useEffect(() => {
    const imageUrls: string[] = [];
    // Generate paths for images 0-236 (based on the files in the folder)
    for (let i = 0; i <= 236; i++) {
      const paddedIndex = i.toString().padStart(3, '0');
      imageUrls.push(`/image-sequence/LS_HeroSequence${paddedIndex}.jpg`);
    }
    setImages(imageUrls);
  }, []);
  
  // Initialize canvas and images
  useEffect(() => {
    if (isLoading && images.length > 0) {
      // Start loading images
      setIsLoading(true);
    }
    
    if (images.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up canvas to match viewport dimensions
    const updateCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Handle resize
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    // Preload all images
    imagesRef.current = [];
    loadedImages.current = new Array(images.length).fill(false);
    
    let loadedCount = 0;
    
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        loadedImages.current[index] = true;
        loadedCount++;
        
        // Update loading progress
        setLoadProgress((loadedCount / images.length) * 100);
        
        // Draw the first image once it's loaded
        if (index === 0) {
          drawImageToCanvas(img);
        }
        
        // Once all images are loaded, set ready state
        if (loadedCount === images.length) {
          console.log('All images loaded, sequence ready');
          setIsLoading(false);
          setIsReady(true);
          
          if (onReady && !readyCalledRef.current) {
            onReady();
            readyCalledRef.current = true;
          }
        }
      };
      
      img.src = src;
      imagesRef.current[index] = img;
    });
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [images, onReady]);
  
  // Draw the current image to canvas, maintaining aspect ratio and covering the viewport
  const drawImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions to cover the viewport height while maintaining aspect ratio
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    
    let renderWidth, renderHeight, offsetX, offsetY;
    
    // Make sure the image always covers the viewport height
    renderHeight = canvas.height;
    renderWidth = renderHeight * imgRatio;
    
    // Center horizontally if wider than canvas
    offsetX = (canvas.width - renderWidth) / 2;
    offsetY = 0;
    
    // If the calculated width is less than canvas width, stretch to cover width too
    if (renderWidth < canvas.width) {
      renderWidth = canvas.width;
      renderHeight = renderWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    }
    
    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  };
  
  // Set up scroll-based scrubbing
  useEffect(() => {
    if (!isReady || imagesRef.current.length === 0 || !containerRef.current) return;
    
    console.log('Setting up image sequence scrubbing');
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom+=600% bottom",
        scrub: 0.5, // Low value for responsive scrubbing
        markers: false,
        onUpdate: self => {
          // Calculate the image index based on scroll progress
          const imageIndex = Math.min(
            Math.floor(self.progress * (imagesRef.current.length - 1)),
            imagesRef.current.length - 1
          );
          
          if (imageIndex !== currentImageIndex) {
            setCurrentImageIndex(imageIndex);
            
            // Draw the new image
            if (imagesRef.current[imageIndex] && loadedImages.current[imageIndex]) {
              drawImageToCanvas(imagesRef.current[imageIndex]);
            }
          }
        }
      }
    });
    
    return () => {
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
    };
  }, [isReady, currentImageIndex]);

  return (
    <div 
      ref={containerRef} 
      className="video-container w-full h-screen bg-black"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <Spinner />
            <p className="text-white mt-4">Loading Image Sequence: {Math.round(loadProgress)}%</p>
          </div>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default ImageSequenceScrubber;
