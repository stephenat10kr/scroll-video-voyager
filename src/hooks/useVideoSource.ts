
import { RefObject, useEffect } from "react";

export const useVideoSource = (
  videoRef: RefObject<HTMLVideoElement>,
  src?: string,
  isMobile?: boolean
) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let srcAssigned = false;

    const origSrc = src;
    const webmSrc =
      origSrc.match(/\.(mp4|mov)$/i) !== null
        ? origSrc.replace(/\.(mp4|mov)$/i, ".webm")
        : origSrc.match(/\.webm$/i)
        ? origSrc
        : undefined;

    function logSource(type: string, url: string) {
      console.log(`[ScrollVideo] Assigned ${type} video source: ${url}`);
    }

    async function assignSource() {
      if (!origSrc) {
        console.log("[ScrollVideo] No src provided.");
        return;
      }
      
      if (isMobile) {
        if (video.src !== origSrc) {
          video.src = origSrc;
          const extension = origSrc.split(".").pop() || "unknown";
          logSource(`Mobile ${extension.toUpperCase()}`, origSrc);
        }
        srcAssigned = true;
        return;
      }
      
      if (webmSrc && video.canPlayType("video/webm")) {
        try {
          const resp = await fetch(webmSrc, { method: "HEAD" });
          if (resp.ok) {
            if (video.src !== webmSrc) {
              video.src = webmSrc;
              logSource("WebM", webmSrc);
            }
            srcAssigned = true;
            return;
          }
        } catch {
          // not available, fallback
        }
      }
      
      if (!srcAssigned) {
        if (video.src !== origSrc) {
          video.src = origSrc;
          const extension = origSrc.split(".").pop() || "unknown";
          logSource(extension.toUpperCase(), origSrc);
        }
      }
    }

    assignSource();
  }, [src, videoRef, isMobile]);
};
