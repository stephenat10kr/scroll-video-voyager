
export const optimizeVideoElement = (
  video: HTMLVideoElement,
  isMobile: boolean,
  isAndroid: boolean,
  isFirefox: boolean
) => {
  video.controls = false;
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";
  video.pause();

  if (isMobile) {
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.style.transform = "translate3d(0,0,0)";
    video.style.willChange = "contents";
    video.muted = true;
    
    if (video.readyState >= 1) {
      video.currentTime = 0.001;
    }
    
    if (isAndroid) {
      video.style.transform = "translate3d(0,0,0) translateZ(0)";
      video.style.backfaceVisibility = "hidden";
      video.style.perspective = "1000px";
      video.style.maxWidth = "100%";
      video.style.maxHeight = "100%";
      // @ts-ignore
      video.style.webkitTransform = "translate3d(0,0,0)";
      video.style.willChange = "transform, opacity";
      
      if (video.readyState >= 1) {
        setTimeout(() => {
          video.currentTime = 0.001;
        }, 50);
      }
    }
  } else {
    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translate3d(0,0,0)";
    }
    
    if (isFirefox) {
      video.style.transform = "translateZ(0)";
      video.style.backfaceVisibility = "hidden";
    }
  }

  // Request high priority loading
  if ('fetchPriority' in HTMLImageElement.prototype) {
    // @ts-ignore
    video.fetchPriority = 'high';
  }
};

export const getScrubValue = (isFirefox: boolean, isMobile: boolean, isAndroid: boolean): number => {
  if (isAndroid) {
    return 1.8;
  }
  if (isFirefox) {
    return 2.5;
  }
  if (isMobile) {
    return 1.0;
  }
  return 0.8;
};

export const detectBrowser = () => {
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  return { isFirefox };
};
