import { ReactNode, useState } from "react";

interface DesktopIconProps {
  icon: ReactNode;
  label: string;
  onDoubleClick: () => void;
}

export const DesktopIcon = ({ icon, label, onDoubleClick }: DesktopIconProps) => {
  const [clicks, setClicks] = useState(0);
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    setClicks(prev => prev + 1);
    setSelected(true);

    setTimeout(() => {
      if (clicks === 0) {
        setClicks(0);
      } else {
        onDoubleClick();
        setClicks(0);
        setSelected(false);
      }
    }, 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center gap-1 p-2 w-full cursor-default ${
        selected ? 'bg-primary/20' : ''
      }`}
      style={{
        border: selected ? "1px dotted white" : "none",
        height: "100%"
      }}
    >
      <div className="text-white drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
        {icon}
      </div>
      <span className="text-white text-xs text-center drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
        {label}
      </span>
    </button>
  );
};
