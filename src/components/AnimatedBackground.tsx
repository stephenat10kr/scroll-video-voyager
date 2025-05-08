
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    RGBA: any;
  }
}

const AnimatedBackground: React.FC = () => {
  const rgbaInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Make sure RGBA.js is loaded
    if (typeof window.RGBA !== 'undefined') {
      // Create the RGBA instance with the shader
      const rgba = new window.RGBA(`void main(void) {
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

      // Store reference for cleanup
      rgbaInstanceRef.current = rgba;

      // Apply custom styling to the canvas
      const canvas = document.querySelector('canvas.rgba');
      if (canvas) {
        canvas.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none;');
      }

      // Add mouse move event listener
      const handleMouseMove = (e: MouseEvent) => {
        rgba.xy([e.x/window.innerWidth, e.y/window.innerHeight]);
      };
      
      window.addEventListener('mousemove', handleMouseMove);

      // Cleanup function
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (rgbaInstanceRef.current) {
          // If RGBA has a cleanup method, call it
          if (typeof rgbaInstanceRef.current.destroy === 'function') {
            rgbaInstanceRef.current.destroy();
          }
        }
      };
    } else {
      console.error('RGBA.js library not loaded');
    }
  }, []);

  // Return an empty div, as RGBA.js creates its own canvas element
  return null;
};

export default AnimatedBackground;
