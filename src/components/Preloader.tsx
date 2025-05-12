
import React, { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PreloaderProps {
  progress: number;
  onComplete: () => void;
}

const loadingTexts = [
  "Curating your experience.",
  "Gathering sounds.",
  "Bottling lightning.",
  "Loading possibilities."
];

const Preloader: React.FC<PreloaderProps> = ({ progress, onComplete }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const isMobile = useIsMobile();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Change text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle completion - fade out when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setVisible(false);
        const fadeOutTimeout = setTimeout(() => {
          onComplete();
        }, 500); // Allow time for fade out animation
        return () => clearTimeout(fadeOutTimeout);
      }, 1000); // Wait a moment at 100% before fading
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  // Setup WebGL for Chladni Pattern
  useEffect(() => {
    const setupWebGL = () => {
      const canvas = canvasRef.current;
      
      if (!canvas) {
        console.error('Canvas not found');
        return false;
      }
      
      // Set canvas to match window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize WebGL
      const gl = canvas.getContext('webgl', { 
        premultipliedAlpha: false, // Try to fix transparency issues
        preserveDrawingBuffer: true // Prevent clearing the buffer prematurely
      });
      
      if (!gl) {
        console.error('WebGL not supported');
        return false;
      }
      
      console.log('WebGL initialized for preloader');
      glRef.current = gl;
      
      // Enable alpha blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Create shader program
      const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0, 1);
        }
      `;
      
      const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform bool u_isMobile;
        
        void main(void) {
          const float PI = 3.14159265;
          vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

          // Scale factor for mobile - increased from 2.0 to 3.5
          float scaleFactor = u_isMobile ? 3.5 : 1.0;
          p = p * scaleFactor; // Scale the coordinates to make the pattern larger (effectively makes it appear smaller)

          // Using fixed vector values for the preloader
          vec4 s1 = vec4(4.0, 4.0, 1.0, 4.0);
          vec4 s2 = vec4(-3.0, 2.0, 4.0, 2.6);

          // Use mouse position to influence the pattern
          float mx = u_mouse.x;
          float my = u_mouse.y; 
          
          // Create time variation
          float tx = sin(u_time * 0.2) * 0.1; 
          float ty = cos(u_time * 0.3) * 0.1;

          // Parameters for the pattern - influenced by mouse
          float a = mix(s1.x, s2.x, clamp(mx + tx, 0.0, 1.0));
          float b = mix(s1.y, s2.y, clamp(mx + tx, 0.0, 1.0));
          float n = mix(s1.z, s2.z, clamp(my + ty, 0.0, 1.0));
          float m = mix(s1.w, s2.w, clamp(my + ty, 0.0, 1.0));

          // Create the pattern
          float amp1 = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                      b * sin(PI * m * p.x) * sin(PI * n * p.y);
          
          // Create defined pattern edges
          float threshold = u_isMobile ? 0.08 : 0.05;
          float col = 1.0 - smoothstep(abs(amp1), 0.0, threshold);
          
          // Set opacity (0.7 for more visibility, especially on mobile)
          gl_FragColor = vec4(1.0, 1.0, 1.0, col * 0.7);
        }
      `;
      
      // Compile shaders
      const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        
        return shader;
      };
      
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      if (!vertexShader || !fragmentShader) {
        console.error('Failed to create shaders');
        return false;
      }
      
      // Create program
      const program = gl.createProgram();
      if (!program) return false;
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return false;
      }
      
      // Set up buffers
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
      const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0
      ]);
      
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      
      // Animation
      let startTime = Date.now();
      
      const render = () => {
        if (!gl || !program) return;
        
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
        
        // Clear and set viewport with a specific background color
        gl.clearColor(0.125, 0.204, 0.208, 1.0); // #203435 converted to RGB values
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Use the program
        gl.useProgram(program);
        
        // Get attribute/uniform locations
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
        const mouseUniformLocation = gl.getUniformLocation(program, 'u_mouse');
        const isMobileUniformLocation = gl.getUniformLocation(program, 'u_isMobile');
        
        // Set uniforms
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        gl.uniform1f(timeUniformLocation, elapsedTime);
        gl.uniform2f(mouseUniformLocation, mousePosition.x, mousePosition.y);
        gl.uniform1i(isMobileUniformLocation, isMobile ? 1 : 0);
        
        // Set up attributes
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // Request next frame - continue animation even on mobile
        frameIdRef.current = requestAnimationFrame(render);
      };
      
      // Start rendering
      render();
      return true;
    };

    // Initialize WebGL immediately
    const success = setupWebGL();
    console.log("WebGL setup success:", success);
    
    // Cleanup function
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Clean up WebGL resources
      const gl = glRef.current;
      if (gl) {
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    };
  }, [isMobile, mousePosition]); // Added mousePosition and isMobile as dependencies

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && glRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        glRef.current.viewport(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For touch devices, set a default mouse position or track touch position
  useEffect(() => {
    if (isMobile) {
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches && e.touches[0]) {
          setMousePosition({
            x: e.touches[0].clientX / window.innerWidth,
            y: e.touches[0].clientY / window.innerHeight
          });
        }
      };
      
      // Set initial touch position to center
      setMousePosition({ x: 0.5, y: 0.5 });
      
      window.addEventListener('touchmove', handleTouchMove);
      return () => window.removeEventListener('touchmove', handleTouchMove);
    }
  }, [isMobile]);

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#203435" }}
    >
      {/* Fullscreen canvas with important styling to ensure it stays visible */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: '#203435',
          position: 'fixed', // Ensure it stays fixed
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block', // Prevent layout issues
          zIndex: 0
        }}
      />
      
      {/* Loading text container positioned at the bottom center */}
      <div className="absolute bottom-12 px-4 text-center w-full z-10">
        {/* Loading text and percentage side by side */}
        <div className="flex items-center justify-center gap-4 w-full">
          <p className="body-text text-coral">{loadingTexts[currentTextIndex]}</p>
          <span 
            className="font-gt-super text-coral" 
            style={{ fontSize: "32px" }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
