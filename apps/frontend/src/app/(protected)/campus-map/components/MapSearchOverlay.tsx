import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { Input, Button } from '@pec/ui';
import { MapRegion } from './mapConfig';

interface MapSearchOverlayProps {
  regions: MapRegion[];
  onSelectRegion: (region: MapRegion) => void;
  onNavigate: (from: MapRegion, to: MapRegion) => void;
}

export function MapSearchOverlay({ regions, onSelectRegion, onNavigate }: MapSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStart, setSelectedStart] = useState<MapRegion | null>(null);

  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) || 
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full  px-4">
      <div className="relative bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-sm overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-2 bg-card">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search buildings, hostels, departments..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-12 text-lg"
          />
          {query && (
            <button onClick={() => { setQuery(''); setIsOpen(false); setSelectedStart(null); }} className="p-2 shrink-0">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isOpen && query && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="max-h-[60vh] overflow-y-auto custom-scrollbar border-t border-border bg-card/90"
            >
              {filteredRegions.length > 0 ? (
                filteredRegions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                    onClick={() => {
                      if (selectedStart) {
                        onNavigate(selectedStart, region);
                        setIsOpen(false);
                        setQuery('');
                        setSelectedStart(null);
                      } else {
                        onSelectRegion(region);
                        setIsOpen(false);
                        setQuery(region.name);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{region.name}</h4>
                        <p className="text-xs text-muted-foreground">{region.category}</p>
                      </div>
                    </div>
                    
                    {!selectedStart ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStart(region);
                          setQuery('');
                        }}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Navigate Here
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No locations found.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {selectedStart && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm shadow-glow flex items-center justify-between text-sm font-medium"
          >
            <span>Navigating from: {selectedStart.name}</span>
            <button onClick={() => setSelectedStart(null)} className="p-1 bg-white/20 rounded hover:bg-white/30">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
