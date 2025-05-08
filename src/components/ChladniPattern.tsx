
import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    RGBA: any;
  }
}

interface ChladniPatternProps {
  className?: string;
}

const ChladniPattern: React.FC<ChladniPatternProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    // Ensure RGBA is available (loaded from the script in index.html)
    const checkRGBA = () => {
      if (typeof window.RGBA !== "undefined") {
        initializeChladniPattern();
      } else {
        setTimeout(checkRGBA, 100);
      }
    };

    checkRGBA();

    return () => {
      // Cleanup if needed
      if (initialized.current && containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  const initializeChladniPattern = () => {
    if (initialized.current || !containerRef.current) return;

    try {
      console.log("Initializing Chladni Pattern");
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
      }`, { uniforms: { xy: '2f' } });

      // Add the canvas to the container
      if (containerRef.current) {
        containerRef.current.appendChild(rgba.canvas);
        
        // Make the canvas fill the container
        rgba.canvas.style.position = "absolute";
        rgba.canvas.style.top = "0";
        rgba.canvas.style.left = "0";
        rgba.canvas.style.width = "100%";
        rgba.canvas.style.height = "100%";
        rgba.canvas.style.pointerEvents = "none"; // Add this line to prevent canvas from capturing pointer events
        
        // Update the uniform when mouse moves - use a passive event listener
        const handleMouseMove = (e: MouseEvent) => {
          rgba.xy([e.clientX/window.innerWidth, e.clientY/window.innerHeight]);
        };
        
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        
        // Trigger animation even without mouse movement
        let time = 0;
        const animate = () => {
          time += 0.01;
          rgba.xy([0.5 + Math.sin(time) * 0.2, 0.5 + Math.cos(time) * 0.2]);
          requestAnimationFrame(animate);
        };
        animate();
        
        initialized.current = true;
      }
    } catch (error) {
      console.error("Error initializing Chladni Pattern:", error);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden opacity-50 pointer-events-none ${className || ""}`}
      style={{ zIndex: 0 }}
    ></div>
  );
};

export default ChladniPattern;
