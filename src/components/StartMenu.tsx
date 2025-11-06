import { Power, Settings, HelpCircle, Search, FolderOpen, FileText, ChevronRight } from "lucide-react";
import { useState } from "react";

interface StartMenuProps {
  onClose: () => void;
  onAction: (action: "programs" | "documents" | "settings" | "find" | "help" | "shutdown") => void;
  folders: string[];
  iconSize: number;
  onOpenFolder: (name: string) => void;
  onSetIconSize: (size: number) => void;
}

export const StartMenu = ({ onClose, onAction, folders, iconSize, onOpenFolder, onSetIconSize }: StartMenuProps) => {
  const menuItems = [
    { icon: <FileText className="w-4 h-4" />, label: "Programs", action: "programs" as const, hasSubmenu: true },
    { icon: <FolderOpen className="w-4 h-4" />, label: "Documents", action: "documents" as const, hasSubmenu: true },
    { icon: <Settings className="w-4 h-4" />, label: "Settings", action: "settings" as const, hasSubmenu: true },
    { icon: <Search className="w-4 h-4" />, label: "Find", action: "find" as const },
    { icon: <HelpCircle className="w-4 h-4" />, label: "Help", action: "help" as const },
    { type: "separator" },
    { icon: <Power className="w-4 h-4" />, label: "Shut Down...", action: "shutdown" as const },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<null | "programs" | "documents" | "settings">(null);

  return (
    <div 
      className="w-64 text-sm relative"
      style={{
        background: "hsl(var(--win95-gray))",
        border: "2px solid hsl(var(--border-light))",
        borderRight: "2px solid hsl(var(--border-dark))",
        borderBottom: "2px solid hsl(var(--border-dark))",
        boxShadow: "2px 2px 4px rgba(0,0,0,0.3)"
      }}
    >
      {/* Menu Items (no left banner) */}
      <div className="py-1">
        {menuItems.map((item, index) => {
          if (item.type === "separator") {
            return (
              <div 
                key={index}
                className="h-px my-1 mx-1"
                style={{
                  borderTop: "1px solid hsl(var(--border-dark))",
                  borderBottom: "1px solid hsl(var(--border-light))"
                }}
              />
            );
          }

          return (
            <button
              key={index}
              onClick={() => { onAction(item.action as any); onClose(); }}
              onMouseEnter={() => setOpenSubmenu(item.hasSubmenu ? (item.action as any) : null)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors relative"
            >
              {item.icon}
              <span>{item.label}</span>
              {item.hasSubmenu && (
                <span className="ml-auto flex items-center justify-center w-5 h-5"
                  style={{ background: "hsl(var(--accent))", color: "white", borderRadius: "2px" }}>
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submenu panel */}
      {openSubmenu && (
        <div
          className="absolute top-0 left-full ml-1 w-56 text-sm"
          style={{
            background: "hsl(var(--win95-gray))",
            border: "2px solid hsl(var(--border-light))",
            borderRight: "2px solid hsl(var(--border-dark))",
            borderBottom: "2px solid hsl(var(--border-dark))",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          {openSubmenu === "programs" && (
            <div className="py-1">
              {folders.map((name) => (
                <button key={name} className="w-full flex items-center gap-2 px-2 py-1 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => { onOpenFolder(name); onClose(); }}>
                  <img src={`/${name}.png`} alt={name} className="w-4 h-4 mr-1" onError={(e) => (e.currentTarget.src = "/placeholder.svg")} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          )}
          {openSubmenu === "documents" && (
            <div className="py-1">
              {folders.map((name) => (
                <a key={name} className="block px-2 py-1 hover:bg-primary hover:text-primary-foreground" href={`/${name}/bio.txt`} target="_blank" rel="noreferrer">
                  {name}/bio.txt
                </a>
              ))}
            </div>
          )}
          {openSubmenu === "settings" && (
            <div className="py-2 px-2 space-y-2">
              <div className="font-bold">Icon size</div>
              <div className="flex gap-2 flex-wrap">
                {[32, 40, 48, 64].map(s => (
                  <button key={s} className={`px-2 py-1 border ${iconSize===s? 'bg-muted font-bold':''}`}
                    onClick={() => { onSetIconSize(s); onClose(); }}>
                    {s}px
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
