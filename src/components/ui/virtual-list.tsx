import { ReactNode, UIEvent, useMemo, useState } from "react";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  overscan?: number;
  renderItem: (item: T, index: number) => ReactNode;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  overscan = 4,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const virtualState = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const visibleCount = Math.ceil(height / itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan,
    );
    const endIndex = Math.min(
      items.length,
      startIndex + visibleCount + overscan * 2,
    );

    return {
      totalHeight,
      startIndex,
      offsetY: startIndex * itemHeight,
      visibleItems: items.slice(startIndex, endIndex),
    };
  }, [height, itemHeight, items, overscan, scrollTop]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div className="overflow-y-auto" style={{ height }} onScroll={handleScroll}>
      <div style={{ height: virtualState.totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${virtualState.offsetY}px)` }}>
          {virtualState.visibleItems.map((item, visibleIndex) =>
            renderItem(item, virtualState.startIndex + visibleIndex),
          )}
        </div>
      </div>
    </div>
  );
}
