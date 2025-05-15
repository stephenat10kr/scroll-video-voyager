import React, { useEffect, useRef, useState, useCallback } from 'react';
import colors from '@/lib/theme';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChladniPatternProps {
  children?: React.ReactNode;
  scrollProgress?: number; // New prop to sync with scroll position
}

const ChladniPattern: React.FC<ChladniPatternProps> = ({ 
  children, 
  scrollProgress = 0 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();
  const isVisibleRef = useRef(true);
  
  // Keep track of last render time for consistent animations regardless of frame rate
  const lastTimeRef = useRef<number>(0);
  
  // Memoize resize canvas function to avoid recreating it on every render
  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = glRef.current;
    
    if (!container || !canvas) return;
    
    const { width, height } = container.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    
    if (canvas.width !== width * pixelRatio || canvas.height !== height * pixelRatio) {
      // Set canvas size with device pixel ratio for sharper rendering
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      
      // Update canvas display size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Update WebGL viewport
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);
  
  // Handle visibility changes to pause rendering when off-screen
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Setup WebGL and initialize the pattern
  const setupWebGL = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    if (!container || !canvas) {
      console.error('Container or canvas not found');
      return false;
    }
    
    // Initialize WebGL with optimized settings
    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false, // Better performance
      powerPreference: 'high-performance', // Request high performance GPU
      failIfMajorPerformanceCaveat: false // Try WebGL even on lower-end devices
    });
    
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
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_scroll;
      uniform bool u_isMobile;
      
      void main(void) {
        const float PI = 3.14159265;
        vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);

        // Scale factor adjustment based on device
        float scaleFactor = u_isMobile ? 2.0 : 1.5;
        p = p * scaleFactor;

        // Parameters for Chladni patterns
        vec4 s1 = vec4(4.0, 5.0, 2.0, 3.0);
        vec4 s2 = vec4(3.0, 2.0, 4.0, 2.0);

        // Use scroll progress directly for smoother transitions
        float scrollFactor = u_scroll;
        
        // Smoother time variation with reduced intensity
        float tx = sin(u_time * 0.1) * 0.05; 
        float ty = cos(u_time * 0.15) * 0.05;

        // Mix parameters based on scroll position
        float a = mix(s1.x, s2.x, clamp(scrollFactor, 0.0, 1.0));
        float b = mix(s1.y, s2.y, clamp(scrollFactor, 0.0, 1.0));
        float n = mix(s1.z, s2.z, clamp(scrollFactor, 0.0, 1.0));
        float m = mix(s1.w, s2.w, clamp(scrollFactor, 0.0, 1.0));

        // Chladni equation: sin(nπx)sin(mπy) + sin(mπx)sin(nπy)
        float amp = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                   b * sin(PI * m * p.x) * sin(PI * n * p.y);
                
        // Create defined pattern edges
        float threshold = u_isMobile ? 0.08 : 0.05;
        float pattern = 1.0 - smoothstep(abs(amp), 0.0, threshold);
        
        // Set color with adjusted opacity
        float opacity = u_isMobile ? 0.4 : 0.6;
        gl_FragColor = vec4(1.0, 1.0, 1.0, pattern * opacity);
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
    
    // Start rendering
    startRendering();
    return true;
  }, [isMobile, resizeCanvas]);
  
  // Animation function
  const renderFrame = useCallback((time: number = 0) => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    const program = programRef.current;
    
    // Don't render if not visible, initialized, or missing elements
    if (!isVisibleRef.current || !gl || !program || !canvas) {
      frameIdRef.current = requestAnimationFrame(renderFrame);
      return;
    }
    
    // Calculate time delta (in seconds) for smooth animation regardless of frame rate
    const currentTime = time * 0.001; // Convert to seconds
    const deltaTime = Math.min(0.05, currentTime - lastTimeRef.current); // Cap at 50ms to avoid large jumps
    lastTimeRef.current = currentTime;
    
    // Clear canvas
    gl.clearColor(0.125, 0.204, 0.208, 0.0); // Transparent background
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use the program
    gl.useProgram(program);
    
    // Get attribute/uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const scrollUniformLocation = gl.getUniformLocation(program, 'u_scroll');
    const isMobileUniformLocation = gl.getUniformLocation(program, 'u_isMobile');
    
    // Set uniforms
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform1f(timeUniformLocation, currentTime);
    gl.uniform1f(scrollUniformLocation, scrollProgress);
    gl.uniform1i(isMobileUniformLocation, isMobile ? 1 : 0);
    
    // Set up attributes
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Request next frame
    frameIdRef.current = requestAnimationFrame(renderFrame);
  }, [scrollProgress, isMobile]);
  
  // Start the rendering loop
  const startRendering = useCallback(() => {
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
    }
    lastTimeRef.current = performance.now() * 0.001;
    frameIdRef.current = requestAnimationFrame(renderFrame);
  }, [renderFrame]);
  
  // Initialize WebGL when component mounts
  useEffect(() => {
    // Initial setup with a slight delay to ensure DOM is ready
    const initialSetupTimeout = setTimeout(() => {
      const success = setupWebGL();
      if (success) {
        setIsInitialized(true);
      }
    }, 50);
    
    // Setup resize observer for responsive canvas
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
    }
    
    // Listen for window resize events
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup function
    return () => {
      clearTimeout(initialSetupTimeout);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      window.removeEventListener('resize', resizeCanvas);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
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
  }, [isMobile, resizeCanvas, setupWebGL]);
  
  // Debug when scroll progress changes
  useEffect(() => {
    // Re-render with new scroll progress without restarting animation loop
    if (isInitialized && glRef.current && programRef.current) {
      // Just let the existing animation loop handle the update
    }
  }, [scrollProgress, isInitialized]);
  
  return (
    <div 
      ref={containerRef}
      className="chladni-container relative w-full h-full"
      style={{ backgroundColor: colors.darkGreen }}
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
          pointerEvents: 'none',
          willChange: 'transform',  // GPU acceleration hint
          backfaceVisibility: 'hidden' // Performance optimization
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ChladniPattern;
