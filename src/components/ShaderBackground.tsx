
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
    
    script.onload = () => {
      // Type assertion for the RGBA constructor added by the script
      const RGBA = (window as any).RGBA;
      
      if (!RGBA || !containerRef.current) return;
      
      const shaderContainer = document.createElement('div');
      shaderContainer.id = 'shader-container';
      Object.assign(shaderContainer.style, {
        position: 'absolute',
        inset: '0',
        zIndex: '-1',
      });
      
      containerRef.current.appendChild(shaderContainer);
      
      // Create RGBA instance
      const rgba = new RGBA(`void main(void) {
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
      
      // Style and move the canvas
      const canvas = document.querySelector('canvas');
      if (canvas && shaderContainer) {
        shaderContainer.appendChild(canvas);
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
      
      // Set up interactivity
      const handleMouseMove = (e: MouseEvent) => {
        rgba.xy([e.clientX / window.innerWidth, e.clientY / window.innerHeight]);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      
      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (containerRef.current && shaderContainer) {
          containerRef.current.removeChild(shaderContainer);
        }
      };
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative z-0"
      style={{ position: 'relative', zIndex: 0 }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ShaderBackground;
