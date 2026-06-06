import { useState, useEffect } from 'react';

export const useResizable = (minWidth = 320, minHeight = 400) => {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const handleScreenResize = () => {
      const maxW = window.innerWidth - 32;
      const maxH = window.innerHeight - 100;
      setWidth(prev => Math.min(prev, maxW));
      setHeight(prev => Math.min(prev, maxH));
    };
    handleScreenResize();
    window.addEventListener("resize", handleScreenResize);
    return () => window.removeEventListener("resize", handleScreenResize);
  }, []);

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent | any,
    direction: "n" | "w" | "nw"
  ) => {
    e.preventDefault();
    const startWidth = width;
    const startHeight = height;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      const maxW = window.innerWidth - 32;
      const maxH = window.innerHeight - 100;

      if (direction === "w" || direction === "nw") {
        const newWidth = Math.max(minWidth, Math.min(maxW, startWidth - deltaX));
        setWidth(newWidth);
      }
      if (direction === "n" || direction === "nw") {
        const newHeight = Math.max(minHeight, Math.min(maxH, startHeight - deltaY));
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: true });
    document.addEventListener("touchend", handleMouseUp);
  };

  return { width, height, handleResizeStart };
};
