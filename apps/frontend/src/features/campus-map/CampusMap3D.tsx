'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sky } from '@react-three/drei';
import * as THREE from 'three';

// ─── Dark-mode hook ───────────────────────────────────────────────────────────

function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

// ─── Night sky CSS layer ──────────────────────────────────────────────────────
// Sits BEHIND the canvas (zIndex 0). The canvas uses alpha:true so sky pixels
// (where no 3D geometry is drawn) are transparent — stars/moon show through.
// Buildings & ground are opaque 3D geometry, so they correctly block this layer.

const seed01 = (value: number) => {
  const x = Math.sin(value * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const STAR_DATA = Array.from({ length: 110 }, (_, i) => {
  const x = seed01(i + 1);
  const y = seed01(i + 101);
  const bigStar = i % 19 === 0;
  return {
    left: `${(x * 100).toFixed(2)}%`,
    top: `${(y * 58).toFixed(2)}%`,
    r: bigStar ? 1.8 : x > 0.84 ? 1.15 : 0.75,
    opacity: 0.32 + y * 0.38 + (bigStar ? 0.08 : 0),
  };
});

function NightSkyLayer() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(to bottom, #02060f 0%, #060d1f 55%, #0d1b2e 100%)',
        pointerEvents: 'none',
      }}
    >
      {/* Stars */}
      {STAR_DATA.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: '50%',
            background: 'white',
            opacity: s.opacity,
            boxShadow: s.r > 1.2 ? `0 0 ${s.r * 2.4}px rgba(255,255,255,0.6)` : undefined,
          }}
        />
      ))}

      {/* Moon — crescent via two overlapping circles */}
      <div style={{ position: 'absolute', top: '9%', right: '14%' }}>
        {/* Moon disc */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: '#fff9e0',
            boxShadow: '0 0 18px 6px rgba(255,248,180,0.35)',
            position: 'relative',
          }}
        >
          {/* Crescent shadow */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: 8,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(to bottom, #02060f, #060d1f)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Category Configuration ───────────────────────────────────────────────────

interface CategoryCfg {
  color: string;
  emissive: string;
  label: string;
  heightBase: number;
  heightPerArea: number;
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

function getBuildingHeight(region: { category: string; width: number; height: number }): number {
  const cfg = CATEGORY_CFG[region.category] ?? FALLBACK_CFG;
  return Math.min(cfg.heightBase + region.width * region.height * cfg.heightPerArea, 1.8);
}

const toWorld = (v: number) => v / 10 - 5;

interface FlyTarget {
  lookAt: THREE.Vector3;
  camPos: THREE.Vector3;
}

// ─── Building ────────────────────────────────────────────────────────────────

function Building({
  region,
  isSelected,
  isHovered,
  isDark,
  onClick,
  onHover,
  onUnhover,
}: {
  region: any;
  isSelected: boolean;
  isHovered: boolean;
  isDark: boolean;
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

  const baseEmissive = isDark ? 0.66 : 0;
  const targetScale = isSelected ? 1.08 : isHovered ? 1.05 : 1.0;
  const targetEmissive = isSelected ? 1.02 : isHovered ? 0.82 : baseEmissive;

  useFrame(() => {
    if (!meshRef.current) return;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.14);
    meshRef.current.scale.setScalar(scaleRef.current);
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.14);
  });

  return (
    <group position={[x, 0, z]}>
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
          emissiveIntensity={baseEmissive}
          roughness={isDark ? 0.62 : 0.55}
          metalness={isDark ? 0.08 : 0.15}
        />
      </mesh>
      <mesh position={[0, height + 0.005, 0]}>
        <boxGeometry args={[w + 0.01, 0.012, d + 0.01]} />
        <meshStandardMaterial
          color={isDark ? cfg.color : cfg.emissive}
          roughness={0.85}
          metalness={0}
          emissive={isDark ? cfg.emissive : '#000000'}
          emissiveIntensity={isDark ? 0.22 : 0}
        />
      </mesh>
      <Text
        position={[0, height + 0.28, 0]}
        fontSize={Math.max(0.1, Math.min(0.16, w * 0.25))}
        color={isDark ? '#cbd5e1' : 'white'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor={isDark ? '#0f172a' : '#000000'}
        maxWidth={w * 2}
        lineHeight={1.1}
      >
        {region.name}
      </Text>
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
              background: 'rgba(8,12,28,0.92)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1.5px solid ${cfg.color}60`,
              borderRadius: '12px',
              padding: '10px 14px',
              color: 'white',
              minWidth: '148px',
              maxWidth: '180px',
              textAlign: 'center',
              boxShadow: `0 0 24px ${cfg.color}50,0 4px 16px rgba(0,0,0,0.6)`,
              fontFamily: 'Inter,system-ui,sans-serif',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: cfg.color,
                margin: '0 auto 6px',
                boxShadow: `0 0 10px ${cfg.color}`,
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>
              {region.name}
            </div>
            <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 8, lineHeight: 1.4 }}>
              {region.description}
            </div>
            <span
              style={{
                display: 'inline-block',
                background: `${cfg.color}22`,
                border: `1px solid ${cfg.color}55`,
                color: cfg.color,
                borderRadius: 20,
                fontSize: 10,
                padding: '2px 9px',
                fontWeight: 600,
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

function Road({ road, isDark }: { road: any; isDark: boolean }) {
  const segments = useMemo(() => {
    if (!road.points || !Array.isArray(road.points) || road.points.length < 2) return [];
    const out: { cx: number; cz: number; len: number; angle: number; w: number }[] = [];
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i],
        p2 = road.points[i + 1];
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
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[seg.len, seg.w]} />
            <meshStandardMaterial
              color={isDark ? '#25304a' : '#2d3748'}
              roughness={0.95}
              metalness={0}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
            <planeGeometry args={[seg.len * 0.88, seg.w * 0.09]} />
            <meshStandardMaterial
              color={isDark ? '#fde68a' : '#ffffff'}
              opacity={isDark ? 0.72 : 0.5}
              transparent
              roughness={1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Ground ──────────────────────────────────────────────────────────────────

function Ground({ isDark }: { isDark: boolean }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14, 1, 1]} />
        <meshStandardMaterial
          color={isDark ? '#26432c' : '#3d6b42'}
          roughness={0.96}
          metalness={0}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={isDark ? '#172117' : '#2d5233'} roughness={1} metalness={0} />
      </mesh>
    </>
  );
}

// ─── Inner Scene ─────────────────────────────────────────────────────────────

function InnerScene({
  regions,
  roads,
  selectedRegion,
  onSelectRegion,
  isDark,
}: {
  regions: any[];
  roads: any[];
  selectedRegion: any;
  onSelectRegion: (r: any) => void;
  isDark: boolean;
}) {
  const orbitRef = useRef<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const flyTargetRef = useRef<FlyTarget | null>(null);
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    if (isDark) {
      // Transparent clear — the CSS NightSkyLayer behind the canvas shows through
      scene.background = null;
      gl.setClearColor(0x000000, 0); // fully transparent clear
    } else {
      scene.background = new THREE.Color('#c8dff2');
      gl.setClearColor(0xc8dff2, 1);
    }
  }, [isDark, scene, gl]);

  useFrame(() => {
    const ft = flyTargetRef.current;
    if (!ft || !orbitRef.current) return;
    camera.position.lerp(ft.camPos, 0.06);
    orbitRef.current.target.lerp(ft.lookAt, 0.06);
    orbitRef.current.update();
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
      {/* Day sky — removed in night so sky pixels are transparent (shows CSS layer) */}
      {!isDark && (
        <Sky
          sunPosition={[100, 30, 60]}
          turbidity={6}
          rayleigh={0.8}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}

      {/* Fog — day only; night has no fog so depth doesn't hide buildings */}
      {!isDark && <fog attach="fog" color="#c8dff2" near={18} far={38} />}

      {/* Lighting */}
      {isDark ? (
        <>
          <ambientLight intensity={0.3} color="#2a3c66" />
          <directionalLight
            position={[-10, 16, -8]}
            intensity={0.5}
            color="#d8e4ff"
            castShadow={false}
          />
          <hemisphereLight args={['#11204a', '#162416', 0.36]} />
        </>
      ) : (
        <>
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
        </>
      )}

      <Ground isDark={isDark} />
      {roads.map((road) => (
        <Road key={road.id} road={road} isDark={isDark} />
      ))}
      {regions.map((region) => (
        <Building
          key={region.id}
          region={region}
          isSelected={selectedRegion?.id === region.id}
          isHovered={hoveredId === region.id}
          isDark={isDark}
          onClick={() => handleSelect(region)}
          onHover={() => setHoveredId(region.id)}
          onUnhover={() => setHoveredId(null)}
        />
      ))}

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

// ─── Public Component ─────────────────────────────────────────────────────────

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
  const isDark = useIsDarkMode();

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-border shadow-2xl">
      {/* Night sky layer — sits BEHIND the canvas (zIndex 0).
          Stars/moon are visible only through sky pixels where no 3D geometry
          is drawn. Buildings & ground are solid WebGL geometry → block this layer. */}
      {isDark && <NightSkyLayer />}

      {/* Canvas at zIndex 1, alpha:true so sky is transparent in night */}
      <Canvas
        shadows={!isDark}
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      >
        <InnerScene
          regions={regions}
          roads={roads}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
          isDark={isDark}
        />
      </Canvas>

      {/* UI overlays at zIndex 2 (above canvas) */}

      {/* Controls hint */}
      <div
        style={{ zIndex: 2 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/55 backdrop-blur-md text-white/90 text-[11px] px-4 py-1.5 rounded-full pointer-events-none select-none tracking-wide shadow-lg"
      >
        🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Click a building to explore
      </div>

      {/* Legend */}
      <div
        style={{ zIndex: 2 }}
        className={`absolute top-3 left-3 backdrop-blur-md rounded-xl px-3 py-2.5 pointer-events-none select-none shadow-lg border transition-all duration-500 ${isDark ? 'bg-slate-900/75 border-slate-700/50' : 'bg-black/55 border-transparent'}`}
      >
        <p className="text-white/50 text-[9px] font-semibold uppercase tracking-widest mb-1.5">
          Legend
        </p>
        <div className="space-y-1.5">
          {Object.entries(CATEGORY_CFG).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
