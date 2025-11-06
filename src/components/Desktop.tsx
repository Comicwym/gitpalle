import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Taskbar } from "./Taskbar";
import { Window } from "./Window";
import { DesktopIcon } from "./DesktopIcon";

// Folder names to render as desktop icons
const FOLDER_NAMES = [
  "Mav",
  "Kyo",
  "ZioEren",
  "Vlone",
  "Comic",
  "Tk",
  "Khello",
  "Hecate",
  "Core",
  "Decimal",
] as const;

type FolderName = typeof FOLDER_NAMES[number];

const placeholderIcon = "/placeholder.svg";

// Compute icon source from /public. Tries /profiles/<name>.png then falls back.
const getFolderIconSrc = async (name: FolderName): Promise<string> => {
  const candidates = [
    `/profiles/${name}.png`, // preferito: /public/profiles/<name>.png
    `/${name}/pfp.png`,      // alternativa: /public/<name>/pfp.png
    `/${name}.png`,          // alternativa: /public/<name>.png
  ];

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, { method: "HEAD" });
      if (res.ok) return candidate;
    } catch (_) {
      // continua con il prossimo candidato
    }
  }
  return placeholderIcon;
};

// Validate that required files exist within /public/<name>/
const validateFolderStructure = async (name: FolderName) => {
  const bioPath = `/${name}/bio.txt`;
  const pfpPath = `/${name}/pfp.png`;

  const check = async (path: string) => {
    try {
      const res = await fetch(path, { method: "HEAD" });
      return res.ok;
    } catch (_) {
      return false;
    }
  };

  const [hasBio, hasPfp] = await Promise.all([check(bioPath), check(pfpPath)]);
  const iconSrc = await getFolderIconSrc(name);
  const hasIcon = iconSrc !== placeholderIcon;

  return { hasBio, hasPfp, bioPath, pfpPath, iconSrc, hasIcon };
};

// Stable IconWithFallback component defined at module scope to avoid remounts
const IconWithFallback = ({ name, size = 32, className = "" }: { name: FolderName; size?: number; className?: string }) => {
  const [idx, setIdx] = useState(0);
  const paths = [
    `/profiles/${name}.png`,
    `/${name}/pfp.png`,
    `/${name}.png`,
    placeholderIcon,
  ];
  return (
    <img
      src={paths[idx]}
      alt={`${name} icon`}
      style={{ width: size, height: size }}
      className={className}
      onError={() => setIdx(i => (i < paths.length - 1 ? i + 1 : i))}
    />
  );
};

export const Desktop = () => {
  const navigate = useNavigate();
  interface DesktopWindow {
    id: number;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
    content?: string;
    render?: ReactNode;
  }

  const [windows, setWindows] = useState<DesktopWindow[]>([
    { id: 1, title: "Welcome to hazard", content: "Take a look around \n\nMade by comic with ❤", x: 100, y: 100, width: 400, height: 300, minimized: false }
  ]);
  const [activeWindow, setActiveWindow] = useState(1);
  const [desktopIconSize, setDesktopIconSize] = useState(48);


  const addWindow = (title: string, content: string) => {
    const newWindow: DesktopWindow = {
      id: Date.now(),
      title,
      content,
      x: 50 + windows.length * 30,
      y: 50 + windows.length * 30,
      width: 500,
      height: 400,
      minimized: false
    };
    setWindows([...windows, newWindow]);
    setActiveWindow(newWindow.id);
  };

  const addCenteredWindowWithRender = (title: string, render: ReactNode, width = 500, height = 400) => {
    const x = Math.max(0, Math.round((window.innerWidth - width) / 2));
    const y = Math.max(0, Math.round((window.innerHeight - height) / 2));
    const newWindow: DesktopWindow = {
      id: Date.now(),
      title,
      x,
      y,
      width,
      height,
      minimized: false,
      render,
    };
    setWindows((prev) => [...prev, newWindow]);
    setActiveWindow(newWindow.id);
  };

  // Components used inside windows
  const ProgramsList = ({ onOpen }: { onOpen: (name: FolderName) => void }) => (
    <div className="p-4 space-y-2">
      <div className="font-bold mb-2">Programs</div>
      {FOLDER_NAMES.map((name) => (
        <button key={name} className="block w-full text-left px-2 py-1 hover:bg-muted"
          onClick={() => onOpen(name)}>
          {name}
        </button>
      ))}
    </div>
  );

  const DocumentsList = ({ onOpen }: { onOpen: (name: FolderName) => void }) => (
    <div className="p-4 space-y-2">
      <div className="font-bold mb-2">Documents</div>
      {FOLDER_NAMES.map((name) => (
        <a key={name} href={`/${name}/bio.txt`} className="block w-full px-2 py-1 hover:bg-muted" target="_blank" rel="noreferrer">
          {name}/bio.txt
        </a>
      ))}
      <div className="mt-4 text-xs text-muted-foreground">Tip: click a name to open its folder.</div>
      <div className="mt-2">
        {FOLDER_NAMES.map((name) => (
          <button key={`open-${name}`} className="mr-2 mt-1 px-2 py-1 border" onClick={() => onOpen(name)}>
            Open {name}
          </button>
        ))}
      </div>
    </div>
  );

  const FindPanel = ({ onOpen }: { onOpen: (name: FolderName) => void }) => {
    const [q, setQ] = useState("");
    const results = FOLDER_NAMES.filter(n => n.toLowerCase().includes(q.toLowerCase()));
    return (
      <div className="p-4 space-y-3">
        <div className="font-bold">Find</div>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full border px-2 py-1"
          placeholder="Search folder..."
        />
        <div className="space-y-1">
          {results.map(name => (
            <button key={name} className="block w-full text-left px-2 py-1 hover:bg-muted" onClick={() => onOpen(name)}>
              Open {name}
            </button>
          ))}
          {results.length === 0 && <div className="text-xs text-muted-foreground">No results</div>}
        </div>
      </div>
    );
  };

  const openFolder = async (name: FolderName) => {
    // Testo personalizzabile da bio.txt, opzionale (se mancante, non mostra nulla)
    const bioPath = `/${name}/bio.txt`;
    let bioText = "";
    try {
      const res = await fetch(bioPath);
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        // Evita di mostrare l'HTML dell'index quando il file manca
        if (ct.includes("text/plain")) {
          bioText = await res.text();
        }
      }
    } catch (_) {
      // nessun testo di default
    }

    // Finestra centrata con immagine (fallback automatico) e SOLO testo personalizzabile
    addCenteredWindowWithRender(
      name,
      (
        <div className="flex flex-col items-center gap-3 p-4">
          <IconWithFallback name={name} size={128} className="rounded" />
          {bioText.trim().length > 0 ? (
            <div className="text-sm whitespace-pre-line text-center">{bioText}</div>
          ) : null}
        </div>
      ),
      480,
      360
    );
  };

  const handleStartMenuAction = (action: "programs" | "documents" | "settings" | "find" | "help" | "shutdown") => {
    switch (action) {
      case "programs":
        addCenteredWindowWithRender("Programs", <ProgramsList onOpen={openFolder} />, 360, 420);
        break;
      case "documents":
        addCenteredWindowWithRender("Documents", <DocumentsList onOpen={openFolder} />, 420, 460);
        break;
      case "settings":
        addCenteredWindowWithRender(
          "Settings",
          (
            <div className="p-4 space-y-3">
              <div className="font-bold">Desktop</div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Icon size:</span>
                {[32, 40, 48, 64].map(s => (
                  <button key={s} className={`px-2 py-1 border ${desktopIconSize===s? 'bg-muted font-bold':''}`} onClick={() => setDesktopIconSize(s)}>
                    {s}px
                  </button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">Changes apply immediately.</div>
            </div>
          ),
          420,
          260
        );
        break;
      case "find":
        addCenteredWindowWithRender("Find", <FindPanel onOpen={openFolder} />, 380, 300);
        break;
      case "help":
        addCenteredWindowWithRender(
          "Help",
          <div className="p-4 text-sm space-y-2">
            <p>• Double-click an icon to open its folder.</p>
            <p>• Start → Programs shows the folders list.</p>
            <p>• Settings lets you change desktop icon size.</p>
            <p>• Find searches folders and opens them.</p>
          </div>,
          420,
          280
        );
        break;
      case "shutdown":
        // Chiude tutte le finestre tranne la taskbar
        setWindows([]);
        // Mostra una finestra di arrivederci
        addCenteredWindowWithRender("Goodbye", <div className="p-6 text-center">System shut down.</div>, 320, 200);
        // Avvia immediatamente l'audio sfruttando il gesto utente e reindirizza
        try {
          const anyWindow = window as unknown as { errapeAudio?: HTMLAudioElement };
          const audio = anyWindow.errapeAudio ?? new Audio("/songs/errape.mp3");
          audio.volume = 1.0;
          audio.muted = false;
          anyWindow.errapeAudio = audio;
          void audio.play();
        } catch (_) {
          // ignora errori di autoplay
        }
        navigate("/errape");
        break;
    }
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const restoreWindow = (id: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: false } : w));
    setActiveWindow(id);
  };

  const updateWindowPosition = (id: number, x: number, y: number) => {
    setWindows(windows.map(w => w.id === id ? { ...w, x, y } : w));
  };

  return (
    <div 
      className="relative h-screen w-full overflow-hidden"
      style={{ 
        background: "hsl(var(--win95-desktop))",
        backgroundImage: "url('/Background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Desktop Icons */}
      <div
        className="absolute top-4 left-4 bottom-12"
        style={{
          display: 'block',
          columnCount: 2,
          columnGap: '16px',
          overflow: 'hidden',
        }}
      >
        {FOLDER_NAMES.map((name) => (
          <div
            key={name}
            style={{
              breakInside: 'avoid',
              height: `${desktopIconSize + 36}px`,
              width: `${desktopIconSize + 48}px`,
              marginBottom: '16px',
            }}
          >
            <DesktopIcon
              icon={<IconWithFallback name={name} size={desktopIconSize} />}
              label={name}
              onDoubleClick={() => openFolder(name)}
            />
          </div>
        ))}
      </div>

      {/* Windows */}
      {windows.filter(w => !w.minimized).map(window => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          x={window.x}
          y={window.y}
          width={window.width}
          height={window.height}
          isActive={activeWindow === window.id}
          onFocus={() => setActiveWindow(window.id)}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onPositionChange={(x, y) => updateWindowPosition(window.id, x, y)}
        >
          {window.render ? (
            <div className="p-2">{window.render}</div>
          ) : (
            <pre className="font-mono text-sm whitespace-pre-wrap p-4">{window.content}</pre>
          )}
        </Window>
      ))}

      {/* Taskbar */}
      <Taskbar 
        windows={windows}
        activeWindow={activeWindow}
        onWindowRestore={restoreWindow}
        onWindowFocus={setActiveWindow}
        onStartMenuAction={handleStartMenuAction}
        folders={[...FOLDER_NAMES]}
        iconSize={desktopIconSize}
        onOpenFolder={(name) => openFolder(name as FolderName)}
        onSetIconSize={setDesktopIconSize}
      />
    </div>
  );
};
