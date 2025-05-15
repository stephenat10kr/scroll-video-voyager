
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Chladni: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Initialize Three.js components
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create orthographic camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Create renderer
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x203435, 0); // transparent background
    rendererRef.current = renderer;

    // Resize function
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      rendererRef.current.setSize(width, height);

      // Update pixel ratio for better quality on high-DPI displays
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
    };

    // Initialize size
    handleResize();

    // Create shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2() },
        u_scroll: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_scroll;
        varying vec2 vUv;
        
        const float PI = 3.14159265359;
        
        void main() {
          vec2 p = (2.0 * gl_FragCoord.xy - u_resolution) / min(u_resolution.x, u_resolution.y);
          
          // Chladni equation parameters
          float n = 3.0 + 2.0 * sin(u_time * 0.1 + u_scroll * PI);
          float m = 2.0 + 2.0 * cos(u_time * 0.15 + u_scroll * PI * 0.7);
          float a = 2.0 + sin(u_time * 0.2 + u_scroll * PI * 0.5);
          float b = 2.5 + cos(u_time * 0.25 + u_scroll * PI * 0.3);
          
          // Chladni pattern
          float pattern = a * sin(PI * n * p.x) * sin(PI * m * p.y) + 
                          b * sin(PI * m * p.x) * sin(PI * n * p.y);
                    
          // Create the visual pattern with smooth transition
          float threshold = 0.05 + 0.03 * sin(u_scroll * PI);
          float intensity = 1.0 - smoothstep(abs(pattern), 0.0, threshold);
          
          // Output color with transparency
          gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
    });
    
    materialRef.current = material;

    // Update resolution uniform
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      material.uniforms.u_resolution.value.set(width, height);
    }

    // Create a simple plane geometry that covers the entire view
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Setup animation
    let startTime = Date.now();
    
    // Setup scroll trigger
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (materialRef.current) {
          materialRef.current.uniforms.u_scroll.value = self.progress;
        }
      }
    });

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !materialRef.current) return;
      
      const elapsedTime = (Date.now() - startTime) / 1000;
      materialRef.current.uniforms.u_time.value = elapsedTime;
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      
      if (geometry) {
        geometry.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[50vh] bg-[#203435]"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          pointerEvents: 'none',
          opacity: 0.5
        }}
      />
    </div>
  );
};

export default Chladni;
