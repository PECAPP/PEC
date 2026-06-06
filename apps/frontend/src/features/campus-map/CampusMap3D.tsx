'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sky } from '@react-three/drei';
import * as THREE from 'three';

// ─── Category Configuration ──────────────────────────────────────────────────

interface CategoryCfg {
  color: string;
  emissive: string;
  label: string;
  heightBase: number; // base height in 3D units
  heightPerArea: number; // extra height per (width*height) unit of map %²
}

const CATEGORY_CFG: Record<string, CategoryCfg> = {
  academic: {
    color: '#3b82f6',
    emissive: '#1e3a8a',
    label: 'Academic',
    heightBase: 0.55,
    heightPerArea: 0.002,
  },
  hostel: {
    color: '#10b981',
    emissive: '#064e3b',
    label: 'Hostel',
    heightBase: 0.9,
    heightPerArea: 0.001,
  },
  sports: {
    color: '#ef4444',
    emissive: '#7f1d1d',
    label: 'Sports',
    heightBase: 0.08,
    heightPerArea: 0.0005,
  },
  food: {
    color: '#f97316',
    emissive: '#7c2d12',
    label: 'Food',
    heightBase: 0.35,
    heightPerArea: 0.001,
  },
  admin: {
    color: '#8b5cf6',
    emissive: '#3b0764',
    label: 'Admin',
    heightBase: 0.6,
    heightPerArea: 0.0015,
  },
};
const FALLBACK_CFG: CategoryCfg = {
  color: '#6b7280',
  emissive: '#1f2937',
  label: 'Other',
  heightBase: 0.4,
  heightPerArea: 0.001,
};

/** Deterministic height from category + building footprint. No random. */
function getBuildingHeight(region: { category: string; width: number; height: number }): number {
  const cfg = CATEGORY_CFG[region.category] ?? FALLBACK_CFG;
  const area = region.width * region.height;
  return Math.min(cfg.heightBase + area * cfg.heightPerArea, 1.8);
}

/** Convert map-percentage coords → Three.js world coords (centered at origin). */
const toWorld = (v: number) => v / 10 - 5;

// ─── Camera Fly-To ───────────────────────────────────────────────────────────
// Stored as a plain ref so useFrame can self-clear it once the camera
// arrives — no React state means OrbitControls is never fought after landing.

interface FlyTarget {
  lookAt: THREE.Vector3;
  camPos: THREE.Vector3;
}

// ─── Building ────────────────────────────────────────────────────────────────

function Building({
  region,
  isSelected,
  isHovered,
  onClick,
  onHover,
  onUnhover,
}: {
  region: any;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1);

  const cfg = CATEGORY_CFG[region.category] ?? FALLBACK_CFG;
  const height = getBuildingHeight(region);
  const w = region.width / 10;
  const d = region.height / 10;
  const x = toWorld(region.x) + w / 2;
  const z = toWorld(region.y) + d / 2;

  const targetScale = isSelected ? 1.08 : isHovered ? 1.05 : 1.0;
  const emissiveIntensity = isSelected ? 0.55 : isHovered ? 0.22 : 0.0;

  useFrame(() => {
    if (!meshRef.current) return;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.14);
    meshRef.current.scale.setScalar(scaleRef.current);
    (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      THREE.MathUtils.lerp(
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity,
        emissiveIntensity,
        0.14
      );
  });

  return (
    <group position={[x, 0, z]}>
      {/* Main building body */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onUnhover();
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[w, height, d]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.emissive}
          emissiveIntensity={0}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Roof cap — slightly darker shade */}
      <mesh position={[0, height + 0.005, 0]}>
        <boxGeometry args={[w + 0.01, 0.012, d + 0.01]} />
        <meshStandardMaterial color={cfg.emissive} roughness={0.9} metalness={0} />
      </mesh>

      {/* Floating label */}
      <Text
        position={[0, height + 0.28, 0]}
        fontSize={Math.max(0.1, Math.min(0.16, w * 0.25))}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000000"
        maxWidth={w * 2}
        lineHeight={1.1}
      >
        {region.name}
      </Text>

      {/* Info card — only when selected */}
      {isSelected && (
        <Html
          position={[0, height + 0.7, 0]}
          center
          distanceFactor={9}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{
              background: 'rgba(10, 10, 20, 0.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1.5px solid ${cfg.color}60`,
              borderRadius: '12px',
              padding: '10px 14px',
              color: 'white',
              minWidth: '148px',
              maxWidth: '180px',
              textAlign: 'center',
              boxShadow: `0 0 24px ${cfg.color}50, 0 4px 16px rgba(0,0,0,0.6)`,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: cfg.color,
                margin: '0 auto 6px',
                boxShadow: `0 0 10px ${cfg.color}`,
              }}
            />
            <div
              style={{ fontSize: '13px', fontWeight: 700, color: cfg.color, marginBottom: '4px' }}
            >
              {region.name}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.72, marginBottom: '8px', lineHeight: 1.4 }}>
              {region.description}
            </div>
            <span
              style={{
                display: 'inline-block',
                background: `${cfg.color}22`,
                border: `1px solid ${cfg.color}55`,
                color: cfg.color,
                borderRadius: '20px',
                fontSize: '10px',
                padding: '2px 9px',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              {cfg.label}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Road ────────────────────────────────────────────────────────────────────

function Road({ road }: { road: any }) {
  const segments = useMemo(() => {
    if (!road.points || !Array.isArray(road.points) || road.points.length < 2) return [];
    const out: { cx: number; cz: number; len: number; angle: number; w: number }[] = [];
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i];
      const p2 = road.points[i + 1];
      const x1 = toWorld(p1.x),
        z1 = toWorld(p1.y);
      const x2 = toWorld(p2.x),
        z2 = toWorld(p2.y);
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      if (len < 0.001) continue;
      out.push({
        cx: (x1 + x2) / 2,
        cz: (z1 + z2) / 2,
        len,
        angle: Math.atan2(z2 - z1, x2 - x1),
        w: road.width / 10,
      });
    }
    return out;
  }, [road]);

  return (
    <group>
      {segments.map((seg, i) => (
        <group key={i} position={[seg.cx, 0.004, seg.cz]} rotation={[0, -seg.angle, 0]}>
          {/* Asphalt base */}
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[seg.len, seg.w]} />
            <meshStandardMaterial color="#2d3748" roughness={0.95} metalness={0} />
          </mesh>
          {/* White centre dashes */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
            <planeGeometry args={[seg.len * 0.88, seg.w * 0.09]} />
            <meshStandardMaterial color="#ffffff" opacity={0.5} transparent roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Ground ──────────────────────────────────────────────────────────────────

function Ground() {
  return (
    <>
      {/* Base grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14, 1, 1]} />
        <meshStandardMaterial color="#3d6b42" roughness={0.97} metalness={0} />
      </mesh>
      {/* Subtle darker grass border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#2d5233" roughness={1} metalness={0} />
      </mesh>
    </>
  );
}

// ─── Inner Scene (must be inside Canvas for hooks) ───────────────────────────

function InnerScene({
  regions,
  roads,
  selectedRegion,
  onSelectRegion,
}: {
  regions: any[];
  roads: any[];
  selectedRegion: any;
  onSelectRegion: (r: any) => void;
}) {
  const orbitRef = useRef<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Ref (not state) so useFrame can clear it without re-renders or stale closures
  const flyTargetRef = useRef<FlyTarget | null>(null);
  const { camera } = useThree();

  // Drive camera fly-to; auto-clears once arrived so OrbitControls takes over
  useFrame(() => {
    const ft = flyTargetRef.current;
    if (!ft || !orbitRef.current) return;

    camera.position.lerp(ft.camPos, 0.06);
    orbitRef.current.target.lerp(ft.lookAt, 0.06);
    orbitRef.current.update();

    // Stop as soon as we're close enough — hand control back to OrbitControls
    if (
      camera.position.distanceTo(ft.camPos) < 0.08 &&
      orbitRef.current.target.distanceTo(ft.lookAt) < 0.08
    ) {
      flyTargetRef.current = null;
    }
  });

  const handleSelect = useCallback(
    (region: any) => {
      const isSame = selectedRegion?.id === region.id;
      onSelectRegion(isSame ? null : region);

      if (!isSame) {
        const h = getBuildingHeight(region);
        const wx = toWorld(region.x) + region.width / 20;
        const wz = toWorld(region.y) + region.height / 20;
        flyTargetRef.current = {
          lookAt: new THREE.Vector3(wx, h / 2, wz),
          camPos: new THREE.Vector3(wx + 2.8, h + 2.5, wz + 4.0),
        };
      } else {
        flyTargetRef.current = null;
      }
    },
    [selectedRegion, onSelectRegion]
  );

  return (
    <>
      {/* Sky */}
      <Sky
        sunPosition={[100, 30, 60]}
        turbidity={6}
        rayleigh={0.8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Atmosphere fog */}
      <fog attach="fog" color="#c8dff2" near={18} far={38} />

      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#87ceeb', '#3d6b42', 0.55]} />
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-7, 6, -7]} intensity={0.18} color="#ffe4b5" />

      <Ground />

      {roads.map((road) => (
        <Road key={road.id} road={road} />
      ))}

      {regions.map((region) => (
        <Building
          key={region.id}
          region={region}
          isSelected={selectedRegion?.id === region.id}
          isHovered={hoveredId === region.id}
          onClick={() => handleSelect(region)}
          onHover={() => setHoveredId(region.id)}
          onUnhover={() => setHoveredId(null)}
        />
      ))}

      {/* Animation now runs in InnerScene's useFrame above */}

      <OrbitControls
        ref={orbitRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.15}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

// ─── Public Component ────────────────────────────────────────────────────────

export default function CampusMap3D({
  regions,
  roads,
  selectedRegion,
  onSelectRegion,
}: {
  regions: any[];
  roads: any[];
  selectedRegion: any;
  onSelectRegion: (region: any) => void;
}) {
  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-border shadow-2xl">
      <Canvas
        shadows
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <InnerScene
          regions={regions}
          roads={roads}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
        />
      </Canvas>

      {/* Controls hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-md text-white/90 text-[11px] px-4 py-1.5 rounded-full pointer-events-none select-none tracking-wide shadow-lg">
        🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Click a building to explore
      </div>

      {/* Category legend */}
      <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-md rounded-xl px-3 py-2.5 pointer-events-none select-none shadow-lg">
        <p className="text-white/50 text-[9px] font-semibold uppercase tracking-widest mb-1.5">
          Legend
        </p>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_CFG).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                style={{ background: val.color, boxShadow: `0 0 6px ${val.color}88` }}
              />
              <span className="text-white/80 text-[11px]">{val.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
