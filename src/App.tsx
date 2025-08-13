import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Card {
  id: number;
  title: string;
  description: string;
  subtitle: string;
  icon: string;
  color: THREE.Color;
  accentColor: THREE.Color;
  link: string;
  buttonText: string;
}

const cards: Card[] = [
  {
    id: 1,
    title: "Bioinformatics Hub",
    subtitle: "Advanced Genomics & Computational Biology",
    description: "Master computational biology with our comprehensive platform featuring advanced genomics tools, protein structure prediction, and machine learning applications.",
    icon: "⚗️",
    color: new THREE.Color(0x6366f1),
    accentColor: new THREE.Color(0x8b5cf6),
    link: "https://example.com/bioinformatics",
    buttonText: "Explore Tools"
  },
  {
    id: 2,
    title: "Research Community",
    subtitle: "Global Network of Scientists & Researchers",
    description: "Connect with 50,000+ researchers worldwide. Participate in collaborative projects, share discoveries, and attend virtual conferences.",
    icon: "🌐",
    color: new THREE.Color(0x06b6d4),
    accentColor: new THREE.Color(0x0891b2),
    link: "https://example.com/forum",
    buttonText: "Join Network"
  },
  {
    id: 3,
    title: "Support Center",
    subtitle: "Technical Support & Issue Resolution",
    description: "Get instant help with 24/7 support. Report bugs, access documentation, video tutorials, and live chat with 2-hour response time.",
    icon: "🛠️",
    color: new THREE.Color(0xf59e0b),
    accentColor: new THREE.Color(0xd97706),
    link: "https://example.com/error-report",
    buttonText: "Get Support"
  },
  {
    id: 4,
    title: "Innovation Lab",
    subtitle: "Cutting-Edge Research & Development",
    description: "Access virtual laboratory with AI-powered research assistants, cloud computing, and collaboration tools for breakthrough projects.",
    icon: "🔬",
    color: new THREE.Color(0x10b981),
    accentColor: new THREE.Color(0x059669),
    link: "https://example.com/research",
    buttonText: "Start Research"
  }
];

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const cardMeshesRef = useRef<THREE.Mesh[]>([]);
  const textCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Physics state
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationIdRef = useRef<number>();
  const targetPositionRef = useRef(0);

  // Create text texture
  const createTextTexture = (card: Card) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d')!;
    
    // Enhanced background with multiple gradients
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, `#${card.color.getHexString()}`);
    gradient.addColorStop(0.5, `#${card.accentColor.getHexString()}`);
    gradient.addColorStop(1, `#${card.color.clone().multiplyScalar(0.6).getHexString()}`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 1600);
    
    // Add premium glass effect
    const glassGradient = ctx.createRadialGradient(600, 300, 0, 600, 300, 700);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    ctx.fillStyle = glassGradient;
    ctx.fillRect(0, 0, 1200, 1600);
    
    // Add subtle noise texture
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
      ctx.fillRect(Math.random() * 1200, Math.random() * 1600, 1, 1);
    }
    
    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(1100, 200, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(200, 1400, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Icon
    ctx.font = 'bold 160px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;
    ctx.fillText(card.icon, 600, 220);
    ctx.shadowColor = 'transparent';
    
    // Subtitle
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(card.subtitle, 600, 290);
    
    // Title
    ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    
    const words = card.title.split(' ');
    let y = 380;
    for (const word of words) {
      ctx.fillText(word, 600, y);
      y += 75;
    }
    ctx.shadowColor = 'transparent';
    
    // Add feature badges
    const features = [
      card.id === 1 ? 'DNA Analysis' : card.id === 2 ? 'Global Network' : card.id === 3 ? '24/7 Support' : 'AI Powered',
      card.id === 1 ? 'ML Tools' : card.id === 2 ? 'Collaboration' : card.id === 3 ? 'Live Chat' : 'Cloud Computing',
      card.id === 1 ? 'BLAST Search' : card.id === 2 ? 'Peer Review' : card.id === 3 ? 'Documentation' : 'Virtual Lab'
    ];
    
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    
    features.forEach((feature, index) => {
      const badgeY = 580 + index * 60;
      
      // Badge background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.roundRect(150, badgeY - 25, 900, 45, 22);
      ctx.fill();
      
      // Badge border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.roundRect(150, badgeY - 25, 900, 45, 22);
      ctx.stroke();
      
      // Feature text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.fillText(`• ${feature}`, 180, badgeY + 5);
    });
    
    // Description
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    
    const descWords = card.description.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of descWords) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1000 && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    
    y = 800;
    for (const line of lines) {
      ctx.fillText(line, 600, y);
      y += 40;
    }
    
    // Stats section
    const stats = [
      card.id === 1 ? '10K+ Tools' : card.id === 2 ? '50K+ Users' : card.id === 3 ? '2hr Response' : '99.9% Uptime',
      card.id === 1 ? '500+ Datasets' : card.id === 2 ? '200+ Countries' : card.id === 3 ? '24/7 Available' : 'AI Assisted'
    ];
    
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    stats.forEach((stat, index) => {
      const statX = 300 + index * 600;
      const statY = 1000;
      
      // Stat circle background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(statX, statY, 80, 0, Math.PI * 2);
      ctx.fill();
      
      // Stat text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat, statX, statY + 8);
    });
    
    // Premium button with gradient
    const buttonGradient = ctx.createLinearGradient(0, 1200, 0, 1280);
    buttonGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    buttonGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    
    ctx.fillStyle = buttonGradient;
    ctx.roundRect(350, 1200, 500, 80, 40);
    ctx.fill();
    
    // Button border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.roundRect(350, 1200, 500, 80, 40);
    ctx.stroke();
    
    // Button text
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;
    ctx.fillText(card.buttonText, 600, 1250);
    ctx.shadowColor = 'transparent';
    
    return canvas;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    // Enhanced background with gradient
    scene.background = null;
    
    // Create gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    const bgGradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.5, '#16213e');
    bgGradient.addColorStop(1, '#0f0f23');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 2048, 2048);
    
    const bgTexture = new THREE.CanvasTexture(canvas);
    const bgGeometry = new THREE.SphereGeometry(50, 32, 32);
    const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture, side: THREE.BackSide });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(bgMesh);
    
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Create card meshes
    const cardMeshes: THREE.Mesh[] = [];
    const textCanvases: HTMLCanvasElement[] = [];

    cards.forEach((card, index) => {
      // Create text texture
      const canvas = createTextTexture(card);
      textCanvases.push(canvas);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Card geometry and material
      const geometry = new THREE.PlaneGeometry(3.6, 5.2, 64, 64);
      
      // Add subtle curve to the geometry
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = Math.sin(x * 0.3) * 0.08 + Math.sin(y * 0.2) * 0.04;
        positions.setZ(i, z);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      
      const material = new THREE.MeshLambertMaterial({ 
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.1
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = index * 5.0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      scene.add(mesh);
      cardMeshes.push(mesh);
    });

    cardMeshesRef.current = cardMeshes;
    textCanvasesRef.current = textCanvases;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(8, 8, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // Add rim lighting
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.6);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);
    
    // Add fill light
    const fillLight = new THREE.DirectionalLight(0x06b6d4, 0.3);
    fillLight.position.set(0, -5, 3);
    scene.add(fillLight);

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Ultra-smooth physics animation loop
  const animate = () => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    // Apply physics
    if (!isDraggingRef.current) {
      // Smooth interpolation to target
      const targetPosition = -currentIndex * 5.0;
      targetPositionRef.current = targetPosition;
      
      const diff = targetPositionRef.current - positionRef.current;
      const distance = Math.abs(diff);
      
      if (distance > 0.01) {
        // Smooth easing function
        const easing = Math.min(0.15, distance * 0.08);
        positionRef.current += diff * easing;
        velocityRef.current = diff * easing;
      } else {
        positionRef.current = targetPositionRef.current;
        velocityRef.current = 0;
      }
    } else {
      // Apply friction when dragging
      velocityRef.current *= 0.92;
      positionRef.current += velocityRef.current;
    }

    // Update card positions and rotations
    cardMeshesRef.current.forEach((mesh, index) => {
      const offset = index * 5.0 + positionRef.current;
      const distance = Math.abs(offset);
      
      mesh.position.x = offset;
      mesh.position.z = -distance * 0.4;
      mesh.position.y = Math.sin(offset * 0.08) * 0.15;
      mesh.rotation.y = -offset * 0.06;
      mesh.rotation.x = Math.sin(offset * 0.04) * 0.03;
      
      const scale = Math.max(0.8, 1 - distance * 0.06);
      mesh.scale.setScalar(scale);
      
      const opacity = Math.max(0.5, 1 - distance * 0.2);
      (mesh.material as THREE.MeshLambertMaterial).opacity = opacity;
    });

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Start animation loop
  useEffect(() => {
    animate();
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Mouse/Touch handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - lastMouseXRef.current;
    const deltaTime = Date.now() - lastTimeRef.current;
    
    if (deltaTime > 0) {
      velocityRef.current = (deltaX / deltaTime) * 0.008;
      positionRef.current += deltaX * 0.008;
    }
    
    lastMouseXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    
    // Snap to nearest card
    const nearestIndex = Math.round(-positionRef.current / 5.0);
    const clampedIndex = Math.max(0, Math.min(cards.length - 1, nearestIndex));
    setCurrentIndex(clampedIndex);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.touches[0].clientX;
    lastTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.touches[0].clientX - lastMouseXRef.current;
    const deltaTime = Date.now() - lastTimeRef.current;
    
    if (deltaTime > 0) {
      velocityRef.current = (deltaX / deltaTime) * 0.008;
      positionRef.current += deltaX * 0.008;
    }
    
    lastMouseXRef.current = e.touches[0].clientX;
    lastTimeRef.current = Date.now();
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    
    // Snap to nearest card
    const nearestIndex = Math.round(-positionRef.current / 5.0);
    const clampedIndex = Math.max(0, Math.min(cards.length - 1, nearestIndex));
    setCurrentIndex(clampedIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Navigation dots */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-10 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
        {cards.map((_, index) => (
          <React.Fragment key={index}>
            {index > 0 && <div className="w-6 h-0.5 bg-white/20 rounded-full"></div>}
            <button
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 transform ${
                index === currentIndex
                  ? 'bg-white scale-150 shadow-lg shadow-white/50'
                  : 'bg-white/40 hover:bg-white/60 hover:scale-110'
              }`}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <div className="bg-black/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
          <p className="text-white/70 text-sm font-medium">
            Drag • Swipe • Arrow Keys • Click Dots
          </p>
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}