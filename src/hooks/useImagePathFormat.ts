
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// More formats for mobile including some without leading slash
const IMAGE_PATH_FORMATS = [
  // Standard formats
  (frame: number) => `/Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `/Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  
  // Mobile-optimized formats (no leading slash)
  (frame: number) => `Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  
  // Alternative formats
  (frame: number) => `./Image%20Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `./Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `/Image-Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `Image-Sequence/${String(frame).padStart(4, '0')}.webp`,
  
  // Additional fallbacks for mobile browsers
  (frame: number) => `assets/Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => `../Image Sequence/${String(frame).padStart(4, '0')}.webp`,
  (frame: number) => window.location.origin + `/Image Sequence/${String(frame).padStart(4, '0')}.webp`,
];

export const DEFAULT_FORMAT = IMAGE_PATH_FORMATS[0];

export const useImagePathFormat = () => {
  const [workingPathFormat, setWorkingPathFormat] = useState<(frame: number) => string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Reset path format when mobile status changes
  useEffect(() => {
    console.log("Mobile detection changed:", isMobile);
    if (workingPathFormat === null) {
      setWorkingPathFormat(() => DEFAULT_FORMAT);
    }
  }, [isMobile, workingPathFormat]);

  const findWorkingPathFormat = (callback?: () => void) => {
    if (isSearching) {
      console.log("Already searching for a working path format");
      return;
    }
    
    setIsSearching(true);
    let foundWorkingFormat = false;
    let formatIndex = 0;
    
    // On mobile, we'll try formats without leading slash first
    const reorderedFormats = [...IMAGE_PATH_FORMATS];
    if (isMobile) {
      // Move mobile-optimized formats to the beginning of the array
      const mobileFormats = reorderedFormats.splice(2, 2);
      reorderedFormats.unshift(...mobileFormats);
    }
    
    const testNextFormat = () => {
      console.log(`Testing path format ${formatIndex + 1}/${reorderedFormats.length}, mobile: ${isMobile}`);
      
      if (formatIndex >= reorderedFormats.length) {
        setIsSearching(false);
        if (!foundWorkingFormat) {
          console.error("All image path formats failed");
          toast({
            title: "Image Loading Error",
            description: "Failed to load image sequence. Please try refreshing the page.",
            variant: "destructive",
          });
        }
        return;
      }
      
      const format = reorderedFormats[formatIndex];
      const path = format(1);
      console.log(`Testing path: ${path}`);
      
      const testImage = new Image();
      testImage.onload = () => {
        console.log(`Format ${formatIndex + 1} worked: ${path}`);
        foundWorkingFormat = true;
        setWorkingPathFormat(() => format);
        setIsSearching(false);
        
        toast({
          title: "Images Loaded",
          description: "Image sequence is ready for scrolling",
        });
        
        if (callback) callback();
        
        // Preload a few frames in advance
        const framesToPreload = isMobile ? 3 : 5; // Load fewer on mobile
        for (let i = 2; i <= framesToPreload; i++) {
          const img = new Image();
          img.src = format(i);
        }
      };
      
      testImage.onerror = () => {
        console.warn(`Format ${formatIndex + 1} failed: ${path}`);
        formatIndex++;
        // Add a slight delay to prevent overwhelming the browser
        setTimeout(testNextFormat, 100);
      };
      
      // Set a timeout to prevent getting stuck
      setTimeout(() => {
        testImage.src = path;
      }, isMobile ? 200 : 0); // Slight delay for mobile
    };
    
    testNextFormat();
  };

  return {
    workingPathFormat,
    findWorkingPathFormat,
    setWorkingPathFormat,
    isSearching
  };
};
