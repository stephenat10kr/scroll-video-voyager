
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface RitualWaveEffectProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const RitualWaveEffect: React.FC<RitualWaveEffectProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const imagePlanesRef = useRef<any[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rafRef = useRef<number>(0);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Scroll tracking
  const targetScrollYRef = useRef(0);
  const currentScrollYRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;

    float PI = 3.1415926535897932384626433832795;

    void main(){
        vUv = uv;
        vec3 pos = position;

        // Horizontal wave
        float amp = 0.03; // Amplitude
        float freq = 0.01 * uTime; // Frequency

        // Vertical adjustment
        float tension = -0.001 * uTime; // Vertical tension

        pos.x = pos.x + sin(pos.y * PI * freq) * amp;
        pos.y = pos.y + (cos(pos.x * PI) * tension);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uImageAspect;
    uniform float uPlaneAspect;
    uniform float uTime;

    void main(){
      // Match aspect ratios
      vec2 ratio = vec2(
        min(uPlaneAspect / uImageAspect, 1.0),
        min((1.0 / uPlaneAspect) / (1.0 / uImageAspect), 1.0)
      );

      // Center texture
      vec2 fixedUv = vec2(
        (vUv.x - 0.5) * ratio.x + 0.5,
        (vUv.y - 0.5) * ratio.y + 0.5
      );

      vec2 offset = vec2(0.0, uTime * 0.0005);
      float r = texture2D(uTexture, fixedUv + offset).r;
      float g = texture2D(uTexture, fixedUv + offset * 0.5).g;
      float b = texture2D(uTexture, fixedUv).b;
      vec3 texture = vec3(r, g, b);

      gl_FragColor = vec4(texture, 1.0);
    }
  `;

  // Smooth interpolation
  const lerp = (start: number, end: number, multiplier: number): number => {
    return (1 - multiplier) * start + multiplier * end;
  };

  const updateScroll = () => {
    targetScrollYRef.current = window.scrollY;
    // Apply smooth scrolling using linear interpolation
    currentScrollYRef.current = lerp(
      currentScrollYRef.current,
      targetScrollYRef.current,
      0.1
    );
    scrollOffsetRef.current = targetScrollYRef.current - currentScrollYRef.current;
  };

  // Create mesh from image
  const createMesh = (img: HTMLImageElement) => {
    if (!sceneRef.current) return null;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(img.src);

    const uniforms = {
      uTexture: { value: texture },
      uImageAspect: { value: img.naturalWidth / img.naturalHeight || 1 },
      uPlaneAspect: { value: img.clientWidth / img.clientHeight || 1 },
      uTime: { value: 0 },
    };

    const geo = new THREE.PlaneGeometry(1, 1, 100, 100);
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geo, mat);
    sceneRef.current.add(mesh);
    
    return {
      mesh,
      refImage: img,
      setParams() {
        // Set size and position from the reference image
        const rect = this.refImage.getBoundingClientRect();
        
        this.mesh.scale.x = rect.width;
        this.mesh.scale.y = rect.height;
        
        const x = rect.left - canvasSize.width / 2 + rect.width / 2;
        const y = -rect.top + canvasSize.height / 2 - rect.height / 2;
        this.mesh.position.set(x, y, 0);
      },
      update(offset: number) {
        this.setParams();
        this.mesh.material.uniforms.uTime.value = offset;
      },
    };
  };

  const initScene = () => {
    if (!canvasRef.current) return;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasSize.width, canvasSize.height);
    rendererRef.current = renderer;
    
    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Setup camera with adjusted position
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const dist = canvasSize.height / 2 / Math.tan(fovRad);
    const camera = new THREE.PerspectiveCamera(
      fov,
      canvasSize.width / canvasSize.height,
      0.1,
      2000
    );
    camera.position.z = dist;
    cameraRef.current = camera;

    // Find all images in the Rituals section
    if (containerRef.current) {
      const foundImages = Array.from(containerRef.current.querySelectorAll('img'));
      setImages(foundImages);
    }
  };

  const handleResize = () => {
    if (!rendererRef.current || !cameraRef.current) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setCanvasSize({ width, height });
    
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(width, height);
    
    if (cameraRef.current) {
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      // Recalculate camera distance
      const fov = 60;
      const fovRad = (fov / 2) * (Math.PI / 180);
      const dist = height / 2 / Math.tan(fovRad);
      cameraRef.current.position.z = dist;
    }
    
    // Update all image plane positions
    imagePlanesRef.current.forEach(plane => {
      if (plane && plane.setParams) {
        plane.setParams();
      }
    });
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    updateScroll();
    
    imagePlanesRef.current.forEach(plane => {
      if (plane && plane.update) {
        plane.update(scrollOffsetRef.current);
      }
    });
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    initScene();
    
    const resizeHandler = () => {
      handleResize();
    };
    
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (images.length > 0 && sceneRef.current) {
      // Wait for images to be fully loaded
      Promise.all(
        images.map(
          img => new Promise((resolve) => {
            if (img.complete) {
              resolve(img);
            } else {
              img.onload = () => resolve(img);
            }
          })
        )
      ).then((loadedImages) => {
        // Create meshes for all images
        const planes = loadedImages.map(img => createMesh(img as HTMLImageElement)).filter(Boolean);
        imagePlanesRef.current = planes;
        
        // Initialize positions
        planes.forEach(plane => {
          if (plane && plane.setParams) {
            plane.setParams();
          }
        });
        
        // Start animation loop
        animate();
      });
    }
  }, [images]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
};

export default RitualWaveEffect;
