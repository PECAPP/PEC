import React from 'react';
import { Badge } from '@pec/ui';

interface InteractiveFloorPlanProps {
  issues: any[];
  onRoomClick: (room: string) => void;
}

// A simple mock floor plan SVG for demonstration purposes.
// In a real app, you would load an actual SVG path per floor and map room coordinates.
const ROOMS = [
  { id: 'A-101', x: 50, y: 50, w: 100, h: 80 },
  { id: 'A-102', x: 150, y: 50, w: 100, h: 80 },
  { id: 'A-103', x: 250, y: 50, w: 100, h: 80 },
  { id: 'A-104', x: 350, y: 50, w: 100, h: 80 },
  { id: 'A-201', x: 50, y: 200, w: 100, h: 80 },
  { id: 'A-202', x: 150, y: 200, w: 100, h: 80 },
  { id: 'A-203', x: 250, y: 200, w: 100, h: 80 },
  { id: 'A-204', x: 350, y: 200, w: 100, h: 80 },
];

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({ issues, onRoomClick }) => {
  const getRoomIssueCount = (room: string) => {
    return issues.filter(i => i.roomNumber === room && i.status !== 'closed' && i.status !== 'resolved').length;
  };

  const getRoomEscalatedCount = (room: string) => {
    return issues.filter(i => i.roomNumber === room && i.isEscalated).length;
  };

  return (
    <div className="relative w-full   border border-border rounded-sm bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
        <h3 className="font-semibold text-foreground">Live Occupancy & Issue Map</h3>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">Escalated</Badge>
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Open Issues</Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Clear</Badge>
        </div>
      </div>
      <div className="p-8 overflow-auto flex justify-center bg-muted/5">
        <svg width="500" height="330" className="">
          {/* Corridor */}
          <rect x="20" y="140" width="460" height="50" fill="currentColor" className="text-muted/30" rx="4" />
          <text x="250" y="170" fill="currentColor" className="text-muted-foreground text-sm font-bold text-center" textAnchor="middle">Main Corridor</text>

          {ROOMS.map(room => {
            const issueCount = getRoomIssueCount(room.id);
            const escalatedCount = getRoomEscalatedCount(room.id);
            
            let strokeColor = "stroke-border";
            let fillColor = "fill-card";
            let textColor = "fill-muted-foreground";

            if (escalatedCount > 0) {
              strokeColor = "stroke-red-500";
              fillColor = "fill-red-500/10";
              textColor = "fill-red-500 font-bold";
            } else if (issueCount > 0) {
              strokeColor = "stroke-orange-500";
              fillColor = "fill-orange-500/10";
              textColor = "fill-orange-500 font-bold";
            } else {
              fillColor = "fill-green-500/5";
              strokeColor = "stroke-green-500/30";
            }

            return (
              <g 
                key={room.id} 
                onClick={() => onRoomClick(room.id)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <rect 
                  x={room.x} y={room.y} width={room.w} height={room.h} 
                  className={`${fillColor} ${strokeColor}`} 
                  strokeWidth="2" rx="4"
                />
                <text x={room.x + room.w/2} y={room.y + room.h/2 + 5} textAnchor="middle" className={`text-sm ${textColor}`}>
                  {room.id}
                </text>
                {issueCount > 0 && (
                  <circle cx={room.x + room.w - 15} cy={room.y + 15} r="10" className={escalatedCount > 0 ? 'fill-red-500' : 'fill-orange-500'} />
                )}
                {issueCount > 0 && (
                  <text x={room.x + room.w - 15} y={room.y + 19} textAnchor="middle" fill="white" className="text-[10px] font-bold">
                    {issueCount}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

