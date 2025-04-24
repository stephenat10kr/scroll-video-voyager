
export const useVideoSource = (
  originalSrc: string | undefined,
  isMobile: boolean,
  videoElement: HTMLVideoElement | null
) => {
  const getWebMSource = (src: string) => {
    return src.match(/\.(mp4|mov)$/i) !== null
      ? src.replace(/\.(mp4|mov)$/i, ".webm")
      : src.match(/\.webm$/i)
      ? src
      : undefined;
  };

  const assignSource = async () => {
    if (!originalSrc || !videoElement) {
      console.log("[ScrollVideo] No src provided or no video element.");
      return;
    }

    // For mobile, prefer MP4 format
    if (isMobile) {
      if (videoElement.src !== originalSrc) {
        videoElement.src = originalSrc;
        const extension = originalSrc.split(".").pop() || "unknown";
        console.log(`[ScrollVideo] Assigned Mobile ${extension.toUpperCase()}`, originalSrc);
      }
      return;
    }

    // For desktop, prefer WebM if supported
    const webmSrc = getWebMSource(originalSrc);
    if (webmSrc && videoElement.canPlayType("video/webm")) {
      try {
        const resp = await fetch(webmSrc, { method: "HEAD" });
        if (resp.ok) {
          if (videoElement.src !== webmSrc) {
            videoElement.src = webmSrc;
            console.log("[ScrollVideo] Assigned WebM", webmSrc);
          }
          return;
        }
      } catch {
        // WebM not available, fallback to original
      }
    }

    // Fallback to original source
    if (videoElement.src !== originalSrc) {
      videoElement.src = originalSrc;
      const extension = originalSrc.split(".").pop() || "unknown";
      console.log(`[ScrollVideo] Assigned ${extension.toUpperCase()}`, originalSrc);
    }
  };

  return { assignSource };
};
