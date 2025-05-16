import React, { useEffect, useRef, useState } from 'react';
import colors from '@/lib/theme';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChladniPatternProps {
  children?: React.ReactNode;
}

const ChladniPattern: React.FC<ChladniPatternProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();
  
  // Setup WebGL and initialize the pattern
  const setupWebGL = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    if (!container || !canvas) {
      console.error('Container or canvas not found');
      return false;
    }
    
    // Initialize WebGL
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return false;
    }
    
    console.log('WebGL initialized successfully');
    glRef.current = gl;
    
    // Enable alpha blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Update canvas size
    resizeCanvas();
    
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
      
      void main(void) {
        const float PI = 3.14159265;
        // Scale factor - higher values = more zoomed out pattern
        float scale = 0.35; // Zoomed out significantly (was possibly around 1.0)
        vec2 p = scale * (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

        vec4 s1 = vec4(1.0, 1.0, 1.0, 2.0);
        vec4 s2 = vec4(-4.0, 4.0, 4.0, 4.6);

        float tx = sin(u_time)*0.1; 
        float ty = cos(u_time)*0.1; 

        float a = mix(s1.x, s2.x, u_xy.x+tx);
        float b = mix(s1.y, s2.y, u_xy.x+tx);
        float n = mix(s1.z, s2.z, u_xy.y+ty);
        float m = mix(s1.w, s2.w, u_xy.y+ty);

        float max_amp = abs(a) + abs(b);
        float amp = a * sin(PI*n*p.x) * sin(PI*m*p.y) + b * sin(PI*m*p.x) * sin(PI*n*p.y);
        float col = 1.0 - smoothstep(abs(amp), 0.0, 0.1);
        
        // Output white pattern on transparent background
        gl_FragColor = vec4(vec3(1.0), col * 0.7);
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
      -1.0,  1.0,
       1.0,  1.0
    ]);
    
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    // Animation
    let startTime = Date.now();
    
    // Function to update based on scroll position
    const updateScrollXY = () => {
      if (!gl || !program) return;
      
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Normalize scroll position to a value between 0 and 1
      let yNorm = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      
      // Clear and set viewport
      gl.clearColor(0, 0, 0, 0); // Transparent background
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Use the program
      gl.useProgram(program);
      
      // Get attribute/uniform locations
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
      const xyUniformLocation = gl.getUniformLocation(program, 'u_xy');
      
      // Set uniforms
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, elapsedTime);
      gl.uniform2f(xyUniformLocation, 0.5, yNorm); // Use scroll position for Y value
      
      // Set up attributes
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      frameIdRef.current = requestAnimationFrame(updateScrollXY);
    };
    
    // Start rendering
    console.log('Starting render loop with scroll-based pattern');
    updateScrollXY();
    return true;
  };
  
  // Resize canvas to match container dimensions
  const resizeCanvas = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = glRef.current;
    
    if (!container || !canvas) return;
    
    // Get the actual dimensions from the container
    const { width, height } = container.getBoundingClientRect();
    
    // Only update if dimensions actually changed
    if (canvas.width !== width || canvas.height !== height) {
      console.log(`Canvas resized to ${width} x ${height}`);
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Update WebGL viewport if available
      if (gl) {
        gl.viewport(0, 0, width, height);
      }
    }
  };
  
  useEffect(() => {
    // Initial setup with a slight delay to ensure DOM is ready
    const initialSetupTimeout = setTimeout(() => {
      const success = setupWebGL();
      if (success) {
        setIsInitialized(true);
      }
    }, 50);
    
    // Setup resize observer for responsive canvas
    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        resizeCanvas();
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
    }
    
    // Listen for window resize as well for good measure
    window.addEventListener('resize', resizeCanvas);
    
    // Also update on scroll to handle responsive changes
    window.addEventListener('scroll', resizeCanvas);
    
    // Cleanup function
    return () => {
      clearTimeout(initialSetupTimeout);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', resizeCanvas);
      
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
  
  // Force an additional resize after component mounts to catch any layout adjustments
  useEffect(() => {
    const forceResizeTimeout = setTimeout(() => {
      resizeCanvas();
    }, 300); // slightly longer delay to catch layout settling
    
    return () => clearTimeout(forceResizeTimeout);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ChladniPattern;
