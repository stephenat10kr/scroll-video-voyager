
import { useState, useEffect } from 'react';
import { useIsAndroid } from './use-android';

export function useImageSequence() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const isAndroid = useIsAndroid();

  useEffect(() => {
    if (!isAndroid) return;
    
    const loadImageSequence = async () => {
      try {
        setIsLoading(true);
        
        // Define the pattern for our image sequence files
        const imagePattern = /LS_HeroSequence(\d+)\.jpg$/;
        
        // Create an array to hold the image paths
        const imagePaths: string[] = [];
        
        // We'll use a fetch to the directory to check which images exist
        // For now, we'll build the paths based on the known pattern
        for (let i = 0; i <= 236; i++) {
          const paddedIndex = i.toString().padStart(3, '0');
          const path = `/image-sequence/LS_HeroSequence${paddedIndex}.jpg`;
          imagePaths.push(path);
        }
        
        console.log(`Found ${imagePaths.length} images in sequence`);
        setTotalImages(imagePaths.length);
        
        // Pre-load images to ensure smooth playback
        const imagePromises = imagePaths.map((path) => {
          return new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImagesCount(prev => prev + 1);
              resolve(path);
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${path}`);
              reject(new Error(`Failed to load image: ${path}`));
            };
            img.src = path;
          });
        });
        
        // Wait for all images to load
        const loadedPaths = await Promise.all(imagePromises).catch(error => {
          console.error('Error loading image sequence:', error);
          return [];
        });
        
        setImages(loadedPaths);
        setIsLoading(false);
        console.log('Image sequence loaded successfully');
      } catch (error) {
        console.error('Error in image sequence loading:', error);
        setIsLoading(false);
      }
    };
    
    if (isAndroid) {
      loadImageSequence();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [isAndroid]);
  
  return {
    images,
    isLoading,
    loadProgress: totalImages > 0 ? (loadedImagesCount / totalImages) * 100 : 0,
    totalImages,
    loadedImagesCount
  };
}
