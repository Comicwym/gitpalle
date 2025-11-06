import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Simple plugin to auto-generate public/songs/playlist.json from files
function autoPlaylist() {
  const exts = new Set([".mp3", ".wav", ".ogg"]);
  const songsDir = path.resolve(__dirname, "public", "songs");
  const playlistPath = path.resolve(songsDir, "playlist.json");

  const generate = () => {
    try {
      if (!fs.existsSync(songsDir)) return;
      const files = fs.readdirSync(songsDir)
        .filter(f => exts.has(path.extname(f).toLowerCase()))
        .sort();
      const json = JSON.stringify(files, null, 2);
      fs.writeFileSync(playlistPath, json);
      console.log(`[auto-playlist] Generated ${files.length} track(s)`);
    } catch (e) {
      console.warn("[auto-playlist] Failed to generate playlist:", e);
    }
  };

  return {
    name: "auto-playlist",
    configureServer() {
      // Run once at server start
      generate();
    },
    buildStart() {
      generate();
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), autoPlaylist(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
