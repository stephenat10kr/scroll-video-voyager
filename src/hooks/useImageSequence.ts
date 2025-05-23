import { useState, useRef, useEffect } from 'react';
import { loadSingleImage, drawImageToCanvas } from '../utils/imageSequenceUtils';

interface UseImageSequenceProps {
  totalFrames: number;
  onReady?: () => void;
}

interface UseImageSequenceReturn {
  isLoading: boolean;
  loadProgress: number;
  currentFrame: number;
  setCurrentFrame: React.Dispatch<React.SetStateAction<number>>;
  imagesRef: React.MutableRefObject<HTMLImageElement[]>;
  drawFrame: (frameIndex: number, canvas: HTMLCanvasElement) => void;
}

export const useImageSequence = ({ 
  totalFrames,
  onReady
}: UseImageSequenceProps): UseImageSequenceReturn => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadingImagesRef = useRef<Set<number>>(new Set()); // Track which images are currently loading
  
  // Optimized image loading - load images progressively as needed, with priority frames first
  useEffect(() => {
    if (!totalFrames) return;
    
    const loadAllImages = async () => {
      const loadedCount = useRef(0);
      
      // Load images in chunks with priority given to essential frames first
      // This ensures a smooth user experience while loading progresses
      
      // First, load key frames (first, last, and some evenly distributed ones)
      const keyFrames = [0, totalFrames - 1]; // First and last frame
      
      // Add some evenly distributed frames throughout the sequence
      const step = Math.floor(totalFrames / 5);
      for (let i = step; i < totalFrames - 1; i += step) {
        keyFrames.push(i);
      }
      
      // Function to load a specific frame
      const loadFrame = async (index: number) => {
        // Skip if already loaded or loading
        if (imagesRef.current[index] || loadingImagesRef.current.has(index)) {
          return;
        }
        
        loadingImagesRef.current.add(index);
        
        try {
          const img = await loadSingleImage(index);
          imagesRef.current[index] = img;
          loadedCount.current++;
          setLoadProgress((loadedCount.current / totalFrames) * 100);
        } catch (err) {
          console.warn(`Error loading frame ${index}`, err);
        } finally {
          loadingImagesRef.current.delete(index);
        }
      };
      
      // Start with key frames
      await Promise.all(keyFrames.map(loadFrame));
      
      // Then load the rest with lower priority
      const remainingFrames = Array.from({ length: totalFrames }, (_, i) => i)
        .filter(i => !keyFrames.includes(i));
      
      // Load in smaller chunks to not overwhelm the browser
      const chunkSize = 10;
      for (let i = 0; i < remainingFrames.length; i += chunkSize) {
        const chunk = remainingFrames.slice(i, i + chunkSize);
        await Promise.all(chunk.map(loadFrame));
        
        // Allow some breathing room between chunks
        if (i + chunkSize < remainingFrames.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Mark loading as complete
      setIsLoading(false);
      if (onReady) onReady();
    };
    
    loadAllImages();
    
    return () => {
      // Clean up any pending image loads
      loadingImagesRef.current.clear();
    };
  }, [totalFrames, onReady]);
  
  // Draw the current frame to a canvas - with fallbacks if a frame isn't loaded yet
  const drawFrame = (frameIndex: number, canvas: HTMLCanvasElement) => {
    if (frameIndex >= 0 && frameIndex < totalFrames) {
      // If we have the exact frame, use it
      if (imagesRef.current[frameIndex]) {
        drawImageToCanvas(imagesRef.current[frameIndex], canvas);
      } 
      // Otherwise, find the closest loaded frame
      else {
        // Look for the nearest loaded frame
        let nearestFrame = null;
        let minDistance = totalFrames;
        
        // Check all loaded frames to find the closest one
        for (let i = 0; i < imagesRef.current.length; i++) {
          if (imagesRef.current[i]) {
            const distance = Math.abs(i - frameIndex);
            if (distance < minDistance) {
              nearestFrame = i;
              minDistance = distance;
            }
          }
        }
        
        // Use the nearest frame if found, otherwise try frame 0
        if (nearestFrame !== null) {
          drawImageToCanvas(imagesRef.current[nearestFrame], canvas);
          
          // Also trigger loading of the requested frame if it's not already loading
          if (!loadingImagesRef.current.has(frameIndex)) {
            loadSingleImage(frameIndex).then(img => {
              imagesRef.current[frameIndex] = img;
            }).catch(console.error);
          }
        } else if (imagesRef.current[0]) {
          // Fallback to the first frame if available
          drawImageToCanvas(imagesRef.current[0], canvas);
        }
      }
    }
  };

  return {
    isLoading,
    loadProgress,
    currentFrame,
    setCurrentFrame,
    imagesRef,
    drawFrame
  };
};
