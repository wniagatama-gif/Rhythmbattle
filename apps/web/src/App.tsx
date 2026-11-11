import { useState, useEffect } from "react";
import { fetchHealthStatus, getApiBaseUrl } from "./services/api";
import { DEFAULT_GAME_CONFIG } from "@rhythm-battle/shared";
import type { HealthResponse } from "@rhythm-battle/shared";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Database, 
  Layers, 
  Music2 
} from "lucide-react";

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkBackendHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to backend";
      setError(msg);
      setHealth(null);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-8 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/25">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Modern Rhythm Battle
            </h1>
            <p className="text-xs text-slate-400">Phase 1: Project Foundation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Monorepo Active
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto py-10 flex-1 grid gap-8 md:grid-cols-3">
        {/* Left Column: Foundation Status */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  System Health & Connectivity
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Testing communication between React Frontend and ElysiaJS Backend
                </p>
              </div>

              <button
                onClick={checkBackendHealth}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Re-check
              </button>
            </div>

            {/* Health Card */}
            <div className={`p-5 rounded-xl border transition-all ${
              health?.success 
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : error 
                ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                : "bg-slate-800/40 border-slate-700 text-slate-300"
            }`}>
              <div className="flex items-start gap-4">
                {health?.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {loading ? "Checking backend connection..." : health?.success ? "Backend Connected" : "Connection Issue"}
                    </span>
                    {lastChecked && (
                      <span className="text-xs text-slate-400">Checked: {lastChecked}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    {health?.message || error || "Waiting for response..."}
                  </p>

                  <div className="pt-2 text-xs text-slate-400 flex flex-wrap gap-4 border-t border-slate-800/60 mt-3">
                    <div>
                      <span className="text-slate-500">API Endpoint: </span>
                      <code className="text-indigo-300">{getApiBaseUrl()}/api/health</code>
                    </div>
                    {health?.service && (
                      <div>
                        <span className="text-slate-500">Service: </span>
                        <code className="text-cyan-300">{health.service}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Package Verification */}
            <div className="mt-6 p-5 rounded-xl bg-slate-800/30 border border-slate-800">
              <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                Shared Package (@rhythm-battle/shared) Verification
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Successfully loaded game configurations from the shared workspace package:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Default BPM</div>
                  <div className="text-sm font-semibold text-indigo-400 mt-0.5">{DEFAULT_GAME_CONFIG.defaultBpm}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Lanes</div>
                  <div className="text-sm font-semibold text-indigo-400 mt-0.5">{DEFAULT_GAME_CONFIG.lanesCount} Lanes</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Perfect Window</div>
                  <div className="text-sm font-semibold text-emerald-400 mt-0.5">±{DEFAULT_GAME_CONFIG.hitWindowMs.perfect} ms</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase font-mono">Great Window</div>
                  <div className="text-sm font-semibold text-cyan-400 mt-0.5">±{DEFAULT_GAME_CONFIG.hitWindowMs.great} ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architecture & Stack Badges */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              Technology Stack
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Runtime & Manager</span>
                <span className="font-medium text-slate-200">Bun Workspaces</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Frontend UI</span>
                <span className="font-medium text-slate-200">React + Vite + TS</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Styling</span>
                <span className="font-medium text-slate-200">Local Tailwind CSS</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Backend API</span>
                <span className="font-medium text-slate-200">Bun + ElysiaJS</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Database & ORM</span>
                <span className="font-medium text-slate-200">MySQL + Drizzle ORM</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <span className="text-slate-400">Schema Validation</span>
                <span className="font-medium text-slate-200">Zod</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              Project Foundation Scope
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Phase 1 establishes the monorepo, environment configurations, API connectivity, and shared contract models. Gameplay, multiplayer, and 3D scenes will be implemented in subsequent phases.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              Ready for Phase 2: Rhythm Engine
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div>Modern Rhythm Battle &copy; 2026</div>
        <div>Issue 001: Project Foundation</div>
      </footer>
    </div>
  );
}
export default App;

