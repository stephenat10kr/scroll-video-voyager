
import React, { useEffect, useRef } from 'react';
import colors from '@/lib/theme';

const ChladniBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Setup WebGL and initialize the pattern
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize WebGL
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
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
      uniform float u_scroll;
      
      void main(void) {
        const float PI = 3.14159265;
        vec2 p = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

        vec4 s1 = vec4(1.0, 1.0, 1.0, 2.0);
        vec4 s2 = vec4(-4.0, 4.0, 4.0, 4.6);

        float tx = sin(u_time)*0.1; 
        float ty = cos(u_time)*0.1; 

        // Amplify the scroll effect by using a non-linear function
        // This creates more dramatic changes when scrolling
        float scrollEffect = pow(u_scroll, 2.0) * 1.5; // Square the scroll value and multiply by 1.5
        
        // Use amplified scroll position for more dramatic effect
        float a = mix(s1.x, s2.x, min(scrollEffect + tx, 1.0));
        float b = mix(s1.y, s2.y, min(scrollEffect + tx, 1.0));
        float n = mix(s1.z, s2.z, min(scrollEffect + ty, 1.0));
        float m = mix(s1.w, s2.w, min(scrollEffect + ty, 1.0));

        float max_amp = abs(a) + abs(b);
        float amp = a * sin(PI*n*p.x) * sin(PI*m*p.y) + b * sin(PI*m*p.x) * sin(PI*n*p.y);
        
        // Make the pattern changes more visible by adjusting the threshold
        float threshold = 0.1 + 0.05 * sin(scrollEffect * PI);
        float col = 1.0 - smoothstep(abs(amp), 0.0, threshold);
        
        // White pattern with 50% opacity
        gl_FragColor = vec4(1.0, 1.0, 1.0, col * 0.5);
      }
    `;
    
    // Compile shaders
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
    
    // Animation
    let startTime = Date.now();
    
    const updateAnimation = () => {
      if (!gl || !canvas) return;
      
      // Update canvas size if window was resized
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      
      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      
      // Get scroll position as a normalized value between 0 and 1
      const scrollPosition = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      
      // Clear and set viewport
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Use the program
      gl.useProgram(program);
      
      // Get attribute/uniform locations
      const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
      const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
      const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
      const scrollUniformLocation = gl.getUniformLocation(program, 'u_scroll');
      
      // Set uniforms
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform1f(timeUniformLocation, elapsedTime);
      gl.uniform1f(scrollUniformLocation, scrollPosition);
      
      // Set up attributes
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      frameIdRef.current = requestAnimationFrame(updateAnimation);
    };
    
    // Helper function to compile shaders
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
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
    }
    
    // Setup resize handler
    const handleResize = () => {
      if (!gl || !canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    updateAnimation();
    
    // Cleanup
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ChladniBackground;
