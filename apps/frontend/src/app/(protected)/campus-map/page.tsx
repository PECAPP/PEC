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
import { Button, AppShellSkeleton, PageBanner, Badge } from "@pec/ui";
import { cn } from '@/lib/utils';
import { api } from '@pec/api';
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
import { MapSearchOverlay } from './components/MapSearchOverlay';
import { MapRouting } from './components/MapRouting';

const CampusMap3D = dynamic(
  () => import('@/features/campus-map/CampusMap3D').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center">
        <AppShellSkeleton />
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
  const [routingStart, setRoutingStart] = useState<MapRegion | null>(null);
  const [routingEnd, setRoutingEnd] = useState<MapRegion | null>(null);

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

        let regionsSnap: any = { empty: true, docs: [] };
        try {
          const { data: raw } = await api.get('/campusMapRegions' + (orgId ? '?organizationId=' + orgId : ''));
          const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
          regionsSnap = { empty: arr.length === 0, docs: arr.map((d: any) => ({ id: d.id, data: () => d })) };
        } catch(e) { console.error('regions fetch err', e); }
        
        // Fetch roads
        let roadsSnap: any = { empty: true, docs: [] };
        try {
          const { data: raw } = await api.get('/campusMapRoads' + (orgId ? '?organizationId=' + orgId : ''));
          const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
          roadsSnap = { empty: arr.length === 0, docs: arr.map((d: any) => ({ id: d.id, data: () => d })) };
        } catch(e) { console.error('roads fetch err', e); }
        if (regionsSnap.empty) {
          setRegions(
            defaultRegions.map((r, i) => ({
              ...r,
              id: `default-${i}`,
              organizationId: orgId || '',
            }))
          );
        } else {
          setRegions(regionsSnap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }) as MapRegion));
        }

        if (roadsSnap.empty) {
          setRoads(
            defaultRoads.map((r, i) => ({ ...r, id: `road-${i}`, organizationId: orgId || '' }))
          );
        } else {
          setRoads(roadsSnap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }) as MapRoad));
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
            (r._id || r.id) === (region._id || region.id) ? { ...r, x: newX, y: newY, width: newW, height: newH } : r
          )
        );
      } else if (dragging) {
        // Handle drag/move building
        const { region, offsetX, offsetY } = dragging;
        const newX = snapToGrid(Math.max(0, Math.min(100 - region.width, pos.x - offsetX)));
        const newY = snapToGrid(Math.max(0, Math.min(100 - region.height, pos.y - offsetY)));

        setRegions((prev) =>
          prev.map((r) => ((r._id || r.id) === (region._id || region.id) ? { ...r, x: newX, y: newY } : r))
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
        _id: '',
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
      const regionId = editingRegion._id || editingRegion.id;

      if (regionId && !regionId.startsWith('default-')) {
        // Update existing region record
        await api.patch('/campusMapRegions/' + regionId, regionData);
        setRegions(prev => prev.map(r => (r._id || r.id) === regionId ? { ...regionData, _id: regionId } : r));
        toast.success('Region updated!');
      } else {
        // Create new region (replace only THIS default region, keep others)
        const { data: docRef } = await api.post('/campusMapRegions', regionData);
        setRegions(prev => [
          ...prev.filter(r => (r._id || r.id) !== regionId), // Remove only the one being saved
          { ...regionData, _id: (docRef?.id || docRef?.data?.id || "new-" + Date.now()) }
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
      _id: `road-new-${Date.now()}`,
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
      const { data: existingRegionsRaw } = await api.get('/campusMapRegions?organizationId=' + orgId);
      const existingRegions = { docs: (Array.isArray(existingRegionsRaw?.data) ? existingRegionsRaw.data : existingRegionsRaw || []).map((d: any) => ({ id: d.id })) };
      const { data: existingRoadsRaw } = await api.get('/campusMapRoads?organizationId=' + orgId);
      const existingRoads = { docs: (Array.isArray(existingRoadsRaw?.data) ? existingRoadsRaw.data : existingRoadsRaw || []).map((d: any) => ({ id: d.id })) };
      for (const docSnap of existingRegions.docs) {
        await api.delete('/campusMapRegions/' + docSnap.id);
      }
      for (const docSnap of existingRoads.docs) {
        await api.delete('/campusMapRoads/' + docSnap.id);
      }

      // Now save all current regions
      const savedRegions: MapRegion[] = [];
      for (const region of regions) {
        const { _id, ...data } = region;
        const { data: newDoc } = await api.post('/campusMapRegions', { ...data, organizationId: orgId });
        savedRegions.push({ ...data, _id: (newDoc?.id || newDoc?.data?.id || "new-" + Date.now()), organizationId: orgId });
      }

      // Save all current roads
      const savedRoads: MapRoad[] = [];
      for (const road of roads) {
        if (!road.points || road.points.length < 2) continue;
        const { _id, ...data } = road;
        const { data: newDoc } = await api.post('/campusMapRoads', { ...data, organizationId: orgId });
        savedRoads.push({ ...data, _id: (newDoc?.id || newDoc?.data?.id || "new-" + Date.now()), organizationId: orgId });
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
        await api.delete('/campusMapRoads/' + id);
      }
      setRoads((prev) => prev.filter((r) => (r._id || r.id) !== id));
      toast.success('Road deleted');
    } catch (_error) {
      toast.error('Failed to delete road');
    }
  };

  // Delete region
  const deleteRegion = async (id: string) => {
    try {
      if (!id.startsWith('default-')) {
        await api.delete('/campusMapRegions/' + id);
      }
      setRegions((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setSelectedRegion(null);
      toast.success('Region deleted');
    } catch (_error) {
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
    <div className="  animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 relative z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" /> Campus Map
        </h1>

      </div>
      {/* Search Overlay */}
      {!editMode && (
        <MapSearchOverlay 
          regions={regions} 
          onSelectRegion={(region) => {
             setSelectedRegion(region);
             setRoutingStart(null);
             setRoutingEnd(null);
             setViewMode('2d');
          }}
          onNavigate={(start, end) => {
             setRoutingStart(start);
             setRoutingEnd(end);
             setSelectedRegion(null);
             setViewMode('2d');
          }}
        />
      )}
      
      {/* Institutional Header */}
      <div className="pt-2 md:pt-6 mb-6">
        <PageBanner
          title="Campus Map"
          subtitle="Interactive campus layout"
          badgeText="Campus Life"
          icon={<MapPin className="w-7 h-7 text-primary" />}
          actions={
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-border rounded-sm p-1 bg-card">
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
              <div className="flex items-center gap-1 border border-border/40 backdrop-blur-md rounded-sm p-1 bg-card/60 shadow-sm relative z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 transition-transform active:scale-95"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs w-10 text-center font-medium">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 transition-transform active:scale-95"
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
          }
        />
      </div>

      {/* Legend */}
      <div className="mb-4">
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
      <div>
        {viewMode === '3d' ? (
          <Suspense
            fallback={
              <div className="w-full h-[600px] flex items-center justify-center">
                <AppShellSkeleton />
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
              'relative rounded-sm border border-border/40 shadow-inner overflow-hidden bg-zinc-100 dark:bg-zinc-950/50',
              drawMode !== 'none' && 'cursor-crosshair',
              !editMode && 'cursor-grab active:cursor-grabbing'
            )}
            style={{ maxHeight: '75vh', height: '700px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (drawStart || resizing) handleMouseUp();
            }}
          >
            <motion.div
              drag={!editMode}
              dragConstraints={mapContainerRef}
              dragElastic={0.2}
              dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
              initial={false}
              animate={{
                scale: zoom,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              ref={mapInnerRef}
              className="relative w-full h-[700px]"
              style={{
                transformOrigin: 'center center',
              }}
            >
              {/* Grid texture for modern aesthetic */}
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
                    <g key={road._id || road.id}>
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

                {/* Routing Path */}
                {viewMode === '2d' && routingStart && routingEnd && (
                  <MapRouting 
                    startRegion={routingStart} 
                    endRegion={routingEnd} 
                    roads={roads} 
                    containerWidth={100} 
                    containerHeight={100} 
                  />
                )}

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
                  <motion.div
                    key={region._id || region.id}
                    layoutId={`region-${region._id || region.id}`}
                    whileHover={!editMode ? { scale: 1.05, zIndex: 30 } : {}}
                    whileTap={!editMode ? { scale: 0.95 } : {}}
                    onMouseDown={(e: React.MouseEvent) => {
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
                      'absolute rounded-sm border shadow-sm transition-colors duration-200 flex items-center justify-center p-1 text-center overflow-hidden backdrop-blur-sm',
                      drawMode !== 'none'
                        ? 'pointer-events-none'
                        : editMode
                          ? 'cursor-move'
                          : 'cursor-pointer',
                      'hover:shadow-xl hover:border-border/40',
                      styles.regionVars,
                      (selectedRegion?._id || selectedRegion?.id) === (region._id || region.id) &&
                        'ring-4 ring-primary/50 ring-offset-2 z-20 shadow-md border border-border/40',
                      editMode && drawMode === 'none' && 'ring-1 ring-dashed ring-primary/50',
                      (dragging?.region._id || dragging?.region.id) === (region._id || region.id) && 'z-50 opacity-90 scale-105'
                    )}
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                    }}
                  >
                    <span className="text-[8px] md:text-sm font-medium leading-tight text-foreground pointer-events-none select-none ">
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
                              'absolute w-4 h-4 bg-primary border border-white rounded-full cursor-nwse-resize z-30 shadow-sm',
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
                  </motion.div>
                );
              })}

              {/* New region preview */}
              {newRegion && newRegion.width && newRegion.height && (
                <div
                  className="absolute border border-dashed border-border/40 bg-primary/20 rounded pointer-events-none"
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
                        key={`del-${road._id || road.id}-seg-${segmentIndex}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoad(road._id || road.id);
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
            </motion.div>
          </div>
        )}
      </div>

      {/* Selected Region Info */}
      <AnimatePresence>
        {selectedRegion && !editMode && (
          <motion.div
            layoutId={`region-${selectedRegion._id || selectedRegion.id}`}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full  px-4"
          >
            <div className="bg-background/80 backdrop-blur-xl rounded-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-3 md:p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-foreground tracking-tight">{selectedRegion.name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize mt-1.5 bg-secondary/50 backdrop-blur-md">
                      {selectedRegion.category}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setSelectedRegion(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground/90 mb-5 leading-relaxed">{selectedRegion.description}</p>
                
                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => {
                     setRoutingStart(regions.find(r => r.name.toLowerCase().includes('gate')) || regions[0] || null);
                     setRoutingEnd(selectedRegion);
                     setSelectedRegion(null);
                  }} className="flex-1 bg-primary text-primary-foreground shadow-md border border-border/40 hover:scale-[1.02] transition-transform">
                    <Route className="w-4 h-4 mr-2" /> Navigate Here
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-white/20 hover:bg-white/5 hover:border-white/30 backdrop-blur-md" onClick={() => toast.info('Opening maintenance report...')}>
                    Report Issue
                  </Button>
                </div>
              </div>
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
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-sm p-3 shadow-sm ">
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


