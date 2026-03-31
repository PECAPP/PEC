'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const categoryColors: Record<string, string> = {
  academic: '#3b82f6',
  hostel: '#10b981',
  sports: '#ef4444',
  food: '#f97316',
  admin: '#8b5cf6',
};

function Building({ region, onClick }: { region: any; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = categoryColors[region.category] || '#6b7280';
  const height = 0.3 + Math.random() * 0.5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = height / 2 + Math.sin(state.clock.elapsedTime * 0.5 + region.x * 0.1) * 0.02;
    }
  });

  return (
    <group position={[region.x / 10 - 5, 0, region.y / 10 - 5]} onClick={onClick}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[region.width / 10, height, region.height / 10]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {region.name}
      </Text>
    </group>
  );
}

function Road({ road }: { road: any }) {
  const points = useMemo(() => {
    if (!road.points || !Array.isArray(road.points)) return [];
    return road.points.map((p: any) => new THREE.Vector3(p.x / 10 - 5, 0.01, p.y / 10 - 5));
  }, [road.points]);

  if (points.length < 2) return null;

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 4, road.width / 200, 4, false);

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial color="#374151" roughness={0.9} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#4ade80" roughness={0.9} />
    </mesh>
  );
}

export default function CampusMap3D({ regions, roads, selectedRegion, onSelectRegion }: {
  regions: any[];
  roads: any[];
  selectedRegion: any;
  onSelectRegion: (region: any) => void;
}) {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border">
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.3} />
        <Ground />
        {roads.map((road) => (
          <Road key={road.id} road={road} />
        ))}
        {regions.map((region) => (
          <Building
            key={region.id}
            region={region}
            onClick={() => onSelectRegion(region)}
          />
        ))}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
