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
    if (!startRegion || !endRegion || roads.length === 0) {
      setPathPoints([]);
      return;
    }

    const startCenter = {
      x: startRegion.x + startRegion.width / 2,
      y: startRegion.y + startRegion.height / 2,
    };

    const endCenter = {
      x: endRegion.x + endRegion.width / 2,
      y: endRegion.y + endRegion.height / 2,
    };

    // 1. Build the graph of road points
    const graph = new Map<string, {x: number, y: number, neighbors: string[]}>();
    
    const ptKey = (p: {x: number, y: number}) => `${p.x},${p.y}`;
    const dist = (p1: {x: number, y: number}, p2: {x: number, y: number}) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    roads.forEach(road => {
      for (let i = 0; i < road.points.length; i++) {
        const p = road.points[i];
        const key = ptKey(p);
        if (!graph.has(key)) {
          graph.set(key, { ...p, neighbors: [] });
        }
        if (i > 0) {
          const prev = road.points[i - 1];
          const prevKey = ptKey(prev);
          graph.get(key)!.neighbors.push(prevKey);
          graph.get(prevKey)!.neighbors.push(key);
        }
      }
    });

    // 2. Find closest start and end points on the road network
    let startNodeKey = '';
    let endNodeKey = '';
    let minStartDist = Infinity;
    let minEndDist = Infinity;

    for (const [key, node] of Array.from(graph.entries())) {
      const dStart = dist(node, startCenter);
      const dEnd = dist(node, endCenter);
      if (dStart < minStartDist) { minStartDist = dStart; startNodeKey = key; }
      if (dEnd < minEndDist) { minEndDist = dEnd; endNodeKey = key; }
    }

    if (!startNodeKey || !endNodeKey) {
      setPathPoints([startCenter, endCenter]);
      return;
    }

    // 3. A* Algorithm
    const openSet = new Set([startNodeKey]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    for (const key of Array.from(graph.keys())) {
      gScore.set(key, Infinity);
      fScore.set(key, Infinity);
    }
    
    gScore.set(startNodeKey, 0);
    fScore.set(startNodeKey, dist(graph.get(startNodeKey)!, graph.get(endNodeKey)!));

    let currentKey = '';
    let found = false;

    while (openSet.size > 0) {
      // Get node in openSet with lowest fScore
      let minF = Infinity;
      for (const key of Array.from(openSet)) {
        const f = fScore.get(key) || Infinity;
        if (f < minF) { minF = f; currentKey = key; }
      }

      if (currentKey === endNodeKey) {
        found = true;
        break;
      }

      openSet.delete(currentKey);
      const current = graph.get(currentKey)!;

      for (const neighborKey of current.neighbors) {
        const neighbor = graph.get(neighborKey)!;
        const tentativeG = (gScore.get(currentKey) || Infinity) + dist(current, neighbor);
        
        if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + dist(neighbor, graph.get(endNodeKey)!));
          if (!openSet.has(neighborKey)) {
            openSet.add(neighborKey);
          }
        }
      }
    }

    // 4. Reconstruct path
    if (found) {
      const path = [];
      let curr = endNodeKey;
      while (cameFrom.has(curr)) {
        path.push(graph.get(curr)!);
        curr = cameFrom.get(curr)!;
      }
      path.push(graph.get(startNodeKey)!);
      path.reverse();

      setPathPoints([startCenter, ...path, endCenter]);
    } else {
      // Fallback
      setPathPoints([startCenter, graph.get(startNodeKey)!, graph.get(endNodeKey)!, endCenter]);
    }

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
