
import { RefObject } from "react";

export const setupVideoElement = (video: HTMLVideoElement, isMobile: boolean) => {
  // Optimize video element
  video.controls = false;
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";
  video.pause();

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
};

export const calculateSegmentLength = (segments: number) => {
  return 1 / (segments + 1);
};

export const determineTextIndex = (progress: number, segmentCount: number): number | null => {
  const segLen = calculateSegmentLength(segmentCount);
  let textIdx: number | null = null;
  
  for (let i = 0; i < segmentCount; ++i) {
    if (progress >= segLen * i && progress < segLen * (i + 1)) {
      textIdx = i;
      break;
    }
  }
  
  if (progress >= segLen * segmentCount) {
    textIdx = null;
  }
  
  return textIdx;
};

export const tryLoadLowerResVersion = (
  src: string | undefined, 
  video: HTMLVideoElement,
  isLoaded: boolean,
  onSuccess?: () => void
) => {
  if (!src) return;
  
  const lowResSrc = src.replace(/\.(mp4|mov|webm)$/, '-low.$1');
  if (lowResSrc && lowResSrc !== src) {
    fetch(lowResSrc, { method: 'HEAD' })
      .then(response => {
        if (response.ok && !isLoaded) {
          video.src = lowResSrc;
          video.addEventListener('canplaythrough', () => {
            // Once low-res is ready, switch to high-res in background
            if (src) {
              const highResVideo = new Image();
              highResVideo.src = src;
              highResVideo.onload = () => {
                if (!isLoaded) {
                  video.src = src;
                  if (onSuccess) onSuccess();
                }
              };
            }
          }, { once: true });
        }
      })
      .catch(() => {
        // Low-res version not available
      });
  }
};

export const assignVideoSource = async (
  video: HTMLVideoElement,
  origSrc: string | undefined,
  isMobile: boolean
): Promise<boolean> => {
  if (!origSrc) {
    console.log("[ScrollVideo] No src provided.");
    return false;
  }
  
  // Figure out the possible alternatives based on the src extension
  let srcAssigned = false;
  const webmSrc =
    origSrc.match(/\.(mp4|mov)$/i) !== null
      ? origSrc.replace(/\.(mp4|mov)$/i, ".webm")
      : origSrc.match(/\.webm$/i)
      ? origSrc
      : undefined;

  function logSource(type: string, url: string) {
    console.log(`[ScrollVideo] Assigned ${type} video source: ${url}`);
  }
  
  // For mobile, prefer MP4 format
  if (isMobile) {
    if (video.src !== origSrc) {
      video.src = origSrc;
      const extension = origSrc.split(".").pop() || "unknown";
      logSource(`Mobile ${extension.toUpperCase()}`, origSrc);
    }
    return true;
  }
  
  // For desktop, prefer WebM if supported
  if (webmSrc && video.canPlayType("video/webm")) {
    // Test if the file exists (HEAD request)
    try {
      const resp = await fetch(webmSrc, { method: "HEAD" });
      if (resp.ok) {
        if (video.src !== webmSrc) {
          video.src = webmSrc;
          logSource("WebM", webmSrc);
        }
        return true;
      }
    } catch {
      // not available, fallback
    }
  }
  
  // Fallback to the originally provided source
  if (!srcAssigned) {
    if (video.src !== origSrc) {
      video.src = origSrc;
      const extension = origSrc.split(".").pop() || "unknown";
      logSource(extension.toUpperCase(), origSrc);
    }
    return true;
  }
  
  return false;
};

export const requestHighPriorityLoading = (video: HTMLVideoElement) => {
  if ('fetchPriority' in HTMLImageElement.prototype) {
    // @ts-ignore - TypeScript doesn't know about fetchPriority yet
    video.fetchPriority = 'high';
  }
};

export const setupContainerHeight = (
  container: HTMLDivElement, 
  SCROLL_EXTRA_PX: number, 
  AFTER_VIDEO_EXTRA_HEIGHT: number
) => {
  container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
};
