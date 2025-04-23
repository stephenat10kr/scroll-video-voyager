
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const IMAGE_PATH_FORMATS = [
  (frame: number) => `/Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `/Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `./Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `./Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `/Image-Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `Image Sequence/${String(frame).padStart(4, '0')}.webp`
];

export const DEFAULT_FORMAT = IMAGE_PATH_FORMATS[0];

export const useImagePathFormat = () => {
  const [workingPathFormat, setWorkingPathFormat] = useState<(frame: number) => string>(() => DEFAULT_FORMAT);
  const { toast } = useToast();

  const findWorkingPathFormat = (callback?: () => void) => {
    let foundWorkingFormat = false;
    let formatIndex = 0;
    
    const testNextFormat = () => {
      if (formatIndex >= IMAGE_PATH_FORMATS.length) {
        if (!foundWorkingFormat) {
          toast({
            title: "Image Loading Error",
            description: "Failed to load image sequence. Please try refreshing the page.",
            variant: "destructive",
          });
        }
        return;
      }
      
      const format = IMAGE_PATH_FORMATS[formatIndex];
      const path = format(1);
      
      const testImage = new Image();
      testImage.onload = () => {
        foundWorkingFormat = true;
        setWorkingPathFormat(() => format);
        
        toast({
          title: "Images Loaded",
          description: "Image sequence is ready for scrolling",
        });
        
        if (callback) callback();
        
        for (let i = 2; i <= 5; i++) {
          const img = new Image();
          img.src = format(i);
        }
      };
      
      testImage.onerror = () => {
        formatIndex++;
        testNextFormat();
      };
      
      testImage.src = path;
    };
    
    testNextFormat();
  };

  return {
    workingPathFormat,
    findWorkingPathFormat,
    setWorkingPathFormat
  };
};
