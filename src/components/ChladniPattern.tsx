
import React, { useEffect, useRef } from 'react';
import { colors } from '../lib/theme';

interface ChladniPatternProps {
  children?: React.ReactNode;
}

const ChladniPattern: React.FC<ChladniPatternProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initialize WebGL
    const gl = canvas.getContext('webgl', { 
      premultipliedAlpha: true,
      alpha: true
    });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    
    // Set canvas size
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    
    gl.shaderSource(vertexShader, `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
      }
    `);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    
    gl.shaderSource(fragmentShader, `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_xy;
      
      void main(void) {
        const float PI = 3.14159265;
        vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;
        
        // More dramatic parameter ranges
        vec4 s1 = vec4(1.0, 1.0, 1.0, 2.0);
        vec4 s2 = vec4(-6.0, 6.0, 8.0, 8.0); // More dramatic range
        
        // Amplify scroll effect
        float scrollFactor = u_xy.y * 2.0; // Double the effect of scrolling
        
        // Add dynamic rotation based on scroll
        float angle = scrollFactor * PI * 0.5; // Rotate up to 90 degrees
        mat2 rotation = mat2(
          cos(angle), -sin(angle),
          sin(angle), cos(angle)
        );
        p = rotation * p;
        
        // More dynamic time factor
        float tx = sin(u_time * (0.1 + scrollFactor * 0.2)) * 0.2;
        float ty = cos(u_time * (0.1 + scrollFactor * 0.1)) * 0.2;
        
        // Enhanced parameter mixing (more dramatic)
        float a = mix(s1.x, s2.x, u_xy.x + tx + scrollFactor * 0.5);
        float b = mix(s1.y, s2.y, u_xy.x + tx - scrollFactor * 0.3);
        float n = mix(s1.z, s2.z, u_xy.y + ty + scrollFactor);
        float m = mix(s1.w, s2.w, u_xy.y + ty + sin(scrollFactor * PI));
        
        float max_amp = abs(a) + abs(b);
        float amp = a * sin(PI*n*p.x) * sin(PI*m*p.y) + b * sin(PI*m*p.x) * sin(PI*n*p.y);
        
        // Variable line thickness based on scroll
        float lineThickness = 0.1 - scrollFactor * 0.05;
        float pattern = 1.0 - smoothstep(abs(amp), 0.0, lineThickness);
        
        // Color tinting based on scroll position
        vec3 tintColor = mix(
          vec3(1.0, 1.0, 1.0), // White at the beginning
          vec3(1.0, 0.9, 0.8), // Subtle warm tint as scrolling progresses
          scrollFactor
        );
        
        // Increase base alpha for more visibility
        float alpha = pattern * (0.6 + scrollFactor * 0.2); // Increase opacity as user scrolls
        
        // Apply easing to create smoother transitions
        float easedAlpha = alpha * (0.8 + sin(scrollFactor * PI) * 0.2);
        
        gl_FragColor = vec4(tintColor * easedAlpha, easedAlpha); // Premultiplied alpha
      }
    `);
    gl.compileShader(fragmentShader);
    
    // Check for compilation errors
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
      return;
    }
    
    // Create program and link shaders
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return;
    }
    
    gl.useProgram(program);
    
    // Set up buffer for position attribute
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const xyLocation = gl.getUniformLocation(program, 'u_xy');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Set resolution uniform
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    
    // Start time tracking
    const startTime = Date.now();
    
    // Enable proper blending for premultiplied alpha
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Correct blend mode for premultiplied alpha
    
    // Clear color with zero alpha
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // Animation and scroll interaction with enhanced smoothing
    const render = () => {
      // Update time uniform (in seconds)
      const currentTime = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, currentTime);
      
      // Update xy uniform based on scroll position with enhanced smoothing
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const rawScrollProgress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      
      // Apply easing function to scroll progress for smoother transitions
      // Using smoothstep for a more natural easing effect
      const t = rawScrollProgress;
      const smoothScrollProgress = t * t * (3.0 - 2.0 * t);
      
      gl.uniform2f(xyLocation, 0.5, smoothScrollProgress);
      
      // Draw
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 0, 
        backgroundColor: colors.darkGreen // Use the darkGreen color from theme
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full" 
        style={{ 
          opacity: 0.7, // Increased from 0.5 for more visibility
          backgroundColor: 'transparent'
        }}
      />
      {children}
    </div>
  );
};

export default ChladniPattern;
