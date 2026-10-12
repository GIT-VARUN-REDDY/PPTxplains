import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Points, PointMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// Endless archways moving towards the camera
function EndlessPath() {
  const groupRef = useRef();
  const gateCount = 30;
  const spacing = 12;
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((gate) => {
        gate.position.z += delta * 6; // Speed of walking
        if (gate.position.z > 10) {
          gate.position.z -= gateCount * spacing;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: gateCount }).map((_, i) => (
        <group key={i} position={[0, -2, -i * spacing]}>
          {/* Left Pillar */}
          <Box args={[0.6, 12, 0.6]} position={[-4, 6, 0]}>
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
          </Box>
          {/* Right Pillar */}
          <Box args={[0.6, 12, 0.6]} position={[4, 6, 0]}>
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
          </Box>
          {/* Top Beam */}
          <Box args={[9, 0.6, 0.6]} position={[0, 11.7, 0]}>
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
          </Box>
        </group>
      ))}
    </group>
  );
}

// A striking glowing core in the far background
function CyanMoon() {
  return (
    <Sphere args={[20, 64, 64]} position={[0, 15, -180]}>
      <meshBasicMaterial color="#3b82f6" />
    </Sphere>
  );
}

// Falling rain or data particles
function AtmosphericParticles() {
  const ref = useRef();
  const count = 3000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;     // x
      pos[i * 3 + 1] = Math.random() * 50;         // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150 - 20; // z
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      const positionsArray = ref.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positionsArray[i * 3 + 1] -= delta * 6; // Fall down fast
        positionsArray[i * 3] -= delta * 2;     // Drift left
        
        if (positionsArray[i * 3 + 1] < -2) {
          positionsArray[i * 3 + 1] = 50;
          positionsArray[i * 3] = (Math.random() - 0.5) * 60;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// Subtle camera sway to simulate walking with responsive mobile framing
function WalkingCamera() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const isPortrait = state.size.width < state.size.height;
    
    // Dynamically adjust camera FOV & distance so gates (-4 to +4) stay perfectly framed on mobile
    const targetFov = isPortrait ? 78 : 45;
    if (Math.abs(state.camera.fov - targetFov) > 0.1) {
      state.camera.fov += (targetFov - state.camera.fov) * 0.1;
      state.camera.updateProjectionMatrix();
    }

    const baseZ = isPortrait ? 11 : 8;
    const baseY = isPortrait ? 3 : 2;

    const swayX = Math.sin(t * 1.5) * 0.15;
    const swayY = Math.cos(t * 3) * 0.15;

    // Smooth mouse / touch parallax
    const targetX = swayX + state.pointer.x * (isPortrait ? 0.8 : 1.8);
    const targetY = baseY + swayY + state.pointer.y * (isPortrait ? 0.5 : 0.9);

    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    state.camera.position.z += (baseZ - state.camera.position.z) * 0.05;
    
    state.camera.lookAt(0, isPortrait ? 7 : 6, -50);
  });
  return null;
}

export function CanvasBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
      background: '#010204',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        dpr={[1, 2]} // Crisp rendering across Retina and standard displays
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Volumetric fog */}
        <fog attach="fog" args={['#010204', 10, 80]} />
        
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.25} />
        {/* Moon backlight */}
        <pointLight position={[0, 15, -120]} intensity={4.5} color="#3b82f6" distance={220} />
        {/* Rim light left */}
        <spotLight position={[-15, 6, 10]} angle={0.35} penumbra={1} intensity={3.2} color="#1d4ed8" />
        {/* Rim light right */}
        <spotLight position={[15, 6, 10]} angle={0.35} penumbra={1} intensity={3.2} color="#3b82f6" />
        
        <EndlessPath />
        <CyanMoon />
        <AtmosphericParticles />
        <WalkingCamera />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.12} mipmapBlur intensity={1.8} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.12} darkness={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
