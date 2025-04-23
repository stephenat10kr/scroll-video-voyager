
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
  children?: React.ReactNode;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
};

const ScrollVideoPlayer: React.FC<ScrollVideoPlayerProps> = ({
  src,
  segmentCount,
  onTextIndexChange,
  onAfterVideoChange,
  children,
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translateZ(0)";
    }

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    const setupScrollTrigger = () => {
      if (!video.duration) return;

      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress) || !video.duration) return;
          const SEGMENTS = segmentCount + 1;
          const segLen = 1 / SEGMENTS;
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
          onTextIndexChange(textIdx);
          video.currentTime = progress * video.duration;
          onAfterVideoChange(progress >= 1);
        }
      });
    };

    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", setupScrollTrigger);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, src]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
