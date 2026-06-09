'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sky, Billboard } from '@react-three/drei';
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

function NightSkyLayer({ phase }: { phase: number }) {
  const normPhase = phase / 29.530588853;

  let shadowStyle: React.CSSProperties = {
    position: 'absolute',
    top: -2,
    borderRadius: '50%',
    background: 'linear-gradient(to bottom, #02060f, #060d1f)',
    transition: 'all 0.5s ease',
  };

  if (normPhase < 0.03 || normPhase > 0.97) {
    // New Moon
    shadowStyle = { ...shadowStyle, left: -2, width: 50, height: 50, opacity: 0.95 };
  } else if (normPhase >= 0.03 && normPhase < 0.47) {
    // Waxing: shadow moves left to reveal light
    const offset = 46 - (normPhase / 0.5) * 46;
    shadowStyle = { ...shadowStyle, left: offset, width: 46, height: 46 };
  } else if (normPhase >= 0.47 && normPhase <= 0.53) {
    // Full Moon: hide shadow
    shadowStyle = { ...shadowStyle, display: 'none' };
  } else {
    // Waning: shadow moves right to cover light
    const offset = -46 + ((normPhase - 0.5) / 0.5) * 46;
    shadowStyle = { ...shadowStyle, left: offset, width: 46, height: 46 };
  }

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

      {/* Moon */}
      <div style={{ position: 'absolute', top: '9%', right: '14%' }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: '#fff9e0',
            boxShadow: '0 0 18px 6px rgba(255,248,180,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={shadowStyle} />
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
  isMapNight,
  onClick,
  onHover,
  onUnhover,
}: {
  region: any;
  isSelected: boolean;
  isHovered: boolean;
  isMapNight: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const cfg = CATEGORY_CFG[region.category] ?? FALLBACK_CFG;
  const height = getBuildingHeight(region);
  const w = region.width / 10;
  const d = region.height / 10;
  const x = toWorld(region.x) + w / 2;
  const z = toWorld(region.y) + d / 2;

  const baseEmissive = isMapNight ? 0.66 : 0;
  const scale = isSelected ? 1.08 : isHovered ? 1.05 : 1.0;
  const emissiveIntensity = isSelected ? 1.02 : isHovered ? 0.82 : baseEmissive;

  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh
        position={[0, height / 2, 0]}
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
          emissiveIntensity={emissiveIntensity}
          roughness={isMapNight ? 0.62 : 0.55}
          metalness={isMapNight ? 0.08 : 0.15}
        />
      </mesh>
      <mesh position={[0, height + 0.005, 0]}>
        <boxGeometry args={[w + 0.01, 0.012, d + 0.01]} />
        <meshStandardMaterial
          color={cfg.color}
          roughness={0.85}
          metalness={0}
          emissive={isMapNight ? cfg.emissive : '#000000'}
          emissiveIntensity={isMapNight ? 0.35 : 0}
        />
      </mesh>
      {!isSelected && (
        <Billboard position={[0, height + 0.45, 0]}>
          <Text
            fontSize={Math.max(0.12, Math.min(0.18, w * 0.25))}
            color={isMapNight ? '#cbd5e1' : '#0f172a'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.035}
            outlineColor={isMapNight ? '#020617' : '#ffffff'}
            maxWidth={w * 2.2}
            lineHeight={1.1}
          >
            {region.name}
          </Text>
        </Billboard>
      )}
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

function Road({ road, isMapNight }: { road: any; isMapNight: boolean }) {
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
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[seg.len, seg.w]} />
            <meshStandardMaterial
              color={isMapNight ? '#25304a' : '#2d3748'}
              roughness={0.95}
              metalness={0}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
            <planeGeometry args={[seg.len * 0.88, seg.w * 0.09]} />
            <meshStandardMaterial
              color={isMapNight ? '#fde68a' : '#ffffff'}
              opacity={isMapNight ? 0.72 : 0.5}
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

function Ground({ isMapNight, onClick }: { isMapNight: boolean; onClick?: () => void }) {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <planeGeometry args={[14, 14, 1, 1]} />
        <meshStandardMaterial
          color={isMapNight ? '#26432c' : '#3d6b42'}
          roughness={0.96}
          metalness={0}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={isMapNight ? '#172117' : '#2d5233'} roughness={1} metalness={0} />
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
  isMapNight,
  hour,
}: {
  regions: any[];
  roads: any[];
  selectedRegion: any;
  onSelectRegion: (r: any) => void;
  isMapNight: boolean;
  hour: number;
}) {
  const orbitRef = useRef<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const flyTargetRef = useRef<FlyTarget | null>(null);
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    if (isMapNight) {
      // Transparent clear — the CSS NightSkyLayer behind the canvas shows through
      scene.background = null;
      gl.setClearColor(0x000000, 0); // fully transparent clear
    } else {
      scene.background = new THREE.Color('#c8dff2');
      gl.setClearColor(0xc8dff2, 1);
    }
  }, [isMapNight, scene, gl]);

  // Calculate Sun Position (Day)
  const sunPos = useMemo(() => {
    const h = Math.max(6, Math.min(18, hour));
    const angle = ((h - 6) / 12) * Math.PI;
    const x = Math.cos(angle) * 12;
    const y = Math.sin(angle) * 10 + 2;
    const z = 6;
    return [x, y, z] as [number, number, number];
  }, [hour]);

  // Calculate Sun Color/Intensity for Sunrise/Noon/Sunset transitions
  const sunColor = useMemo(() => {
    const h = Math.max(6, Math.min(18, hour));
    if (h < 7.5) return '#ffaa44'; // Sunrise
    if (h > 16.5) return '#ff7733'; // Sunset
    if (h < 9 || h > 15) return '#ffe3a0'; // Soft daylight
    return '#ffffff';
  }, [hour]);

  const sunIntensity = useMemo(() => {
    const h = Math.max(6, Math.min(18, hour));
    const angle = ((h - 6) / 12) * Math.PI;
    // Rises faster in the morning using a square root (pow 0.5) to keep morning bright
    return Math.pow(Math.sin(angle), 0.5) * 1.3 + 0.4;
  }, [hour]);

  // Calculate Moon Position (Night)
  const moonPos = useMemo(() => {
    let h = hour;
    if (h < 6) h += 24;
    const clampedH = Math.max(18, Math.min(30, h));
    const angle = ((clampedH - 18) / 12) * Math.PI;
    const x = Math.cos(angle) * 12;
    const y = Math.sin(angle) * 10 + 2;
    const z = -6;
    return [x, y, z] as [number, number, number];
  }, [hour]);

  useFrame((state) => {
    const ft = flyTargetRef.current;
    if (!ft) return;

    if (orbitRef.current) {
      orbitRef.current.enabled = false; // Disable controls during flight animation
    }

    // Clamp delta to prevent issues under lag
    const delta = Math.min(state.clock.getDelta(), 0.1);
    // Frame-rate independent LERP factor
    const lerpFactor = 1 - Math.exp(-3.71 * delta);

    camera.position.lerp(ft.camPos, lerpFactor);
    if (orbitRef.current) {
      orbitRef.current.target.lerp(ft.lookAt, lerpFactor);
      orbitRef.current.update();
    }

    if (
      camera.position.distanceTo(ft.camPos) < 0.08 &&
      (!orbitRef.current || orbitRef.current.target.distanceTo(ft.lookAt) < 0.08)
    ) {
      flyTargetRef.current = null;
      if (orbitRef.current) {
        orbitRef.current.enabled = true; // Re-enable controls after flight completes
      }
    }
  });

  const handleSelect = useCallback(
    (region: any) => {
      const isSame = (selectedRegion?._id || selectedRegion?.id) === (region._id || region.id);
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
        flyTargetRef.current = {
          lookAt: new THREE.Vector3(0, 0, 0),
          camPos: new THREE.Vector3(8, 8, 8),
        };
      }
    },
    [selectedRegion, onSelectRegion]
  );

  const handleReset = useCallback(() => {
    onSelectRegion(null);
    flyTargetRef.current = {
      lookAt: new THREE.Vector3(0, 0, 0),
      camPos: new THREE.Vector3(8, 8, 8),
    };
  }, [onSelectRegion]);

  return (
    <>
      {/* Day sky — removed in night so sky pixels are transparent (shows CSS layer) */}
      {!isMapNight && (
        <Sky
          sunPosition={sunPos}
          turbidity={6}
          rayleigh={0.8}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}

      {/* Fog — day only; night has no fog so depth doesn't hide buildings */}
      {!isMapNight && <fog attach="fog" color="#c8dff2" near={18} far={38} />}

      {/* Lighting */}
      {isMapNight ? (
        <>
          <ambientLight intensity={0.18} color="#1a2636" />
          <directionalLight
            position={moonPos}
            intensity={0.4}
            color="#a5c4ff"
          />
          <hemisphereLight args={['#0c1424', '#0d180d', 0.25]} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.85} />
          <hemisphereLight args={['#ffffff', '#5c9c64', 0.75]} />
          <directionalLight
            position={sunPos}
            intensity={sunIntensity * 1.8}
            color={sunColor}
          />
          <pointLight position={[-7, 6, -7]} intensity={0.5} color="#ffe4b5" />
        </>
      )}

      <Ground isMapNight={isMapNight} onClick={handleReset} />
      {roads.map((road) => (
        <Road key={road._id || road.id} road={road} isMapNight={isMapNight} />
      ))}
      {regions.map((region) => (
        <Building
          key={region._id || region.id}
          region={region}
          isSelected={(selectedRegion?._id || selectedRegion?.id) === (region._id || region.id)}
          isHovered={hoveredId === (region._id || region.id)}
          isMapNight={isMapNight}
          onClick={() => handleSelect(region)}
          onHover={() => setHoveredId(region._id || region.id)}
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

  // Track current local time and date
  const [timeData, setTimeData] = useState(() => {
    const now = new Date();
    return {
      hour: now.getHours() + now.getMinutes() / 60,
      timestamp: now.getTime(),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeData({
        hour: now.getHours() + now.getMinutes() / 60,
        timestamp: now.getTime(),
      });
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Calculate moon phase (0 to 29.53 days)
  const moonPhase = useMemo(() => {
    const msPerDay = 86400000;
    const baseDate = new Date(2000, 0, 6, 18, 14, 0); // known New Moon
    const diff = timeData.timestamp - baseDate.getTime();
    return (diff / msPerDay) % 29.530588853;
  }, [timeData.timestamp]);

  const isMapNight = timeData.hour < 6 || timeData.hour >= 18;

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-border shadow-2xl">
      {/* Night sky layer — sits BEHIND the canvas (zIndex 0).
          Stars/moon are visible only through sky pixels where no 3D geometry
          is drawn. Buildings & ground are solid WebGL geometry → block this layer. */}
      {isMapNight && <NightSkyLayer phase={moonPhase} />}

      {/* Canvas at zIndex 1, alpha:true so sky is transparent in night */}
      <Canvas
        shadows={false}
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        dpr={1}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      >
        <InnerScene
          regions={regions}
          roads={roads}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
          isMapNight={isMapNight}
          hour={timeData.hour}
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
