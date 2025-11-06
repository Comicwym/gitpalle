import { useEffect, useRef, useState } from "react";
import { Server, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { StartMenu } from "./StartMenu";

interface TaskbarProps {
  windows: Array<{ id: number; title: string; minimized: boolean }>;
  activeWindow: number;
  onWindowRestore: (id: number) => void;
  onWindowFocus: (id: number) => void;
  onStartMenuAction: (action: "programs" | "documents" | "settings" | "find" | "help" | "shutdown") => void;
  folders: string[];
  iconSize: number;
  onOpenFolder: (name: string) => void;
  onSetIconSize: (size: number) => void;
}

export const Taskbar = ({ windows, activeWindow, onWindowRestore, onWindowFocus, onStartMenuAction, folders, iconSize, onOpenFolder, onSetIconSize }: TaskbarProps) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showAudio, setShowAudio] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);

  // Audio state
  const audioRef = useRef(new Audio());
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load playlist from /public/songs/playlist.json if present
  useEffect(() => {
    const parseListingHtml = (html: string): string[] => {
      const exts = ['.mp3', '.wav', '.ogg'];
      const aRegex = /href\s*=\s*"([^"]+)"/gi;
      const found: string[] = [];
      let m;
      while ((m = aRegex.exec(html))) {
        const href = m[1];
        const lower = href.toLowerCase();
        if (exts.some(ext => lower.endsWith(ext))) {
          const file = href.split('/').pop() || href;
          found.push(file);
        }
      }
      return Array.from(new Set(found));
    };

    const load = async () => {
      try {
        const res = await fetch('/songs/playlist.json');
        if (res.ok) {
          const data = await res.json();
          let files: string[] = [];
          if (Array.isArray(data)) files = data;
          else if (Array.isArray(data.tracks)) files = data.tracks;
          if (files.length) {
            setPlaylist(files);
            // preload first track and try autoplay
            const i = 0;
            audioRef.current.src = `/songs/${files[i]}`;
            setCurrentIndex(i);
            try { await audioRef.current.play(); setIsPlaying(true); } catch (_) {}
            return;
          }
        }
      } catch (_) {
        // ignore if missing
      }

      // Try to get directory listing and parse audio files
      try {
        const res2 = await fetch('/songs/');
        if (res2.ok) {
          const text = await res2.text();
          const files = parseListingHtml(text);
          if (files.length > 0) {
            setPlaylist(files);
            audioRef.current.src = `/songs/${files[0]}`;
            setCurrentIndex(0);
            try { await audioRef.current.play(); setIsPlaying(true); } catch (_) {}
          }
        }
      } catch (_) {
        // ignore
      }
    };
    load();
  }, []);

  // Auto next track on end
  useEffect(() => {
    const a = audioRef.current;
    const onEnded = () => next();
    a.addEventListener('ended', onEnded);
    return () => a.removeEventListener('ended', onEnded);
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const loadTrack = (index: number) => {
    if (playlist.length === 0) return;
    const i = ((index % playlist.length) + playlist.length) % playlist.length;
    setCurrentIndex(i);
    audioRef.current.src = `/songs/${playlist[i]}`;
  };

  const play = async () => {
    if (playlist.length === 0) return;
    if (!audioRef.current.src) loadTrack(currentIndex);
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (_) {
      // autoplay might be blocked
    }
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    isPlaying ? pause() : play();
  };

  const next = () => {
    loadTrack(currentIndex + 1);
    play();
  };

  const prev = () => {
    loadTrack(currentIndex - 1);
    play();
  };

  const toggleMute = () => {
    const muted = audioRef.current.muted;
    audioRef.current.muted = !muted;
  };

  return (
    <>
      {showStartMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowStartMenu(false)} />
      )}
      
      <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center px-1 gap-1 z-50" 
           style={{ 
             background: "hsl(var(--win95-gray))",
             borderTop: "2px solid hsl(var(--border-light))",
             borderLeft: "2px solid hsl(var(--border-light))",
             boxShadow: "inset -1px -1px 0 hsl(var(--border-dark))"
           }}>
        {/* Start Button */}
        <button
          onClick={() => setShowStartMenu(!showStartMenu)}
          className="h-8 px-3 flex items-center gap-2 font-bold text-sm"
          style={{
            background: showStartMenu ? "hsl(var(--win95-gray))" : "hsl(var(--win95-gray))",
            border: showStartMenu 
              ? "2px solid hsl(var(--border-dark))" 
              : "2px solid hsl(var(--border-light))",
            borderRight: showStartMenu 
              ? "2px solid hsl(var(--border-light))" 
              : "2px solid hsl(var(--border-dark))",
            borderBottom: showStartMenu 
              ? "2px solid hsl(var(--border-light))" 
              : "2px solid hsl(var(--border-dark))",
            boxShadow: showStartMenu ? "inset 1px 1px 0 hsl(var(--border-dark))" : "none"
          }}
        >
          <div className="w-5 h-5 flex items-center justify-center bg-black text-white font-bold rounded-sm">
            H
          </div>
          <span>Start</span>
        </button>

        {/* Separator */}
        <div className="h-8 w-px" style={{ background: "hsl(var(--border-dark))" }} />

        {/* Window Buttons */}
        {windows.map(window => (
          <button
            key={window.id}
            onClick={() => {
              if (window.minimized) {
                onWindowRestore(window.id);
              } else {
                onWindowFocus(window.id);
              }
            }}
            className={`h-8 px-3 flex items-center gap-2 text-sm truncate max-w-[200px] ${
              activeWindow === window.id && !window.minimized ? 'font-bold' : ''
            }`}
            style={{
              background: activeWindow === window.id && !window.minimized 
                ? "hsl(var(--win95-gray))" 
                : "hsl(var(--win95-gray))",
              border: activeWindow === window.id && !window.minimized
                ? "2px solid hsl(var(--border-dark))"
                : "2px solid hsl(var(--border-light))",
              borderRight: activeWindow === window.id && !window.minimized
                ? "2px solid hsl(var(--border-light))"
                : "2px solid hsl(var(--border-dark))",
              borderBottom: activeWindow === window.id && !window.minimized
                ? "2px solid hsl(var(--border-light))"
                : "2px solid hsl(var(--border-dark))",
            }}
          >
            {window.title}
          </button>
        ))}

        {/* System Tray */}
        <div className="ml-auto flex items-center h-8 px-2 gap-2"
             style={{
               border: "2px solid hsl(var(--border-dark))",
               borderRight: "2px solid hsl(var(--border-light))",
               borderBottom: "2px solid hsl(var(--border-light))",
             }}>
          {/* Network icon */}
          <button
            className="w-6 h-6 flex items-center justify-center"
            title="Network (Ethernet)"
            onClick={() => { setShowNetwork(s => !s); setShowAudio(false); }}
            style={{
              background: "hsl(var(--win95-gray))",
              border: "2px solid hsl(var(--border-light))",
              borderRight: "2px solid hsl(var(--border-dark))",
              borderBottom: "2px solid hsl(var(--border-dark))",
            }}
          >
            <Server className="w-4 h-4" />
          </button>

          {/* Audio icon */}
          <button
            className="w-6 h-6 flex items-center justify-center"
            title="Audio Controller"
            onClick={() => { setShowAudio(s => !s); setShowNetwork(false); }}
            style={{
              background: "hsl(var(--win95-gray))",
              border: "2px solid hsl(var(--border-light))",
              borderRight: "2px solid hsl(var(--border-dark))",
              borderBottom: "2px solid hsl(var(--border-dark))",
            }}
          >
            {audioRef.current.muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <span className="text-sm font-mono">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* Start Menu */}
      {showStartMenu && (
        <div className="absolute bottom-10 left-0 z-50">
          <StartMenu 
            onClose={() => setShowStartMenu(false)} 
            onAction={(a) => onStartMenuAction(a)}
            folders={folders}
            iconSize={iconSize}
            onOpenFolder={onOpenFolder}
            onSetIconSize={onSetIconSize}
          />
        </div>
      )}

      {/* Network Panel */}
      {showNetwork && (
        <div className="absolute bottom-12 right-2 z-50 w-64 text-sm"
          style={{
            background: "hsl(var(--win95-gray))",
            border: "2px solid hsl(var(--border-light))",
            borderRight: "2px solid hsl(var(--border-dark))",
            borderBottom: "2px solid hsl(var(--border-dark))",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}
        >
          <div className="px-3 py-2 font-bold">Network Connection</div>
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'green' }}></span>
              <span>Status: Connected (Ethernet)</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2"></div>
          </div>
        </div>
      )}

      {/* Audio Panel */}
      {showAudio && (
        <div className="absolute bottom-12 right-2 z-50 w-72 text-sm"
          style={{
            background: "hsl(var(--win95-gray))",
            border: "2px solid hsl(var(--border-light))",
            borderRight: "2px solid hsl(var(--border-dark))",
            borderBottom: "2px solid hsl(var(--border-dark))",
            boxShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}
        >
          <div className="px-3 py-2 font-bold">Audio Controller</div>
          <div className="px-3 pb-3 space-y-2">
            {playlist.length === 0 ? (
              <div className="text-xs">
                No playlist found. Add <code>/public/songs/playlist.json</code> with an array of files, e.g.:
                <pre className="mt-1">["track1.mp3", "track2.mp3"]</pre>
              </div>
            ) : (
              <div className="text-xs">Track: {playlist[currentIndex]}</div>
            )}

            <div className="flex items-center gap-2">
              <button className="w-6 h-6 flex items-center justify-center border" onClick={prev}><SkipBack className="w-4 h-4" /></button>
              <button className="w-8 h-6 flex items-center justify-center border" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button className="w-6 h-6 flex items-center justify-center border" onClick={next}><SkipForward className="w-4 h-4" /></button>
              <button className="ml-2 w-6 h-6 flex items-center justify-center border" onClick={toggleMute}>
                {audioRef.current.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="ml-2" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
