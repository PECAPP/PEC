import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapRegion, MapRoad } from './mapConfig';

interface MapRoutingProps {
  startRegion: MapRegion | null;
  endRegion: MapRegion | null;
  roads: MapRoad[];
  containerWidth: number;
  containerHeight: number;
}

export function MapRouting({ startRegion, endRegion, roads, containerWidth, containerHeight }: MapRoutingProps) {
  const [pathPoints, setPathPoints] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    if (!startRegion || !endRegion) {
      setPathPoints([]);
      return;
    }

    // A simple mock routing that connects start center -> a road -> end center
    // In a real app, you'd use A* or Dijkstra on the road network
    const startCenter = {
      x: startRegion.x + startRegion.width / 2,
      y: startRegion.y + startRegion.height / 2,
    };

    const endCenter = {
      x: endRegion.x + endRegion.width / 2,
      y: endRegion.y + endRegion.height / 2,
    };

    // Find closest road point to start
    let closestStartRoadPoint = startCenter;
    let closestEndRoadPoint = endCenter;
    let minStartDist = Infinity;
    let minEndDist = Infinity;

    roads.forEach(road => {
      road.points.forEach(p => {
        const dStart = Math.hypot(p.x - startCenter.x, p.y - startCenter.y);
        const dEnd = Math.hypot(p.x - endCenter.x, p.y - endCenter.y);
        if (dStart < minStartDist) { minStartDist = dStart; closestStartRoadPoint = p; }
        if (dEnd < minEndDist) { minEndDist = dEnd; closestEndRoadPoint = p; }
      });
    });

    setPathPoints([
      startCenter,
      closestStartRoadPoint,
      closestEndRoadPoint,
      endCenter
    ]);

  }, [startRegion, endRegion, roads]);

  if (pathPoints.length < 2) return null;

  const pathData = `M ${pathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  return (
    <svg className="absolute inset-0 pointer-events-none z-40 w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background track */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(59, 130, 246, 0.2)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Animated glowing path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#routeGradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Animated pulses on the path */}
      <motion.circle
        r="1"
        fill="#ffffff"
        filter="url(#glow)"
      >
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={pathData}
        />
      </motion.circle>
    </svg>
  );
}
