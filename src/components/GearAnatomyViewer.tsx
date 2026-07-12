import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import BackpackModel from './BackpackModel';
import { backpackParts, AnatomyPart } from '../data/gearAnatomyData';
import { GearKnowledgeItem } from '../data/gearKnowledge';

interface Props {
  item: GearKnowledgeItem;
  onClose: () => void;
}

// Camera controller with smooth lerp animation
function CameraController({ targetPos }: { targetPos: [number, number, number] | null }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetCam = useRef(new THREE.Vector3(0, 0, 5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const hasAnim = useRef(false);

  useFrame(() => {
    if (hasAnim.current) {
      camera.position.lerp(targetCam.current, 0.035);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, 0.035);
        controlsRef.current.update();
      }
    }
  });

  // Update animation target
  const prevTarget = useRef(targetPos);
  if (targetPos !== prevTarget.current) {
    prevTarget.current = targetPos;
    if (targetPos) {
      targetCam.current.set(targetPos[0], targetPos[1], targetPos[2]);
      targetLook.current.set(0, 0, 0);
      hasAnim.current = true;
    } else {
      hasAnim.current = false;
    }
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={2.5}
      maxDistance={8}
      maxPolarAngle={Math.PI / 1.8}
      target={[0, 0, 0]}
    />
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.3} color="#404060" />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#fff8ee" />
      <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#8888ff" />
      <spotLight position={[0, 6, 0]} angle={0.5} penumbra={0.8} intensity={0.3} color="#4466ff" />
    </>
  );
}

export default function GearAnatomyViewer({ item, onClose }: Props) {
  const [activePart, setActivePart] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const parts = backpackParts;
  const selectedPart = parts.find(p => p.id === activePart);
  const hoveredPartData = parts.find(p => p.id === hoveredPart);
  const displayPart = selectedPart || hoveredPartData;

  const currentCamPos = activePart
    ? parts.find(p => p.id === activePart)?.cameraPos || null
    : null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col" onClick={onClose}>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" />

      <div className="relative z-10 flex flex-col lg:flex-row h-full" onClick={e => e.stopPropagation()}>
        {/* 3D Canvas */}
        <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 35 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          >
            <Suspense fallback={<Html center><div className="text-white/40 text-sm">加载中...</div></Html>}>
              <SceneLights />
              <CameraController targetPos={currentCamPos} />
              <BackpackModel
                parts={parts}
                activePart={activePart}
                hoveredPart={hoveredPart}
                onPartClick={setActivePart}
                onPartHover={setHoveredPart}
              />
              <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={6} blur={2.5} />
            </Suspense>
          </Canvas>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 liquid-glass-btn !px-3 !py-1.5 !rounded-full text-xs text-white/50 hover:text-white/80"
          >
            ← 返回
          </button>

          {/* Part name overlay on canvas */}
          {displayPart && (
            <div className="absolute bottom-4 left-4 right-4 lg:hidden z-20">
              <div className="liquid-glass rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: displayPart.color }} />
                  <span className="text-sm font-medium text-white/90">{displayPart.label}</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{displayPart.description}</p>
              </div>
            </div>
          )}

          {/* Instruction hint */}
          <div className="absolute bottom-4 right-4 z-20 text-[10px] text-white/20 pointer-events-none hidden lg:block">
            鼠标拖动旋转 · 滚轮缩放 · 点击部件查看详情
          </div>
        </div>

        {/* Right panel - desktop */}
        <div className="hidden lg:block w-80 flex-shrink-0 overflow-y-auto p-5 border-l border-white/[0.06]">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{item.icon}</span>
              <h3 className="text-base font-semibold text-white/90">{item.name} · 结构解析</h3>
            </div>
            <p className="text-xs text-white/35">点击右侧部件或3D模型上的部位查看详情</p>
          </div>

          {/* Part list */}
          <div className="space-y-1.5 mb-6">
            {parts.map(part => (
              <button
                key={part.id}
                onClick={() => setActivePart(activePart === part.id ? null : part.id)}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  activePart === part.id
                    ? 'bg-white/[0.08] border border-white/[0.12]'
                    : 'hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    background: part.color,
                    boxShadow: activePart === part.id ? `0 0 8px ${part.color}` : 'none',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${activePart === part.id ? 'text-white/90' : 'text-white/50'}`}>
                      {part.label}
                    </span>
                    <span className="text-[10px] text-white/20 ml-2">{part.importance}/5</span>
                  </div>
                  {activePart === part.id && (
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{part.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Active part detail card */}
          {selectedPart && (
            <div className="liquid-glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-white/30 tracking-wider uppercase">部件详解</span>
                <span className="flex-1 border-t border-white/[0.06]" />
                <div className="flex items-center gap-1 h-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: i < selectedPart.importance ? selectedPart.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/55 leading-relaxed">{selectedPart.description}</p>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={() => setActivePart(null)}
            className="mt-4 w-full liquid-glass-btn !py-2 !rounded-xl text-xs text-white/40 hover:text-white/70"
          >
            重置视角
          </button>
        </div>
      </div>
    </div>
  );
}
