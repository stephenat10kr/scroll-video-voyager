import { useState, useEffect } from 'react';

interface UsePreloaderOptions {
  onVideoReady: boolean;
  maxLoadTime?: number;
}

interface PreloaderState {
  loading: boolean;
  loadProgress: number;
  showVideo: boolean;
}

export const usePreloader = ({ 
  onVideoReady, 
  maxLoadTime = 8000 
}: UsePreloaderOptions): [
  PreloaderState, 
  () => void
] => {
  const [state, setState] = useState<PreloaderState>({
    loading: true,
    loadProgress: 0,
    showVideo: false
  });

  // Force complete preloader after maximum time
  useEffect(() => {
    const forceCompleteTimeout = setTimeout(() => {
      if (state.loadProgress < 100) {
        console.log("Force completing preloader after timeout");
        setState(prev => ({ ...prev, loadProgress: 100 }));
      }
    }, maxLoadTime);
    
    return () => clearTimeout(forceCompleteTimeout);
  }, [maxLoadTime, state.loadProgress]);
  
  // Simulate loading progress for testing - improved to reach 100% when video is ready
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    // Start with a small delay
    const startDelay = setTimeout(() => {
      progressInterval = setInterval(() => {
        setState(prev => {
          // If video is ready, jump directly to 100%
          if (onVideoReady) {
            clearInterval(progressInterval);
            return { ...prev, loadProgress: 100 };
          }
          
          // Otherwise continue normal progress, but cap at 95%
          const newProgress = prev.loadProgress + Math.random() * 5;
          return { ...prev, loadProgress: Math.min(95, newProgress) };
        });
      }, 200);
    }, 300);
    
    return () => {
      clearTimeout(startDelay);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [onVideoReady]);
  
  // When video is ready, immediately set progress to 100%
  useEffect(() => {
    if (onVideoReady) {
      console.log("Video is ready, immediately setting progress to 100%");
      setState(prev => ({ ...prev, loadProgress: 100 }));
    }
  }, [onVideoReady]);

  const handlePreloaderComplete = () => {
    console.log("Preloader complete, fading in video");
    setState(prev => ({ 
      ...prev, 
      loading: false,
      showVideo: true 
    }));
    document.body.style.overflow = 'auto'; // Ensure scrolling is enabled
  };

  return [state, handlePreloaderComplete];
};
