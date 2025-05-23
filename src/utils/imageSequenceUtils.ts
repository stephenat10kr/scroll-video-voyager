
/**
 * Utility functions for working with image sequences
 */

/**
 * Load a single image from the image sequence
 */
export const loadSingleImage = (index: number): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const paddedIndex = index.toString().padStart(3, '0');
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = (error) => {
      // Still resolve but with the error
      console.error(`Failed to load image at index ${index}:`, error);
      reject(error);
    };
    
    img.src = `/image-sequence/LS_HeroSequence${paddedIndex}.jpg`;
    img.crossOrigin = "anonymous";
  });
};

/**
 * Draw an image to a canvas, maintaining aspect ratio and covering the canvas
 */
export const drawImageToCanvas = (
  img: HTMLImageElement, 
  canvas: HTMLCanvasElement
): void => {
  const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
  if (!ctx) return;
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Calculate dimensions to cover the viewport height while maintaining aspect ratio
  const imgRatio = img.width / img.height;
  const canvasRatio = canvas.width / canvas.height;
  
  let renderWidth, renderHeight, offsetX, offsetY;
  
  // Make sure the image always covers the viewport height
  renderHeight = canvas.height;
  renderWidth = renderHeight * imgRatio;
  
  // Center horizontally if wider than canvas
  offsetX = (canvas.width - renderWidth) / 2;
  offsetY = 0;
  
  // If the calculated width is less than canvas width, stretch to cover width too
  if (renderWidth < canvas.width) {
    renderWidth = canvas.width;
    renderHeight = renderWidth / imgRatio;
    offsetX = 0;
    offsetY = (canvas.height - renderHeight) / 2;
  }
  
  // Draw the image - use integer values for better performance
  ctx.drawImage(
    img, 
    Math.floor(offsetX), 
    Math.floor(offsetY), 
    Math.floor(renderWidth), 
    Math.floor(renderHeight)
  );
};

/**
 * Update the canvas size to match the window dimensions
 */
export const updateCanvasSize = (canvas: HTMLCanvasElement): void => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
