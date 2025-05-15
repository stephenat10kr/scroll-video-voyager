
import React, { useEffect, useRef, useState } from 'react';
import colors from '@/lib/theme';
import { useIsMobile } from '@/hooks/use-mobile';

const FixedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();
  
  // Setup WebGL and initialize the pattern
  const setupWebGL = () => {
    const canvas = canvasRef.current;
    
    if (!canvas) {
      console.error('Canvas not found for FixedBackground');
      return false;
    }
    
    try {
      // Set canvas size to match window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize WebGL with error handling
      const gl = canvas.getContext('webgl', { 
        preserveDrawingBuffer: true, 
        antialias: true,
        alpha: true,
        depth: true,
        stencil: false,
        failIfMajorPerformanceCaveat: false,
      });
      
      if (!gl) {
        console.error('WebGL not supported in FixedBackground');
        return false;
      }
      
      console.log('FixedBackground: WebGL initialized successfully');
      glRef.current = gl;
      
      // Enable alpha blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.DEPTH_TEST);
      
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

          // Scale factor for mobile
          float scaleFactor = u_isMobile ? 3.5 : 2.0; 
          p = p * scaleFactor;

          // Using fixed vector values
          vec4 s1 = vec4(4.0, 4.0, 1.0, 4.0);
          vec4 s2 = vec4(-3.0, 2.0, 4.0, 2.6);

          // Create time variation with reduced effect
          float tx = sin(u_time * 0.1) * 0.1; 
          float ty = cos(u_time * 0.15) * 0.1;

          // Parameters for the pattern
          float a = mix(s1.x, s2.x, clamp(u_xy.x + tx, 0.0, 1.0));
          float b = mix(s1.y, s2.y, clamp(u_xy.x + tx, 0.0, 1.0));
          float n = mix(s1.z, s2.z, clamp(u_xy.y + ty, 0.0, 1.0));
          float m = mix(s1.w, s2.w, clamp(u_xy.y + ty, 0.0, 1.0));

          float amp1 = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                     b * sin(PI * m * p.x) * sin(PI * n * p.y);
          
          float threshold = u_isMobile ? 0.12 : 0.05;
          float col = 1.0 - smoothstep(abs(amp1), 0.0, threshold);
          
          // Higher opacity for better visibility
          float opacity = u_isMobile ? 0.5 : 0.65; 
          gl_FragColor = vec4(1.0, 1.0, 1.0, col * opacity);
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
        console.error('Failed to create shaders for FixedBackground');
        return false;
      }
      
      // Create and link program
      const program = gl.createProgram();
      if (!program) {
        console.error('Failed to create program for FixedBackground');
        return false;
      }
      
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
        -1.0, 1.0,
        1.0, 1.0
      ]);
      
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      
      // Animation
      let startTime = Date.now();
      
      const updatePattern = () => {
        if (!gl || !program) {
          console.error('Missing GL context or program in animation loop');
          return;
        }
        
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
        
        // Get scroll position for pattern adjustment
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const yNorm = scrollHeight > 0 ? Math.min(scrollY / scrollHeight, 1.0) : 0;
        
        // Clear and set viewport
        gl.clearColor(0.125, 0.204, 0.208, 1.0); // #203435 converted to RGB values
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Use the program
        gl.useProgram(program);
        
        // Get attribute/uniform locations
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
        const xyUniformLocation = gl.getUniformLocation(program, 'u_xy');
        const isMobileUniformLocation = gl.getUniformLocation(program, 'u_isMobile');
        
        // Set uniforms
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
        gl.uniform1f(timeUniformLocation, elapsedTime);
        gl.uniform2f(xyUniformLocation, 0.5, yNorm); // Use x=0.5 (center) and y based on scroll
        gl.uniform1i(isMobileUniformLocation, isMobile ? 1 : 0);
        
        // Set up attributes
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // Continue animation loop
        frameIdRef.current = requestAnimationFrame(updatePattern);
      };

      // Start the animation loop
      updatePattern();
      return true;
    } catch (error) {
      console.error('Error setting up WebGL in FixedBackground:', error);
      return false;
    }
  };
  
  // Resize canvas to match window dimensions
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    
    if (!canvas) return;
    
    // Match canvas size to window
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (canvas.width !== width || canvas.height !== height) {
      console.log(`FixedBackground canvas resized to ${width} x ${height}`);
      
      canvas.width = width;
      canvas.height = height;
      
      if (gl) {
        gl.viewport(0, 0, width, height);
      }
    }
  };
  
  // Initialize WebGL setup
  useEffect(() => {
    console.log('FixedBackground: Initializing');
    const initialSetupTimeout = setTimeout(() => {
      const success = setupWebGL();
      if (success) {
        setIsInitialized(true);
        console.log('FixedBackground: Setup successful');
      } else {
        console.error('FixedBackground: Setup failed');
      }
    }, 100);
    
    // Setup resize handler
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup function
    return () => {
      console.log('FixedBackground: Cleaning up');
      clearTimeout(initialSetupTimeout);
      window.removeEventListener('resize', resizeCanvas);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
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
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        height: '100vh',
        width: '100%',
        backgroundColor: colors.darkGreen,
        overflow: 'hidden'
      }}
    >
      <canvas 
        ref={canvasRef}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          willChange: 'transform', // Performance optimization
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />
    </div>
  );
};

export default FixedBackground;
