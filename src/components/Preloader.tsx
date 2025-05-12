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
  const isMobile = useIsMobile();

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
      
      // Set canvas size to 300x400 (changed from 200x200)
      canvas.width = 300;
      canvas.height = 400;
      
      // Initialize WebGL
      const gl = canvas.getContext('webgl');
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

          // Create time variation
          float tx = sin(u_time * 0.2) * 0.1; 
          float ty = cos(u_time * 0.3) * 0.1;

          // Parameters for the pattern
          float a = mix(s1.x, s2.x, clamp(0.5 + tx, 0.0, 1.0));
          float b = mix(s1.y, s2.y, clamp(0.5 + tx, 0.0, 1.0));
          float n = mix(s1.z, s2.z, clamp(0.5 + ty, 0.0, 1.0));
          float m = mix(s1.w, s2.w, clamp(0.5 + ty, 0.0, 1.0));

          // Create the pattern
          float amp1 = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                      b * sin(PI * m * p.x) * sin(PI * n * p.y);
          
          // Create defined pattern edges
          float threshold = u_isMobile ? 0.12 : 0.05;
          float col = 1.0 - smoothstep(abs(amp1), 0.0, threshold);
          
          // Set 50% opacity (0.5) while keeping white color (1.0, 1.0, 1.0)
          gl_FragColor = vec4(1.0, 1.0, 1.0, col * 0.5);
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
        
        // Clear and set viewport
        gl.clearColor(0.125, 0.204, 0.208, 1.0); // #203435 converted to RGB values
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Use the program
        gl.useProgram(program);
        
        // Get attribute/uniform locations
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
        const isMobileUniformLocation = gl.getUniformLocation(program, 'u_isMobile');
        
        // Set uniforms
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        gl.uniform1f(timeUniformLocation, elapsedTime);
        gl.uniform1i(isMobileUniformLocation, isMobile ? 1 : 0);
        
        // Set up attributes
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // Request next frame
        frameIdRef.current = requestAnimationFrame(render);
      };
      
      // Start rendering
      render();
      return true;
    };

    const success = setupWebGL();
    
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
  }, [isMobile]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-darkGreen flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#203435" }}
    >
      <div className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Chladni Pattern in 300x400px rectangle (changed from 200x200px) */}
        <div className="w-[300px] h-[400px] relative mb-4">
          <canvas 
            ref={canvasRef}
            className="absolute inset-0"
            style={{ 
              width: '300px', 
              height: '400px',
              backgroundColor: '#203435'
            }}
          />
        </div>
        
        <p className="body-text text-coral">{loadingTexts[currentTextIndex]}</p>
        
        <div className="flex items-baseline gap-2">
          <span className="font-gt-super text-title-md-mobile md:text-title-md text-coral">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
