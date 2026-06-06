'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Save,
  Edit3,
  X,
  ZoomIn,
  ZoomOut,
  Route,
  Square,
  RotateCcw,
  Box,
  Map,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@/lib/dataClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Shared config and types
import {
  MapRegion,
  MapRoad,
  defaultRegions,
  defaultRoads,
  categories,
} from './components/mapConfig';

// Subcomponents
import EditRegionModal from './components/EditRegionModal';

const CampusMap3D = dynamic(
  () => import('@/features/campus-map/CampusMap3D').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
);

type DrawMode = 'none' | 'building' | 'road';
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

export default function CampusMap() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'college_admin';

  const [regions, setRegions] = useState<MapRegion[]>([]);
  const [roads, setRoads] = useState<MapRoad[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [newRegion, setNewRegion] = useState<Partial<MapRegion> | null>(null);
  const [newRoad, setNewRoad] = useState<Partial<MapRoad> | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Resize and drag state
  const [resizing, setResizing] = useState<{ region: MapRegion; handle: ResizeHandle } | null>(
    null
  );
  const [dragging, setDragging] = useState<{
    region: MapRegion;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInnerRef = useRef<HTMLDivElement>(null);
  const [editingRegion, setEditingRegion] = useState<MapRegion | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgId = user?.organizationId;

        // Fetch regions
        let regionsQuery = collection(db, 'campusMapRegions');
        if (orgId) {
          regionsQuery = query(
            collection(db, 'campusMapRegions'),
            where('organizationId', '==', orgId)
          ) as any;
        }
        const regionsSnap = await getDocs(regionsQuery);

        // Fetch roads
        let roadsQuery = collection(db, 'campusMapRoads');
        if (orgId) {
          roadsQuery = query(
            collection(db, 'campusMapRoads'),
            where('organizationId', '==', orgId)
          ) as any;
        }
        const roadsSnap = await getDocs(roadsQuery);

        if (regionsSnap.empty) {
          setRegions(
            defaultRegions.map((r, i) => ({
              ...r,
              id: `default-${i}`,
              organizationId: orgId || '',
            }))
          );
        } else {
          setRegions(regionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MapRegion));
        }

        if (roadsSnap.empty) {
          setRoads(
            defaultRoads.map((r, i) => ({ ...r, id: `road-${i}`, organizationId: orgId || '' }))
          );
        } else {
          setRoads(roadsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MapRoad));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setRegions(
          defaultRegions.map((r, i) => ({ ...r, id: `default-${i}`, organizationId: '' }))
        );
        setRoads(defaultRoads.map((r, i) => ({ ...r, id: `road-${i}`, organizationId: '' })));
      }
    };
    fetchData();
  }, [user?.organizationId]);

  // Grid size (2% = 50 cells)
  const GRID_SIZE = 2;

  // Snap value to grid
  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  // Get mouse position as percentage (snapped to grid)
  const getMousePos = useCallback((e: React.MouseEvent, snap = true) => {
    const rect = mapInnerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    if (snap) {
      x = snapToGrid(x);
      y = snapToGrid(y);
    }
    return { x, y };
  }, []);

  // Mouse down handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return;

      const pos = getMousePos(e);

      if (drawMode === 'building') {
        setDrawStart(pos);
        setNewRegion({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          name: '',
          description: '',
          category: 'academic',
        });
      } else if (drawMode === 'road') {
        // For polyline roads: start with first point
        if (!newRoad || !newRoad.points || newRoad.points.length === 0) {
          setDrawStart(pos);
          setNewRoad({ points: [pos], width: 2 });
        } else {
          // Add new waypoint to existing road being drawn
          const lastPoint = newRoad.points[newRoad.points.length - 1];
          const dx = Math.abs(pos.x - lastPoint.x);
          const dy = Math.abs(pos.y - lastPoint.y);
          // Snap to horizontal or vertical from last point
          const newPoint = dx >= dy ? { x: pos.x, y: lastPoint.y } : { x: lastPoint.x, y: pos.y };
          setNewRoad((prev) => ({ ...prev, points: [...(prev?.points || []), newPoint] }));
        }
      }
    },
    [editMode, drawMode, getMousePos, newRoad]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = getMousePos(e);

      if (drawStart && drawMode === 'building' && newRegion) {
        const width = snapToGrid(Math.abs(pos.x - drawStart.x));
        const height = snapToGrid(Math.abs(pos.y - drawStart.y));
        const x = Math.min(pos.x, drawStart.x);
        const y = Math.min(pos.y, drawStart.y);
        setNewRegion((prev) => ({ ...prev, x, y, width, height }));
      } else if (
        drawStart &&
        drawMode === 'road' &&
        newRoad &&
        newRoad.points &&
        newRoad.points.length > 0
      ) {
        // Preview next segment from last point
        const lastPoint = newRoad.points[newRoad.points.length - 1];
        const dx = Math.abs(pos.x - lastPoint.x);
        const dy = Math.abs(pos.y - lastPoint.y);
        // Show preview line snapped to horizontal or vertical
        const previewPoint = dx >= dy ? { x: pos.x, y: lastPoint.y } : { x: lastPoint.x, y: pos.y };
        setNewRoad((prev) => ({ ...prev, previewPoint }));
      } else if (resizing) {
        // Handle resize
        const { region, handle } = resizing;
        let newX = region.x,
          newY = region.y,
          newW = region.width,
          newH = region.height;

        if (handle === 'se') {
          newW = snapToGrid(Math.max(4, pos.x - region.x));
          newH = snapToGrid(Math.max(4, pos.y - region.y));
        } else if (handle === 'sw') {
          newW = snapToGrid(Math.max(4, region.x + region.width - pos.x));
          newX = snapToGrid(Math.min(pos.x, region.x + region.width - 4));
          newH = snapToGrid(Math.max(4, pos.y - region.y));
        } else if (handle === 'ne') {
          newW = snapToGrid(Math.max(4, pos.x - region.x));
          newH = snapToGrid(Math.max(4, region.y + region.height - pos.y));
          newY = snapToGrid(Math.min(pos.y, region.y + region.height - 4));
        } else if (handle === 'nw') {
          newW = snapToGrid(Math.max(4, region.x + region.width - pos.x));
          newX = snapToGrid(Math.min(pos.x, region.x + region.width - 4));
          newH = snapToGrid(Math.max(4, region.y + region.height - pos.y));
          newY = snapToGrid(Math.min(pos.y, region.y + region.height - 4));
        }

        setRegions((prev) =>
          prev.map((r) =>
            r.id === region.id ? { ...r, x: newX, y: newY, width: newW, height: newH } : r
          )
        );
      } else if (dragging) {
        // Handle drag/move building
        const { region, offsetX, offsetY } = dragging;
        const newX = snapToGrid(Math.max(0, Math.min(100 - region.width, pos.x - offsetX)));
        const newY = snapToGrid(Math.max(0, Math.min(100 - region.height, pos.y - offsetY)));

        setRegions((prev) =>
          prev.map((r) => (r.id === region.id ? { ...r, x: newX, y: newY } : r))
        );
      }
    },
    [drawStart, drawMode, newRegion, newRoad, resizing, dragging, getMousePos]
  );

  const handleMouseUp = useCallback(async () => {
    if (
      newRegion &&
      newRegion.width &&
      newRegion.height &&
      newRegion.width > 2 &&
      newRegion.height > 2
    ) {
      setEditingRegion({
        id: '',
        name: '',
        description: '',
        category: 'academic',
        x: newRegion.x || 0,
        y: newRegion.y || 0,
        width: newRegion.width || 5,
        height: newRegion.height || 5,
      });
    }

    // Don't auto-save road on mouseUp - wait for double-click to finish road

    // Mark as having unsaved changes if something was moved/resized
    if (resizing || dragging) {
      setHasUnsavedChanges(true);
    }

    setDrawStart(null);
    setNewRegion(null);
    setNewRoad(null);
    setResizing(null);
    setDragging(null);
    if (!newRoad || !newRoad.points || newRoad.points.length < 2) {
      setDrawMode('none');
    }
  }, [newRegion, newRoad, drawStart, resizing, dragging]);

  // Save region
  const saveRegion = async () => {
    if (!editingRegion || !editingRegion.name) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const regionData = { ...editingRegion, organizationId: user?.organizationId || '' };

      if (editingRegion.id && !editingRegion.id.startsWith('default-')) {
        // Update existing region record
        await updateDoc(doc(db, 'campusMapRegions', editingRegion.id), regionData);
        setRegions((prev) =>
          prev.map((r) => (r.id === editingRegion.id ? { ...regionData, id: editingRegion.id } : r))
        );
        toast.success('Region updated!');
      } else {
        // Create new region (replace only THIS default region, keep others)
        const docRef = await addDoc(collection(db, 'campusMapRegions'), regionData);
        setRegions((prev) => [
          ...prev.filter((r) => r.id !== editingRegion.id), // Remove only the one being saved
          { ...regionData, id: docRef.id },
        ]);
        toast.success('Region added!');
      }
      setEditingRegion(null);
    } catch (error) {
      console.error('Error saving region:', error);
      toast.error('Failed to save');
    }
  };

  // Finish and save polyline road
  const finishRoad = () => {
    if (!newRoad || !newRoad.points || newRoad.points.length < 2) {
      toast.error('Need at least 2 points to create a road');
      return;
    }

    // Create new road with clean data - ensure points are simple {x, y} objects
    const cleanPoints = newRoad.points.map((p) => ({ x: Number(p.x), y: Number(p.y) }));
    const roadData: MapRoad = {
      id: `road-new-${Date.now()}`,
      points: cleanPoints,
      width: newRoad.width || 2,
      organizationId: user?.organizationId || '',
    };

    // Add to state
    setRoads((prevRoads) => {
      const newRoads = [...prevRoads, roadData];

      return newRoads;
    });

    // Mark as needing save and reset drawing state
    setHasUnsavedChanges(true);
    setNewRoad(null);
    setDrawStart(null);
    setDrawMode('none');
    toast.success('Road created! Click Save to persist.');
  };

  // Save all changes to backend
  const saveAllChanges = async () => {
    if (!user?.organizationId) {
      toast.error('No organization ID');
      return;
    }

    try {
      const orgId = user.organizationId;

      // First, delete all existing regions and roads for this org
      const existingRegions = await getDocs(
        query(collection(db, 'campusMapRegions'), where('organizationId', '==', orgId))
      );
      const existingRoads = await getDocs(
        query(collection(db, 'campusMapRoads'), where('organizationId', '==', orgId))
      );

      for (const docSnap of existingRegions.docs) {
        await deleteDoc(doc(db, 'campusMapRegions', docSnap.id));
      }
      for (const docSnap of existingRoads.docs) {
        await deleteDoc(doc(db, 'campusMapRoads', docSnap.id));
      }

      // Now save all current regions
      const savedRegions: MapRegion[] = [];
      for (const region of regions) {
        const { id, ...data } = region;
        const newDoc = await addDoc(collection(db, 'campusMapRegions'), {
          ...data,
          organizationId: orgId,
        });
        savedRegions.push({ ...data, id: newDoc.id, organizationId: orgId });
      }

      // Save all current roads
      const savedRoads: MapRoad[] = [];
      for (const road of roads) {
        if (!road.points || road.points.length < 2) continue;
        const { id, ...data } = road;
        const newDoc = await addDoc(collection(db, 'campusMapRoads'), {
          ...data,
          organizationId: orgId,
        });
        savedRoads.push({ ...data, id: newDoc.id, organizationId: orgId });
      }

      // Update local state with new IDs
      setRegions(savedRegions);
      setRoads(savedRoads);
      setHasUnsavedChanges(false);
      toast.success('All changes saved!');
    } catch (error) {
      console.error('Error saving all changes:', error);
      toast.error('Failed to save changes');
    }
  };

  // Delete road
  const deleteRoad = async (id: string) => {
    try {
      if (!id.startsWith('road-')) {
        await deleteDoc(doc(db, 'campusMapRoads', id));
      }
      setRoads((prev) => prev.filter((r) => r.id !== id));
      toast.success('Road deleted');
    } catch (error) {
      toast.error('Failed to delete road');
    }
  };

  // Delete region
  const deleteRegion = async (id: string) => {
    try {
      if (!id.startsWith('default-')) {
        await deleteDoc(doc(db, 'campusMapRegions', id));
      }
      setRegions((prev) => prev.filter((r) => r.id !== id));
      setSelectedRegion(null);
      toast.success('Region deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getCategoryStyles = (cat: string) => {
    return (
      categories.find((c) => c.id === cat) || {
        regionVars: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
        badgeVars: 'bg-gray-600',
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Campus Map
            </h1>
            <p className="text-sm text-muted-foreground">Interactive campus layout</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card">
              <Button
                variant={viewMode === '2d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('2d')}
                className="gap-1 h-7 px-2 text-xs"
              >
                <Map className="w-3.5 h-3.5" /> 2D
              </Button>
              <Button
                variant={viewMode === '3d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('3d')}
                className="gap-1 h-7 px-2 text-xs"
              >
                <Box className="w-3.5 h-3.5" /> 3D
              </Button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Admin Tools */}
            {isAdmin && (
              <>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={drawMode === 'building' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDrawMode(drawMode === 'building' ? 'none' : 'building')}
                      className="gap-1"
                    >
                      <Square className="w-4 h-4" />
                      Building
                    </Button>
                    <Button
                      variant={drawMode === 'road' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDrawMode(drawMode === 'road' ? 'none' : 'road')}
                      className="gap-1"
                    >
                      <Route className="w-4 h-4" />
                      Road
                    </Button>
                    {/* Finish Road button - shown when actively drawing a road */}
                    {newRoad && newRoad.points && newRoad.points.length >= 2 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={finishRoad}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                        Finish Road
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Reset to defaults
                        const orgId = user?.organizationId || '';
                        setRegions(
                          defaultRegions.map((r, i) => ({
                            ...r,
                            id: `default-${i}`,
                            organizationId: orgId,
                          }))
                        );
                        setRoads(
                          defaultRoads.map((r, i) => ({
                            ...r,
                            id: `road-${i}`,
                            organizationId: orgId,
                          }))
                        );
                        setHasUnsavedChanges(true); // Mark as needing save
                        toast.success('Map reset to defaults! Click Save to persist.');
                      }}
                      className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                    {/* Save Changes button - shown when there are unsaved changes */}
                    {hasUnsavedChanges && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={saveAllChanges}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMode(false);
                        setDrawMode('none');
                        setNewRoad(null);
                        setDrawStart(null);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Map
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mb-3">
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <span className={cn('w-3 h-3 rounded-full', cat.badgeVars)} />
              <span className="text-xs text-muted-foreground">{cat.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-2 rounded bg-zinc-700 dark:bg-zinc-300" />
            <span className="text-xs text-muted-foreground">Roads</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-7xl mx-auto">
        {viewMode === '3d' ? (
          <Suspense
            fallback={
              <div className="w-full h-[600px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <CampusMap3D
              regions={regions}
              roads={roads}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          </Suspense>
        ) : (
          <div
            ref={mapContainerRef}
            className={cn(
              'relative rounded-xl border border-border overflow-auto bg-card',
              drawMode !== 'none' && 'cursor-crosshair'
            )}
            style={{ maxHeight: '75vh' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (drawStart || resizing) handleMouseUp();
            }}
          >
            <div
              ref={mapInnerRef}
              className="relative bg-green-100 dark:bg-zinc-900 w-full h-[700px]"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: zoom > 1 ? `${100 / zoom}%` : '100%',
              }}
            >
              {/* Grass texture */}
              <div
                className="absolute inset-0 opacity-10 dark:opacity-5"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Grid overlay - visible in edit mode */}
              {editMode && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Vertical grid lines */}
                  {Array.from({ length: 51 }, (_, i) => i * 2).map((x) => (
                    <line
                      key={`v-${x}`}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={100}
                      stroke="currentColor"
                      strokeWidth="0.1"
                    />
                  ))}
                  {/* Horizontal grid lines */}
                  {Array.from({ length: 51 }, (_, i) => i * 2).map((y) => (
                    <line
                      key={`h-${y}`}
                      x1={0}
                      y1={y}
                      x2={100}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.1"
                    />
                  ))}
                </svg>
              )}

              {/* Roads - Dark asphalt with white lane markings */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {roads.map((road) => {
                  // Skip roads without valid points array (legacy format)
                  if (!road.points || !Array.isArray(road.points) || road.points.length < 2) {
                    return null;
                  }
                  // Convert points array to SVG polyline points string
                  const pointsStr = road.points.map((p) => `${p.x},${p.y}`).join(' ');
                  return (
                    <g key={road.id}>
                      {/* Road base (dark asphalt) */}
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="#374151"
                        className="dark:stroke-zinc-500"
                        strokeWidth={`${road.width}%`}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* White dashed center line */}
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="white"
                        strokeWidth="0.3%"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2 1"
                        className="opacity-70"
                      />
                    </g>
                  );
                })}

                {/* Drawing preview for road polyline */}
                {newRoad && newRoad.points && newRoad.points.length > 0 && (
                  <g>
                    {/* Drawn segments */}
                    <polyline
                      points={newRoad.points.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2%"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Preview segment to cursor */}
                    {(newRoad as any).previewPoint && (
                      <line
                        x1={newRoad.points[newRoad.points.length - 1].x}
                        y1={newRoad.points[newRoad.points.length - 1].y}
                        x2={(newRoad as any).previewPoint.x}
                        y2={(newRoad as any).previewPoint.y}
                        stroke="#3b82f6"
                        strokeWidth="2%"
                        strokeLinecap="round"
                        strokeDasharray="1 1"
                        opacity="0.5"
                      />
                    )}
                    {/* Point markers */}
                    {newRoad.points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="0.8" fill="#3b82f6" />
                    ))}
                  </g>
                )}
              </svg>

              {/* Regions */}
              {regions.map((region) => {
                const styles = getCategoryStyles(region.category);

                return (
                  <div
                    key={region.id}
                    onMouseDown={(e) => {
                      if (editMode && !resizing && drawMode === 'none') {
                        e.stopPropagation();
                        // Calculate offset from click to region corner
                        const rect = mapInnerRef.current?.getBoundingClientRect();
                        if (rect) {
                          const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                          const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                          setDragging({
                            region,
                            offsetX: clickX - region.x,
                            offsetY: clickY - region.y,
                          });
                        }
                      }
                    }}
                    onClick={() => {
                      if (editMode && !resizing && !dragging) {
                        setEditingRegion(region);
                      } else if (!editMode) {
                        setSelectedRegion(region);
                      }
                    }}
                    className={cn(
                      'absolute rounded border-2 shadow-sm transition-all duration-200 flex items-center justify-center p-1 text-center overflow-hidden',
                      drawMode !== 'none'
                        ? 'pointer-events-none'
                        : editMode
                          ? 'cursor-move'
                          : 'cursor-pointer',
                      'hover:shadow-lg',
                      styles.regionVars,
                      selectedRegion?.id === region.id &&
                        'ring-2 ring-primary ring-offset-2 z-20 scale-105',
                      editMode && drawMode === 'none' && 'ring-1 ring-dashed ring-primary/50',
                      dragging?.region.id === region.id && 'z-50 opacity-90'
                    )}
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                    }}
                  >
                    <span className="text-[8px] md:text-[10px] font-semibold leading-tight text-foreground/80 pointer-events-none select-none">
                      {region.name}
                    </span>

                    {/* Resize handles - only shown in edit mode */}
                    {editMode && (
                      <>
                        {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
                          <div
                            key={handle}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setResizing({ region, handle });
                            }}
                            className={cn(
                              'absolute w-4 h-4 bg-primary border-2 border-white rounded-full cursor-nwse-resize z-30 shadow-lg',
                              handle === 'nw' && 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
                              handle === 'ne' &&
                                'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
                              handle === 'sw' &&
                                'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
                              handle === 'se' && 'bottom-0 right-0 translate-x-1/2 translate-y-1/2'
                            )}
                          />
                        ))}
                      </>
                    )}
                  </div>
                );
              })}

              {/* New region preview */}
              {newRegion && newRegion.width && newRegion.height && (
                <div
                  className="absolute border-2 border-dashed border-primary bg-primary/20 rounded pointer-events-none"
                  style={{
                    left: `${newRegion.x}%`,
                    top: `${newRegion.y}%`,
                    width: `${newRegion.width}%`,
                    height: `${newRegion.height}%`,
                  }}
                />
              )}

              {/* Road delete markers in edit mode - one per segment */}
              {editMode &&
                roads.map((road) => {
                  // Skip roads without valid points
                  if (!road.points || !Array.isArray(road.points) || road.points.length < 2) {
                    return null;
                  }
                  // Create a delete button for EACH segment of the road
                  return road.points.slice(0, -1).map((point, segmentIndex) => {
                    const nextPoint = road.points[segmentIndex + 1];
                    const midX = (point.x + nextPoint.x) / 2;
                    const midY = (point.y + nextPoint.y) / 2;
                    return (
                      <button
                        key={`del-${road.id}-seg-${segmentIndex}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoad(road.id);
                        }}
                        className="absolute w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs z-30 hover:scale-110 transition-transform"
                        style={{
                          left: `${midX}%`,
                          top: `${midY}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        title={`Delete road (segment ${segmentIndex + 1})`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    );
                  });
                })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Region Info */}
      <AnimatePresence>
        {selectedRegion && !editMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-card rounded-xl border border-border shadow-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedRegion.name}</h3>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {selectedRegion.category}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedRegion(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{selectedRegion.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Region Modal */}
      <EditRegionModal
        editingRegion={editingRegion}
        setEditingRegion={setEditingRegion}
        onSave={saveRegion}
        onDelete={deleteRegion}
        categories={categories}
      />

      {/* Edit Mode Hint */}
      {editMode && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Edit Mode</strong>
            <br />
            {drawMode === 'building' && 'Click & drag to draw a building'}
            {drawMode === 'road' && 'Click & drag to draw a road'}
            {drawMode === 'none' &&
              'Select Building or Road tool, or click a region to edit. Drag corners to resize.'}
          </p>
        </div>
      )}
    </div>
  );
}
