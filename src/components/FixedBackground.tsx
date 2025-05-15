import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const FixedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const isMobile = useIsMobile();

  // Setup WebGL and initialize the pattern
  useEffect(() => {
    // Define helper function to prevent context loss
    const preventContextLossHandler = (e: Event) => {
      e.preventDefault();
    };

    const setupWebGL = () => {
      const canvas = canvasRef.current;
      
      if (!canvas) {
        console.error('Canvas not found');
        return false;
      }
      
      // Set canvas dimensions to match viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize WebGL with optimizations
      const gl = canvas.getContext('webgl', { 
        preserveDrawingBuffer: true, 
        antialias: true,
        alpha: true,
        depth: true,
        failIfMajorPerformanceCaveat: false,
      });
      
      if (!gl) {
        console.error('WebGL not supported');
        return false;
      }
      
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
        uniform vec2 u_xy;
        uniform bool u_isMobile;
        
        void main(void) {
          const float PI = 3.14159265;
          vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

          // Scale factor for mobile - increased from 2.0 to 3.5
          float scaleFactor = u_isMobile ? 3.5 : 2.0;
          p = p * scaleFactor;

          // Using the user-specified vector values
          vec4 s1 = vec4(4.0, 4.0, 1.0, 4.0);
          vec4 s2 = vec4(-3.0, 2.0, 4.0, 2.6);

          // Reduce scroll effect by lowering the amplification factor
          float scrollFactor = u_xy.y;
          
          // Create less dramatic time variation
          float tx = sin(u_time * 0.2) * 0.1; 
          float ty = cos(u_time * 0.3) * 0.1;

          // Reduce parameter variation based on scroll
          float a = mix(s1.x, s2.x, clamp(u_xy.x + tx + scrollFactor * 0.5, 0.0, 1.0));
          float b = mix(s1.y, s2.y, clamp(u_xy.x + tx + scrollFactor * 0.4, 0.0, 1.0));
          float n = mix(s1.z, s2.z, clamp(u_xy.y + ty + scrollFactor * 0.6, 0.0, 1.0));
          float m = mix(s1.w, s2.w, clamp(u_xy.y + ty + scrollFactor * 0.5, 0.0, 1.0));

          // Create a secondary pattern with different parameters 
          float amp1 = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                       b * sin(PI * m * p.x) * sin(PI * n * p.y);
          
          float amp2 = b * sin(PI * (n+1.0) * p.y) * sin(PI * (m-0.5) * p.x) + 
                       a * sin(PI * (m+1.0) * p.y) * sin(PI * (n-0.5) * p.x);
          
          // Blend between patterns based on scroll position with reduced effect
          float amp = mix(amp1, amp2, scrollFactor * 0.5);
                  
          // Create defined pattern edges with milder threshold
          float threshold = u_isMobile ? 0.12 : 0.05;
          threshold += 0.03 * sin(scrollFactor * PI);
          float col = 1.0 - smoothstep(abs(amp), 0.0, threshold);
          
          // Set opacity while keeping white color
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
      
      programRef.current = program;
      
      // Set up buffers
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
      const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0
      ]);
      
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      return true;
    };

    // Handle window resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      const gl = glRef.current;
      
      if (canvas && gl) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };
    
    // Animation setup
    let startTime = Date.now();
    
    // Function to update based on scroll but for fixed position
    const updatePattern = () => {
      const gl = glRef.current;
      const program = programRef.current;
      
      if (!gl || !program) return;
      
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Simple linear scroll normalization
      let yNorm = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      
      // Clear and set viewport
      gl.clearColor(0.125, 0.204, 0.208, 0.0); // Transparent background
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Use the program
      gl.useProgram(program);
      
      // Get attribute/uniform locations
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
      const xyUniformLocation = gl.getUniformLocation(program, 'u_xy');
      const isMobileUniformLocation = gl.getUniformLocation(program, 'u_isMobile');
      
      // Set uniforms
      gl.uniform2f(resolutionUniformLocation, canvasRef.current!.width, canvasRef.current!.height);
      gl.uniform1f(timeUniformLocation, elapsedTime);
      gl.uniform2f(xyUniformLocation, 0.5, yNorm);
      gl.uniform1i(isMobileUniformLocation, isMobile ? 1 : 0);
      
      // Set up attributes
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      frameIdRef.current = requestAnimationFrame(updatePattern);
    };
    
    // Set up the initial WebGL context after a slight delay
    const initTimeout = setTimeout(() => {
      if (setupWebGL()) {
        // Start animation loop
        updatePattern();
      }
    }, 100);

    // Add event listeners
    window.addEventListener('resize', handleResize);

    // Add touch event listeners to prevent context loss on mobile
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', preventContextLossHandler, { passive: false });
      canvas.addEventListener('touchmove', preventContextLossHandler, { passive: false });
      canvas.addEventListener('touchend', preventContextLossHandler, { passive: false });
    }
    
    // Cleanup function
    return () => {
      clearTimeout(initTimeout);
      
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (canvas) {
        canvas.removeEventListener('touchstart', preventContextLossHandler);
        canvas.removeEventListener('touchmove', preventContextLossHandler);
        canvas.removeEventListener('touchend', preventContextLossHandler);
      }
      
      // Clean up WebGL resources
      const gl = glRef.current;
      if (gl) {
        if (programRef.current) {
          gl.deleteProgram(programRef.current);
        }
        
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    };
  }, [isMobile]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: '#203435', // Match the dark green color
          opacity: isMobile ? 0.3 : 0.5 // Better visibility adjustment based on device
        }}
      />
    </div>
  );
};

export default FixedBackground;
