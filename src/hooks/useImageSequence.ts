
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
  const imagesRef = useRef<HTMLImageElement[]>(new Array(totalFrames));
  
  // Load all images
  useEffect(() => {
    if (!totalFrames) return;
    
    const loadAllImages = async () => {
      let loadedCount = 0;
      const loadingPromises: Promise<void>[] = [];
      
      // Start loading all images at once
      for (let i = 0; i < totalFrames; i++) {
        const loadPromise = loadSingleImage(i)
          .then(img => {
            imagesRef.current[i] = img;
            loadedCount++;
            setLoadProgress((loadedCount / totalFrames) * 100);
          })
          .catch(() => {
            // Continue even if image fails to load
            loadedCount++;
            setLoadProgress((loadedCount / totalFrames) * 100);
          });
          
        loadingPromises.push(loadPromise);
      }
      
      // Wait for all images to load
      await Promise.all(loadingPromises);
      
      // Mark loading as complete
      setIsLoading(false);
      if (onReady) onReady();
    };
    
    loadAllImages();
  }, [totalFrames, onReady]);
  
  // Draw the current frame to a canvas
  const drawFrame = (frameIndex: number, canvas: HTMLCanvasElement) => {
    if (frameIndex >= 0 && frameIndex < totalFrames && imagesRef.current[frameIndex]) {
      drawImageToCanvas(imagesRef.current[frameIndex], canvas);
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
