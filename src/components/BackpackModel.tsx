import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { AnatomyPart } from '../data/gearAnatomyData';

interface Props {
  parts: AnatomyPart[];
  activePart: string | null;
  hoveredPart: string | null;
  onPartClick: (id: string) => void;
  onPartHover: (id: string | null) => void;
}

function BackpackMesh({ partId, pos, size, color, emissiveColor, activePart, hoveredPart, onClick, onHover }: {
  partId: string; pos: [number, number, number]; size: [number, number, number];
  color: string; emissiveColor: string;
  activePart: string | null; hoveredPart: string | null;
  onClick: () => void; onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isActive = activePart === partId;
  const isHovered = hoveredPart === partId;

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isActive) {
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2.5) * 0.2;
    } else if (isHovered) {
      mat.emissiveIntensity = 0.3;
    } else {
      mat.emissiveIntensity = 0.02;
    }
    mat.opacity = isActive ? 1 : isHovered ? 0.85 : 0.35;
  });

  return (
    <mesh
      ref={meshRef}
      position={pos}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(partId); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'default'; }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(emissiveColor)}
        emissiveIntensity={0.02}
        transparent
        opacity={0.35}
        metalness={0.05}
        roughness={0.65}
      />
    </mesh>
  );
}

export default function BackpackModel({ activePart, hoveredPart, onPartClick, onPartHover }: Props) {
  return (
    <Float speed={0.5} rotationIntensity={0.06} floatIntensity={0.12}>
      <group>
        {/* Main body - center */}
        <BackpackMesh partId="mainBody" pos={[0, 0.3, 0]} size={[1.6, 2.0, 1.0]}
          color="#1e2d45" emissiveColor="#f472b6"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('mainBody')} onHover={onPartHover} />

        {/* Edge wires */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.62, 2.02, 1.02)]} />
          <lineBasicMaterial color="#4a6080" transparent opacity={0.12} />
        </lineSegments>

        {/* Shoulder straps */}
        <BackpackMesh partId="shoulderStraps" pos={[0.9, 0.3, 0.55]} size={[0.12, 1.3, 0.08]}
          color="#2a3d55" emissiveColor="#a78bfa"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('shoulderStraps')} onHover={onPartHover} />
        <BackpackMesh partId="shoulderStraps" pos={[-0.9, 0.3, 0.55]} size={[0.12, 1.3, 0.08]}
          color="#2a3d55" emissiveColor="#a78bfa"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('shoulderStraps')} onHover={onPartHover} />

        {/* Hip belt */}
        <BackpackMesh partId="hipBelt" pos={[0, -1.4, 0.55]} size={[0.28, 0.4, 1.0]}
          color="#2a3d55" emissiveColor="#fbbf24"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('hipBelt')} onHover={onPartHover} />

        {/* Back panel */}
        <BackpackMesh partId="backPanel" pos={[0, 0.3, -0.55]} size={[1.5, 1.8, 0.06]}
          color="#263850" emissiveColor="#34d399"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('backPanel')} onHover={onPartHover} />

        {/* Side pockets */}
        <BackpackMesh partId="sidePockets" pos={[0.95, -0.3, 0.2]} size={[0.2, 0.6, 0.5]}
          color="#1e2d45" emissiveColor="#60a5fa"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('sidePockets')} onHover={onPartHover} />
        <BackpackMesh partId="sidePockets" pos={[-0.95, -0.3, 0.2]} size={[0.2, 0.6, 0.5]}
          color="#1e2d45" emissiveColor="#60a5fa"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('sidePockets')} onHover={onPartHover} />

        {/* Compression straps */}
        <BackpackMesh partId="compressionStraps" pos={[0, 1.0, 0.55]} size={[1.2, 0.06, 0.04]}
          color="#3a4d65" emissiveColor="#f472b6"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('compressionStraps')} onHover={onPartHover} />
        <BackpackMesh partId="compressionStraps" pos={[0, -0.5, 0.55]} size={[1.2, 0.06, 0.04]}
          color="#3a4d65" emissiveColor="#f472b6"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('compressionStraps')} onHover={onPartHover} />

        {/* Rain cover area */}
        <BackpackMesh partId="rainCover" pos={[0, -1.65, 0.1]} size={[1.0, 0.06, 0.7]}
          color="#1a2a3a" emissiveColor="#34d399"
          activePart={activePart} hoveredPart={hoveredPart}
          onClick={() => onPartClick('rainCover')} onHover={onPartHover} />
      </group>
    </Float>
  );
}
