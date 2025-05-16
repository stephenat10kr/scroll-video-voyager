
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
    
    // Enhanced fragment shader with more dramatic parameters
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
        vec4 s2 = vec4(-6.0, 6.0, 6.0, 7.0); // Increased range for more complexity
        
        // Apply more dramatic scroll influence
        float scrollInfluence = u_xy.y * 2.5; // Amplify scroll effect
        float tx = sin(u_time * 0.5) * 0.3 * (1.0 + scrollInfluence); 
        float ty = cos(u_time * 0.5) * 0.3 * (1.0 + scrollInfluence);
        
        // Change pattern more dramatically based on scroll
        float a = mix(s1.x, s2.x, u_xy.x+tx);
        float b = mix(s1.y, s2.y, u_xy.x+tx);
        float n = mix(s1.z, s2.z, u_xy.y+ty);
        float m = mix(s1.w, s2.w, u_xy.y+ty);
        
        // Add scroll-based rotation to the pattern
        float rotation = PI * 0.5 * u_xy.y;
        float nx = p.x * cos(rotation) - p.y * sin(rotation);
        float ny = p.x * sin(rotation) + p.y * cos(rotation);
        vec2 rotatedP = vec2(nx, ny);
        
        float max_amp = abs(a) + abs(b);
        float amp = a * sin(PI*n*rotatedP.x) * sin(PI*m*rotatedP.y) + b * sin(PI*m*rotatedP.x) * sin(PI*n*rotatedP.y);
        float pattern = 1.0 - smoothstep(abs(amp), 0.0, 0.12 - (u_xy.y * 0.1)); // Thinner lines at top of page
        
        // Add color tinting based on scroll position
        vec3 colorTop = vec3(1.0, 1.0, 1.0); // White
        vec3 colorBottom = vec3(1.0, 0.7, 0.47); // Coral tint
        vec3 color = mix(colorTop, colorBottom, u_xy.y * 1.5);
        
        float alpha = pattern * (0.5 + u_xy.y * 0.5); // Increase opacity as you scroll
        gl_FragColor = vec4(color * alpha, alpha); // Premultiplied alpha
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
    
    // Animation and scroll interaction
    const render = () => {
      // Update time uniform (in seconds)
      const currentTime = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, currentTime);
      
      // Update xy uniform based on scroll position with more dramatic mapping
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      let scrollProgress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      
      // Apply easing for more dramatic effect
      scrollProgress = Math.pow(scrollProgress, 0.7); // Ease out (changes happen more dramatically at beginning)
      
      gl.uniform2f(xyLocation, 0.5, scrollProgress);
      
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
          opacity: 0.8, // Increased opacity for more dramatic effect
          backgroundColor: 'transparent'
        }}
      />
      {children}
    </div>
  );
};

export default ChladniPattern;
