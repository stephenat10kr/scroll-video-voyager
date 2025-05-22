
import { useState, useEffect } from 'react';

export const useImageSequence = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImageSequence = async () => {
      try {
        const imageUrls: string[] = [];
        // Generate image sequence paths (0-236 based on the available files)
        for (let i = 0; i <= 236; i++) {
          const paddedIndex = i.toString().padStart(3, '0');
          imageUrls.push(`/image-sequence/LS_HeroSequence${paddedIndex}.jpg`);
        }
        
        setImages(imageUrls);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading image sequence:', err);
        setError('Failed to load image sequence');
        setIsLoading(false);
      }
    };

    loadImageSequence();
  }, []);

  return { images, isLoading, loadProgress, error };
};
