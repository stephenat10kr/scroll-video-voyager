
import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    RGBA: any;
  }
}

const ChladniBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    // Load the RGBA.js script
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://raw.githack.com/strangerintheq/rgba/0.0.1/src/rgba.js";
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };
    
    const setupChladni = async () => {
      try {
        if (!window.RGBA) {
          await loadScript();
        }
        
        const container = containerRef.current;
        
        if (!container || typeof window.RGBA !== 'function') {
          console.error("Container not found or RGBA not loaded");
          return;
        }
        
        const rgba = new window.RGBA(`void main(void) {
          const float PI = 3.14159265;
          vec2 p = (2.0 * gl_FragCoord.xy - resolution.xy) / resolution.y;

          vec4 s1 = vec4(1.0, 1.0, 1.0, 2.0);
          vec4 s2 = vec4(-4.0, 4.0, 4.0, 4.6);

          float tx = sin(time)*0.1; 
          float ty = cos(time)*0.1; 

          float a = mix(s1.x, s2.x, xy.x + tx);
          float b = mix(s1.y, s2.y, xy.x + tx);
          float n = mix(s1.z, s2.z, xy.y + ty);
          float m = mix(s1.w, s2.w, xy.y + ty);

          float amp = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                      b * sin(PI * m * p.x) * sin(PI * n * p.y);
          float col = 1.0 - smoothstep(abs(amp), 0.0, 0.1);
          gl_FragColor = vec4(vec3(col), 1.0);
        }`, {uniforms: {xy: '2f'}});
        
        // Find the canvas that RGBA creates and move it into our container
        const canvas = document.querySelector('canvas');
        if (canvas && container) {
          container.appendChild(canvas);
          Object.assign(canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            pointerEvents: 'none',
          });
        }
        
        // Animation frame for scroll updates
        let animationFrameId: number;
        
        // Update shader uniform based on scroll position
        const updateScrollXY = () => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const yNorm = scrollHeight > 0 ? scrollY / scrollHeight : 0;
          
          rgba.xy([0.5, yNorm]); // Keep X fixed, Y changes with scroll
          animationFrameId = requestAnimationFrame(updateScrollXY);
        };
        
        updateScrollXY();
        
        // Store cleanup function
        cleanupRef.current = () => {
          cancelAnimationFrame(animationFrameId);
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        };
      } catch (error) {
        console.error("Error setting up Chladni pattern:", error);
      }
    };
    
    setupChladni();
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
  
  return (
    <div 
      ref={wrapperRef}
      className="chladni-wrapper"
      style={{ position: "relative", overflow: "visible" }}
    >
      <div 
        ref={containerRef}
        className="chladni-bg"
        style={{ position: "absolute", inset: 0, zIndex: -1 }}
      ></div>
      
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default ChladniBackground;
