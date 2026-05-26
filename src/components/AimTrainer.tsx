"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Mode = "flick" | "track";
type Difficulty = "easy" | "medium" | "hard";

const SIZES: Record<Difficulty, number> = { easy: 36, medium: 26, hard: 18 };
const TRACK_SPEED: Record<Difficulty, number> = { easy: 90, medium: 150, hard: 230 };
const SESSION_MS = 30_000;

type Stats = {
  hits: number;
  misses: number;
  totalReactionMs: number;
  onTargetMs: number;
  elapsedMs: number;
};

const emptyStats = (): Stats => ({ hits: 0, misses: 0, totalReactionMs: 0, onTargetMs: 0, elapsedMs: 0 });

export default function AimTrainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("flick");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [best, setBest] = useState<{ flick: number; track: number }>({ flick: 0, track: 0 });

  const stateRef = useRef({
    targetX: 0,
    targetY: 0,
    targetSpawnedAt: 0,
    velX: 0,
    velY: 0,
    cursorX: 0,
    cursorY: 0,
    cursorInside: false,
    startedAt: 0,
    lastTick: 0,
    stats: emptyStats(),
  });

  useEffect(() => {
    const raw = localStorage.getItem("aim:best");
    if (raw) {
      try { setBest(JSON.parse(raw)); } catch {}
    }
  }, []);

  const radius = SIZES[difficulty];

  const spawnTarget = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const s = stateRef.current;
    s.targetX = radius + Math.random() * (w - radius * 2);
    s.targetY = radius + Math.random() * (h - radius * 2);
    s.targetSpawnedAt = performance.now();
    if (mode === "track") {
      const speed = TRACK_SPEED[difficulty];
      const angle = Math.random() * Math.PI * 2;
      s.velX = Math.cos(angle) * speed;
      s.velY = Math.sin(angle) * speed;
    }
  }, [mode, difficulty, radius]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const s = stateRef.current;

    ctx.fillStyle = "#0f0f12";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#1f1f25";
    ctx.lineWidth = 1;
    const grid = 40;
    for (let x = 0; x < w; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#3a3a44";
    ctx.beginPath();
    ctx.moveTo(w / 2 - 8, h / 2);
    ctx.lineTo(w / 2 + 8, h / 2);
    ctx.moveTo(w / 2, h / 2 - 8);
    ctx.lineTo(w / 2, h / 2 + 8);
    ctx.stroke();

    if (running) {
      ctx.fillStyle = mode === "track" && s.cursorInside ? "#fbbf24" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(s.targetX, s.targetY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7c2d12";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [running, mode, radius]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const loop = (t: number) => {
      const s = stateRef.current;
      const dt = s.lastTick === 0 ? 0 : t - s.lastTick;
      s.lastTick = t;
      s.stats.elapsedMs = t - s.startedAt;

      if (mode === "track") {
        const canvas = canvasRef.current;
        if (canvas) {
          s.targetX += (s.velX * dt) / 1000;
          s.targetY += (s.velY * dt) / 1000;
          if (s.targetX < radius || s.targetX > canvas.width - radius) s.velX *= -1;
          if (s.targetY < radius || s.targetY > canvas.height - radius) s.velY *= -1;
          s.targetX = Math.max(radius, Math.min(canvas.width - radius, s.targetX));
          s.targetY = Math.max(radius, Math.min(canvas.height - radius, s.targetY));
          const dx = s.cursorX - s.targetX;
          const dy = s.cursorY - s.targetY;
          s.cursorInside = dx * dx + dy * dy <= radius * radius;
          if (s.cursorInside) s.stats.onTargetMs += dt;
        }
      }

      draw();

      if (s.stats.elapsedMs >= SESSION_MS) {
        setRunning(false);
        const final = { ...s.stats };
        setStats(final);
        if (mode === "flick") {
          if (final.hits > best.flick) {
            const next = { ...best, flick: final.hits };
            setBest(next);
            localStorage.setItem("aim:best", JSON.stringify(next));
          }
        } else {
          const pct = Math.round((final.onTargetMs / SESSION_MS) * 100);
          if (pct > best.track) {
            const next = { ...best, track: pct };
            setBest(next);
            localStorage.setItem("aim:best", JSON.stringify(next));
          }
        }
        return;
      }

      setStats({ ...s.stats });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, mode, radius, draw, best]);

  const start = () => {
    stateRef.current.stats = emptyStats();
    stateRef.current.startedAt = performance.now();
    stateRef.current.lastTick = 0;
    setStats(emptyStats());
    setRunning(true);
    spawnTarget();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    stateRef.current.cursorX = ((e.clientX - rect.left) / rect.width) * e.currentTarget.width;
    stateRef.current.cursorY = ((e.clientY - rect.top) / rect.height) * e.currentTarget.height;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!running || mode !== "flick") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * e.currentTarget.width;
    const y = ((e.clientY - rect.top) / rect.height) * e.currentTarget.height;
    const s = stateRef.current;
    const dx = x - s.targetX;
    const dy = y - s.targetY;
    const now = performance.now();
    if (dx * dx + dy * dy <= radius * radius) {
      s.stats.hits++;
      s.stats.totalReactionMs += now - s.targetSpawnedAt;
      spawnTarget();
    } else {
      s.stats.misses++;
    }
    setStats({ ...s.stats });
  };

  const accuracy =
    stats.hits + stats.misses > 0
      ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
      : 0;
  const avgReaction = stats.hits > 0 ? Math.round(stats.totalReactionMs / stats.hits) : 0;
  const trackPct = Math.round((stats.onTargetMs / Math.max(1, stats.elapsedMs)) * 100);
  const remaining = Math.max(0, Math.ceil((SESSION_MS - stats.elapsedMs) / 1000));

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["flick", "track"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => !running && setMode(m)}
                disabled={running}
                className={
                  "rounded border px-3 py-2 text-sm capitalize transition-colors " +
                  (mode === m
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]")
                }
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Difficulty</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => !running && setDifficulty(d)}
                disabled={running}
                className={
                  "rounded border px-2 py-2 text-xs capitalize transition-colors " +
                  (difficulty === d
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]")
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={start}
          disabled={running}
          className="w-full rounded bg-[var(--accent)] py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? `Running… ${remaining}s` : "Start 30s session"}
        </button>
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
          <Row label="Hits" value={stats.hits} />
          <Row label="Misses" value={stats.misses} />
          <Row label="Accuracy" value={`${accuracy}%`} />
          {mode === "flick" ? (
            <Row label="Avg reaction" value={avgReaction ? `${avgReaction} ms` : "—"} />
          ) : (
            <Row label="On target" value={`${trackPct}%`} />
          )}
        </div>
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Personal best</h3>
          <Row label="Flick (hits)" value={best.flick} />
          <Row label="Track (% on)" value={`${best.track}%`} />
        </div>
      </aside>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2">
        <canvas
          ref={canvasRef}
          width={900}
          height={560}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          className="w-full cursor-crosshair touch-none rounded"
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
