import { useState, useRef, useEffect, ReactNode } from "react";
import { X, Minus, Square } from "lucide-react";

interface WindowProps {
  id: number;
  title: string;
  children: ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onPositionChange: (x: number, y: number) => void;
}

export const Window = ({
  title,
  children,
  x,
  y,
  width,
  height,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onPositionChange,
}: WindowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      onPositionChange(
        Math.max(0, Math.min(newX, window.innerWidth - width)),
        Math.max(0, Math.min(newY, window.innerHeight - height - 40))
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, x, y, width, height, onPositionChange]);

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col"
      style={{
        left: x,
        top: y,
        width,
        height,
        zIndex: isActive ? 30 : 10,
        background: "hsl(var(--win95-gray))",
        border: "2px solid hsl(var(--border-light))",
        borderRight: "2px solid hsl(var(--border-dark))",
        borderBottom: "2px solid hsl(var(--border-dark))",
        boxShadow: "2px 2px 4px rgba(0,0,0,0.3)"
      }}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-1 py-1 cursor-move select-none"
        style={{
          background: isActive 
            ? "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)"
            : "hsl(var(--win95-dark-gray))",
          color: isActive ? "white" : "hsl(var(--win95-light-gray))"
        }}
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-bold px-1">{title}</span>
        
        <div className="window-controls flex gap-1">
          <button
            onClick={onMinimize}
            className="w-5 h-5 flex items-center justify-center"
            style={{
              background: "hsl(var(--win95-gray))",
              border: "2px solid hsl(var(--border-light))",
              borderRight: "2px solid hsl(var(--border-dark))",
              borderBottom: "2px solid hsl(var(--border-dark))",
            }}
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            className="w-5 h-5 flex items-center justify-center"
            style={{
              background: "hsl(var(--win95-gray))",
              border: "2px solid hsl(var(--border-light))",
              borderRight: "2px solid hsl(var(--border-dark))",
              borderBottom: "2px solid hsl(var(--border-dark))",
            }}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center"
            style={{
              background: "hsl(var(--win95-gray))",
              border: "2px solid hsl(var(--border-light))",
              borderRight: "2px solid hsl(var(--border-dark))",
              borderBottom: "2px solid hsl(var(--border-dark))",
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-auto"
        style={{
          background: "white",
          border: "2px solid hsl(var(--border-dark))",
          borderRight: "2px solid hsl(var(--border-light))",
          borderBottom: "2px solid hsl(var(--border-light))",
          margin: "2px"
        }}
      >
        {children}
      </div>
    </div>
  );
};
