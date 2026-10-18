"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

type DreamlingProps = {
  reduceMotion: boolean;
  waving: boolean;
  spinning: boolean;
};

const PEACH = "#ffd9c1";
const CAP = "#b78cff";
const INK = "#3d1c4e";
const CREAM = "#fff6df";
const PINK = "#ff7ab8";
const CYAN = "#6ce7d6";
const YELLOW = "#ffd84d";

function Eye({ x, look }: { x: number; look: { x: number; y: number } }) {
  return (
    <group position={[x, 0.14, 0.86]}>
      <mesh>
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshStandardMaterial color={CREAM} roughness={0.6} />
      </mesh>
      <mesh position={[look.x * 0.05, look.y * 0.05 + 0.01, 0.13]}>
        <sphereGeometry args={[0.095, 18, 18]} />
        <meshStandardMaterial color="#6b3fa0" roughness={0.25} />
      </mesh>
      <mesh position={[look.x * 0.06 - 0.03, look.y * 0.05 + 0.05, 0.2]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff6df" emissiveIntensity={0.4} />
      </mesh>
      {/* sleepy half-lid */}
      <mesh position={[0, 0.12, 0.12]} rotation={[Math.PI / 2.4, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
        <meshStandardMaterial color={INK} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Dreamling({ reduceMotion, waving, spinning }: DreamlingProps) {
  const group = useRef<THREE.Group>(null);
  const pupil = useRef(new THREE.Vector2(0, 0));
  const bubbles = useRef<THREE.Mesh[]>([]);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const pointer = state.pointer;
    pupil.current.x = THREE.MathUtils.lerp(pupil.current.x, pointer.x, 0.12);
    pupil.current.y = THREE.MathUtils.lerp(pupil.current.y, pointer.y, 0.12);
    if (Math.abs(pupil.current.x - look.x) > 0.02 || Math.abs(pupil.current.y - look.y) > 0.02) {
      setLook({ x: pupil.current.x, y: pupil.current.y });
    }
    if (!group.current) return;
    if (reduceMotion) {
      group.current.rotation.y = 0;
      group.current.position.y = 0;
    } else {
      const targetRotation = spinning ? state.clock.elapsedTime * 0.5 : pointer.x * 0.5;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotation, 0.055);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * -0.12, 0.08);
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.07;
    }
    bubbles.current.forEach((bubble, index) => {
      if (!bubble) return;
      if (reduceMotion) {
        bubble.position.y = 0.2 + index * 0.35;
        return;
      }
      bubble.position.y += delta * (0.22 + index * 0.04);
      bubble.position.x = 1.1 + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.18;
      if (bubble.position.y > 2.2) bubble.position.y = -0.6;
    });
  });

  return (
    <group ref={group} scale={1.05} position={[0, -0.15, 0]}>
      {/* body */}
      <mesh castShadow>
        <sphereGeometry args={[1.08, 42, 42]} />
        <meshStandardMaterial color={PEACH} roughness={0.95} flatShading />
      </mesh>
      {/* belly patch */}
      <mesh position={[0, -0.28, 0.75]} scale={[0.78, 0.62, 0.4]}>
        <sphereGeometry args={[0.8, 28, 28]} />
        <meshStandardMaterial color="#fff1e0" roughness={1} />
      </mesh>

      <Eye x={-0.34} look={look} />
      <Eye x={0.34} look={look} />

      {/* cheeks */}
      <mesh position={[-0.62, -0.12, 0.76]} scale={[0.22, 0.13, 0.06]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={PINK} roughness={0.8} opacity={0.9} transparent />
      </mesh>
      <mesh position={[0.62, -0.12, 0.76]} scale={[0.22, 0.13, 0.06]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={PINK} roughness={0.8} opacity={0.9} transparent />
      </mesh>

      {/* mouth */}
      <mesh position={[0, -0.22, 0.92]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.12, 0.035, 10, 22, Math.PI]} />
        <meshStandardMaterial color={INK} roughness={1} />
      </mesh>

      {/* nightcap */}
      <mesh position={[0.02, 0.98, -0.06]} rotation={[0.12, 0, -0.18]} castShadow>
        <coneGeometry args={[0.78, 1.25, 20, 1, true]} />
        <meshStandardMaterial color={CAP} roughness={0.9} flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.02, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.13, 12, 30]} />
        <meshStandardMaterial color="#ffd3e8" roughness={0.85} />
      </mesh>
      {/* cap star */}
      <mesh position={[0.36, 1.72, -0.06]} rotation={[0, 0.4, 0.3]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color={YELLOW} emissive={YELLOW} emissiveIntensity={0.7} metalness={0.2} roughness={0.4} />
      </mesh>
      <pointLight position={[0.36, 1.72, 0.3]} intensity={2.4} distance={3} color="#ffe9a3" />

      {/* arms */}
      <group position={[-0.95, -0.15, 0.1]} rotation={[0, 0, waving ? -1.15 : -0.35]}>
        <mesh position={[-0.22, 0, 0]} scale={[0.52, 0.2, 0.22]}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshStandardMaterial color={PEACH} roughness={1} />
        </mesh>
      </group>
      <group position={[0.95, -0.15, 0.1]} rotation={[0, 0, 0.35]}>
        <mesh position={[0.22, 0, 0]} scale={[0.52, 0.2, 0.22]}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshStandardMaterial color={PEACH} roughness={1} />
        </mesh>
      </group>

      {/* apron */}
      <mesh position={[0, -0.62, 0.72]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.86, 0.72, 0.12]} />
        <meshStandardMaterial color={CAP} roughness={1} />
      </mesh>
      <mesh position={[0, -0.52, 0.8]}>
        <boxGeometry args={[0.66, 0.07, 0.06]} />
        <meshStandardMaterial color={PINK} roughness={1} />
      </mesh>
      <mesh position={[0, -0.66, 0.8]}>
        <boxGeometry args={[0.66, 0.07, 0.06]} />
        <meshStandardMaterial color={CYAN} roughness={1} />
      </mesh>

      {/* feet with mismatched socks */}
      <mesh position={[-0.38, -1.06, 0.26]} scale={[0.34, 0.18, 0.24]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={CYAN} roughness={1} />
      </mesh>
      <mesh position={[0.38, -1.06, 0.26]} scale={[0.34, 0.18, 0.24]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={PINK} roughness={1} />
      </mesh>

      {/* bubble wand */}
      <group position={[1.05, -0.55, 0.35]} rotation={[0.2, 0, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.045, 0.8, 10]} />
          <meshStandardMaterial color={PINK} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.035, 10, 22]} />
          <meshStandardMaterial color={CYAN} roughness={0.5} />
        </mesh>
      </group>

      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) bubbles.current[index] = node;
          }}
          position={[1.1 + index * 0.12, -0.2 + index * 0.36, 0.5]}
          scale={0.16 + index * 0.03}
        >
          <sphereGeometry args={[1, 18, 18]} />
          <meshStandardMaterial color={index % 2 ? CYAN : "#ffd3e8"} transparent opacity={0.45} roughness={0.15} metalness={0.1} />
        </mesh>
      ))}

      {/* shadow disc */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.2, 0.7, 1]}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color="#9b6ad1" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

export default function ThreeDreamlingCanvas({ reduceMotion }: { reduceMotion: boolean }) {
  const [waving, setWaving] = useState(false);
  const [spinning, setSpinning] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative h-[330px] w-full overflow-hidden rounded-lg border-[3px] border-[#3d1c4e] bg-[linear-gradient(180deg,#ffe6f3,#e9d9ff_55%,#c9f7f4)] sm:h-[360px]">
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [0, 0.5, 5.2], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          aria-label="Interactive 3D model of Pudding Mallowmoon"
        >
          <color attach="background" args={["#ffe9f6"]} />
          <ambientLight intensity={1.1} color="#fff3d8" />
          <directionalLight position={[3, 5, 4]} intensity={2.1} color="#ffffff" />
          <directionalLight position={[-4, 2, 2]} intensity={0.9} color="#c9a7ff" />
          <Dreamling reduceMotion={reduceMotion} waving={waving} spinning={spinning} />
        </Canvas>
        <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-[#3d1c4e] bg-[#fff6df] px-2 py-0.5 font-[family-name:var(--font-pixel)] text-[0.45rem] text-[#3d1c4e]">
          drag your pointer — her eyes follow you
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-sm btn-cyan"
          onClick={() => setWaving((value) => !value)}
          aria-pressed={waving}
        >
          {waving ? "👋 Lower arm" : "👋 Wave hello"}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-pink"
          onClick={() => setSpinning((value) => !value)}
          aria-pressed={spinning}
        >
          {spinning ? "⏹ Stop spinning" : "🌀 Spin the dreamling"}
        </button>
      </div>
    </div>
  );
}
