import React, { useEffect, useRef } from 'react';

interface ChladniPatternProps {
  children?: React.ReactNode;
}

const ExportableChladniPattern: React.FC<ChladniPatternProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollYRef = useRef<number>(0);
  
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    if (!container || !canvas) {
      console.error('Container or canvas not found');
      return;
    }
    
    // Initialize WebGL
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    
    console.log('WebGL initialized successfully');
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      console.log(`Canvas resized to ${width} x ${height}`);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
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
        vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / u_resolution.y;

        // Using the user-specified vector values
        vec4 s1 = vec4(4.0, 4.0, 1.0, 4.0);
        vec4 s2 = vec4(-3.0, 2.0, 4.0, 2.6);

        // Reduce scroll effect by lowering the amplification factor
        float scrollFactor = u_xy.y; // Linear response instead of squared
        
        // Create less dramatic time variation
        float tx = sin(u_time * 0.2) * 0.1; 
        float ty = cos(u_time * 0.3) * 0.1;

        // Reduce parameter variation based on scroll
        float a = mix(s1.x, s2.x, clamp(u_xy.x + tx + scrollFactor * 0.5, 0.0, 1.0));
        float b = mix(s1.y, s2.y, clamp(u_xy.x + tx + scrollFactor * 0.4, 0.0, 1.0));
        float n = mix(s1.z, s2.z, clamp(u_xy.y + ty + scrollFactor * 0.6, 0.0, 1.0));
        float m = mix(s1.w, s2.w, clamp(u_xy.y + ty + scrollFactor * 0.5, 0.0, 1.0));

        // Create a secondary pattern with different parameters that becomes more visible with scrolling
        float amp1 = a * sin(PI * n * p.x) * sin(PI * m * p.y) +
                     b * sin(PI * m * p.x) * sin(PI * n * p.y);
        
        float amp2 = b * sin(PI * (n+1.0) * p.y) * sin(PI * (m-0.5) * p.x) + 
                     a * sin(PI * (m+1.0) * p.y) * sin(PI * (n-0.5) * p.x);
        
        // Blend between patterns based on scroll position with reduced effect
        float amp = mix(amp1, amp2, scrollFactor * 0.5);
                
        // Create defined pattern edges with milder threshold
        float threshold = 0.05 + 0.03 * sin(scrollFactor * PI);
        float col = 1.0 - smoothstep(abs(amp), 0.0, threshold);
        
        // Keep the pattern monochromatic white
        gl_FragColor = vec4(vec3(col), 1.0);
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
      return;
    }
    
    // Create program
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
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
    
    // Get attribute/uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const xyUniformLocation = gl.getUniformLocation(program, 'u_xy');
    
    // Animation
    let startTime = Date.now();
    let frameId: number;
    
    // Track wheel scrolling separately from window.scrollY
    const handleWheel = (e: WheelEvent) => {
      // Accumulate wheel delta regardless of scrolljacking
      scrollYRef.current += e.deltaY * 0.001;
      
      // Keep the value between 0 and 1 for shader use
      scrollYRef.current = Math.max(0, Math.min(1, scrollYRef.current));
    };
    
    // Add wheel event listener (passive so it doesn't interfere with scrolljacking)
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    // Function to update scroll-based XY values with both window.scrollY and wheel events
    const updateScrollXY = () => {
      // Get normal scroll position (will be constrained by scrolljacking)
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Simple linear scroll normalization
      let windowYNorm = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      
      // Combine window scroll position with wheel scroll
      // This ensures pattern moves even when scrolljacking prevents normal scrolling
      let combinedYNorm = Math.max(0, Math.min(1, windowYNorm + scrollYRef.current));
      
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      
      // Clear and set viewport
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Use the program
      gl.useProgram(program);
      
      // Set uniforms
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, elapsedTime);
      gl.uniform2f(xyUniformLocation, 0.5, combinedYNorm);
      
      // Set up attributes
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      frameId = requestAnimationFrame(updateScrollXY);
    };
    
    // Start rendering
    console.log('Starting render loop with scroll-based morphing');
    updateScrollXY();
    
    return () => {
      console.log('Cleaning up WebGL resources');
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(frameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-screen bg-black"
      style={{ position: 'relative' }}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          position: 'fixed',
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

export default ExportableChladniPattern;
