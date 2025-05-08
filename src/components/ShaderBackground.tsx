
import React, { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run this effect on client-side
    if (typeof window === 'undefined') return;

    // Load the RGBA library dynamically
    const script = document.createElement('script');
    script.src = 'https://raw.githack.com/strangerintheq/rgba/0.0.1/src/rgba.js';
    script.async = true;
    
    let rgba: any = null;
    let cleanup: () => void = () => {};
    
    script.onload = () => {
      // Type assertion for the RGBA constructor added by the script
      const RGBA = (window as any).RGBA;
      
      if (!RGBA || !containerRef.current) return;
      
      const shaderContainer = document.createElement('div');
      shaderContainer.id = 'shader-container';
      Object.assign(shaderContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        overflow: 'hidden',
      });
      
      containerRef.current.appendChild(shaderContainer);
      
      // Create RGBA instance
      rgba = new RGBA(`void main(void) {
        const float PI = 3.14159265;
        vec2 p = (2.0 * gl_FragCoord.xy - resolution.xy) / resolution.y;

        vec4 s1 = vec4(1.0, 1.0, 1.0, 2.0);
        vec4 s2 = vec4(-4.0, 4.0, 4.0, 4.6);

        float tx = sin(time)*0.1; 
        float ty = cos(time)*0.1; 

        float a = mix(s1.x, s2.x, xy.x+tx);
        float b = mix(s1.y, s2.y, xy.x+tx);
        float n = mix(s1.z, s2.z, xy.y+ty);
        float m = mix(s1.w, s2.w, xy.y+ty);

        float max_amp = abs(a) + abs(b);
        float amp = a * sin(PI*n*p.x) * sin(PI*m*p.y) + b * sin(PI*m*p.x) * sin(PI*n*p.y);
        float col = 1.0 - smoothstep(abs(amp), 0.0, 0.1);
        gl_FragColor = vec4(vec3(col), 1.0);
      }`, {uniforms: {xy: '2f'}});
      
      // Find the canvas that RGBA creates
      const canvas = document.querySelector('canvas');
      if (canvas && shaderContainer) {
        // Ensure the canvas is appended to our container
        if (canvas.parentElement !== shaderContainer) {
          shaderContainer.appendChild(canvas);
        }
        
        // Style the canvas properly
        Object.assign(canvas.style, {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Critical to prevent scroll capture
        });
      }
      
      // Set up interactivity with proper bounds
      const handleMouseMove = (e: MouseEvent) => {
        if (rgba) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            // Only update if mouse is within the component's bounds
            if (e.clientX >= rect.left && 
                e.clientX <= rect.right && 
                e.clientY >= rect.top && 
                e.clientY <= rect.bottom) {
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              rgba.xy([x, y]);
            }
          }
        }
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      
      // Define cleanup function
      cleanup = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (containerRef.current && shaderContainer) {
          try {
            containerRef.current.removeChild(shaderContainer);
          } catch (e) {
            console.log("Error removing shader container", e);
          }
        }
      };
    };
    
    document.body.appendChild(script);
    
    // Return combined cleanup function
    return () => {
      cleanup();
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative"
      style={{ 
        position: 'relative',
        overflow: 'visible' // Explicitly allow content to overflow
      }}
    >
      {/* Children wrapped in a div that preserves normal document flow */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ShaderBackground;
