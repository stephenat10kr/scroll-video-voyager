
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
        
        // Pattern parameters
        vec4 s1 = vec4(3.5, 2.0, 3.0, 1.5);    // Base values
        vec4 s2 = vec4(-2.0, 5.0, 4.5, 2.8);   // End values
        
        // Time affects frequency parameters
        float timeInfluence = sin(u_time * 0.5) * 0.2;
        float n = mix(s1.z, s2.z, 0.5 + timeInfluence);
        float m = mix(s1.w, s2.w, 0.5 - timeInfluence);
        
        // Scroll affects phase of the pattern - INCREASED EFFECT
        float scrollPhaseX = u_xy.y * PI * 6.0; // Increased from 2.0 to 6.0
        float scrollPhaseY = u_xy.y * PI * 4.5; // Increased from 1.5 to 4.5
        
        // Amplitude coefficients - now partially affected by scroll
        float a = s1.x + u_xy.y * 2.0; // Add scroll influence to amplitude
        float b = s1.y + u_xy.y * 1.5; // Add scroll influence to amplitude
        
        // Pattern calculation with phase shift controlled by scrolling
        float max_amp = abs(a) + abs(b);
        float amp = a * sin(PI*n*p.x + scrollPhaseX) * sin(PI*m*p.y) + 
                   b * sin(PI*m*p.x) * sin(PI*n*p.y + scrollPhaseY);
        
        float pattern = 1.0 - smoothstep(abs(amp), 0.0, 0.1);
        
        // Use pure white with carefully controlled alpha
        float alpha = pattern * 0.5;
        vec3 color = vec3(1.0, 1.0, 1.0);
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
      
      // Update xy uniform based on scroll position
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
      
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
      className="w-full h-full pointer-events-none"
      style={{ 
        backgroundColor: colors.darkGreen, // Explicitly use darkGreen from theme
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full" 
        style={{ 
          opacity: 0.5,
          backgroundColor: 'transparent'
        }}
      />
      {children}
    </div>
  );
};

export default ChladniPattern;
