
/**
 * Set up container resizing for scroll video
 */
export const setupContainerResize = (
  container: HTMLDivElement,
  SCROLL_EXTRA_PX: number,
  AFTER_VIDEO_EXTRA_HEIGHT: number
): (() => void) => {
  const resizeSection = () => {
    container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
  };
  
  resizeSection();
  window.addEventListener("resize", resizeSection);
  
  return () => window.removeEventListener("resize", resizeSection);
};
