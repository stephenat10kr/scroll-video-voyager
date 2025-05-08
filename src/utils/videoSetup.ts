
/**
 * Configure a video element with optimal settings for scroll-based playback
 */
export const setupVideoElement = (video: HTMLVideoElement, isMobile: boolean): void => {
  // Basic video settings
  video.controls = false;
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";
  
  // Explicitly pause the video during initialization
  video.pause();
  console.log("Video paused during initialization");

  // Mobile-specific optimizations
  if (isMobile) {
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  }

  // Chrome-specific optimizations still apply
  video.style.willChange = "contents";
  if (navigator.userAgent.indexOf("Chrome") > -1) {
    video.style.transform = "translate3d(0,0,0)";
  }
  
  // Request high priority loading for the video
  if ('fetchPriority' in HTMLImageElement.prototype) {
    // @ts-ignore - TypeScript doesn't know about fetchPriority yet
    video.fetchPriority = 'high';
  }
};
