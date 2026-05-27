"use client";
import { useEffect, useRef, useState } from "react";

const ARENA_W = 900;
const ARENA_H = 560;
const PLAYER_R = 14;
const DOT_R = 16;
// CS2 / Source-engine ground movement (sv_* values)
const MAX_SPEED = 250;           // sv_maxspeed — ground speed carrying a rifle
const ACCELERATE = 5.5;          // sv_accelerate
const FRICTION = 5.2;            // sv_friction
const STOP_SPEED = 80;           // sv_stopspeed
const TICK_RATE = 128;           // CS2 tick — physics steps at this rate
const TICK_DT = 1 / TICK_RATE;
const ACCURATE_VELOCITY = 25;    // |v| under this counts as "stopped" for the shot
const SESSION_MS = 60_000;

type Stats = {
  hits: number;
  misses: number;
  movingShots: number;
  elapsedMs: number;
};

type GameState = {
  px: number;
  py: number;
  vx: number;
  vy: number;
  dot: { x: number; y: number };
  keys: { w: boolean; a: boolean; s: boolean; d: boolean };
  cursorX: number;
  cursorY: number;
  startedAt: number;
  lastTick: number;
  accumulator: number;
  stats: Stats;
  flashTimer: number;
  flashKind: "" | "hit" | "miss";
};

// Source engine ground-movement tick. Friction always applied, then acceleration
// toward wishdir. When you press the OPPOSITE key (release the movement key and
// tap the counter), wishdir flips and the accel term zeros velocity in 5-7 ticks
// (~50-90ms). Holding both keys at once gives wishdir = 0 — pure friction, slow.
function physicsTick(s: GameState, dt: number) {
  let wx = (s.keys.d ? 1 : 0) - (s.keys.a ? 1 : 0);
  let wy = (s.keys.s ? 1 : 0) - (s.keys.w ? 1 : 0);
  const wishLen = Math.hypot(wx, wy);
  if (wishLen > 0) { wx /= wishLen; wy /= wishLen; }

  const speed = Math.hypot(s.vx, s.vy);
  if (speed > 0) {
    const control = speed < STOP_SPEED ? STOP_SPEED : speed;
    const drop = control * FRICTION * dt;
    const newSpeed = Math.max(0, speed - drop);
    const factor = newSpeed / speed;
    s.vx *= factor;
    s.vy *= factor;
  }

  if (wishLen > 0) {
    const currentSpeed = s.vx * wx + s.vy * wy;
    const addSpeed = MAX_SPEED - currentSpeed;
    if (addSpeed > 0) {
      const accelSpeed = Math.min(ACCELERATE * MAX_SPEED * dt, addSpeed);
      s.vx += wx * accelSpeed;
      s.vy += wy * accelSpeed;
    }
  }

  s.px += s.vx * dt;
  s.py += s.vy * dt;
  if (s.px < PLAYER_R) { s.px = PLAYER_R; s.vx = 0; }
  if (s.px > ARENA_W - PLAYER_R) { s.px = ARENA_W - PLAYER_R; s.vx = 0; }
  if (s.py < PLAYER_R) { s.py = PLAYER_R; s.vy = 0; }
  if (s.py > ARENA_H - PLAYER_R) { s.py = ARENA_H - PLAYER_R; s.vy = 0; }
}

const emptyStats = (): Stats => ({ hits: 0, misses: 0, movingShots: 0, elapsedMs: 0 });

function spawnDot(px: number, py: number) {
  for (let i = 0; i < 60; i++) {
    const x = DOT_R + 40 + Math.random() * (ARENA_W - (DOT_R + 40) * 2);
    const y = DOT_R + 40 + Math.random() * (ARENA_H - (DOT_R + 40) * 2);
    const dx = x - px;
    const dy = y - py;
    if (dx * dx + dy * dy > 180 * 180) return { x, y };
  }
  return { x: ARENA_W / 2, y: 80 };
}

export default function CounterStrafe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [best, setBest] = useState<{ hits: number }>({ hits: 0 });

  const stateRef = useRef<GameState>({
    px: ARENA_W / 2,
    py: ARENA_H / 2,
    vx: 0,
    vy: 0,
    dot: { x: ARENA_W / 2, y: 100 },
    keys: { w: false, a: false, s: false, d: false },
    cursorX: 0,
    cursorY: 0,
    startedAt: 0,
    lastTick: 0,
    accumulator: 0,
    stats: emptyStats(),
    flashTimer: 0,
    flashKind: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("strafe:best");
    if (raw) {
      try { setBest(JSON.parse(raw)); } catch {}
    }
  }, []);

  // Global key listeners (so the canvas doesn't need focus)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") return; // boss-key handled elsewhere
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d") {
        stateRef.current.keys[k as "w" | "a" | "s" | "d"] = true;
        if (running) e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d") {
        stateRef.current.keys[k as "w" | "a" | "s" | "d"] = false;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [running]);

  // Render + physics loop (always running so the preview animates even outside a session)
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const s = stateRef.current;
      const dt = s.lastTick === 0 ? 0 : Math.min(0.05, (t - s.lastTick) / 1000);
      s.lastTick = t;

      // Fixed-rate physics — run as many 128-tick steps as the frame covers.
      s.accumulator += dt;
      while (s.accumulator >= TICK_DT) {
        physicsTick(s, TICK_DT);
        s.accumulator -= TICK_DT;
      }

      if (s.flashTimer > 0) s.flashTimer = Math.max(0, s.flashTimer - dt * 1000);

      if (running) {
        s.stats.elapsedMs = t - s.startedAt;
        if (s.stats.elapsedMs >= SESSION_MS) {
          setRunning(false);
          const final = { ...s.stats };
          setStats(final);
          if (final.hits > best.hits) {
            const next = { hits: final.hits };
            setBest(next);
            localStorage.setItem("strafe:best", JSON.stringify(next));
          }
        } else {
          setStats({ ...s.stats });
        }
      }

      draw(canvasRef.current, s, running);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, best]);

  const start = () => {
    const s = stateRef.current;
    s.px = ARENA_W / 2;
    s.py = ARENA_H / 2;
    s.vx = 0;
    s.vy = 0;
    s.dot = spawnDot(s.px, s.py);
    s.stats = emptyStats();
    s.startedAt = performance.now();
    s.lastTick = 0;
    s.accumulator = 0;
    s.flashTimer = 0;
    s.flashKind = "";
    setStats(emptyStats());
    setRunning(true);
  };

  const onCanvasClick = () => {
    if (!running) return;
    const s = stateRef.current;
    const speed = Math.hypot(s.vx, s.vy);
    const dx = s.px - s.dot.x;
    const dy = s.py - s.dot.y;
    const onDot = dx * dx + dy * dy <= (DOT_R + PLAYER_R - 4) ** 2;

    if (speed > ACCURATE_VELOCITY) {
      s.stats.movingShots += 1;
      s.flashTimer = 220;
      s.flashKind = "miss";
    } else if (onDot) {
      s.stats.hits += 1;
      s.flashTimer = 220;
      s.flashKind = "hit";
      s.dot = spawnDot(s.px, s.py);
    } else {
      s.stats.misses += 1;
      s.flashTimer = 220;
      s.flashKind = "miss";
    }
    setStats({ ...s.stats });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    stateRef.current.cursorX = ((e.clientX - rect.left) / rect.width) * ARENA_W;
    stateRef.current.cursorY = ((e.clientY - rect.top) / rect.height) * ARENA_H;
  };

  const speed = Math.hypot(stats.hits ? 0 : 0); // placeholder so React updates; real speed drawn on canvas
  void speed;
  const accurate = Math.hypot(stateRef.current.vx, stateRef.current.vy) < ACCURATE_VELOCITY;
  const remaining = Math.max(0, Math.ceil((SESSION_MS - stats.elapsedMs) / 1000));

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Controls</h3>
          <KeysHint />
        </div>
        <button
          onClick={start}
          disabled={running}
          className="w-full rounded bg-[var(--accent)] py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? `Running… ${remaining}s` : "Start 60s session"}
        </button>
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
          <Row label="Hits" value={stats.hits} />
          <Row label="Misses" value={stats.misses} />
          <Row label="Moving shots" value={stats.movingShots} />
          <Row label="State" value={accurate ? "ACCURATE" : "MOVING"} valueClass={accurate ? "text-green-400" : "text-amber-400"} />
        </div>
        <div className="space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Personal best</h3>
          <Row label="Hits / 60s" value={best.hits} />
        </div>
        <div className="space-y-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)]">How to counter-strafe</p>
          <p>1. Move with WASD — velocity ramps up to ~250 u/s.</p>
          <p>2. To stop instantly: <span className="text-[var(--accent)]">release</span> the move key and <span className="text-[var(--accent)]">tap the opposite</span> (D → release D + tap A). The opposing wishdir zeroes velocity in ~80 ms.</p>
          <p>3. Holding both keys at once cancels your input (pure friction, ~400 ms to stop) — the slow path.</p>
          <p>4. Click only when ACCURATE. Moving shots don&rsquo;t score.</p>
        </div>
      </aside>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2">
        <canvas
          ref={canvasRef}
          width={ARENA_W}
          height={ARENA_H}
          onPointerMove={onPointerMove}
          onClick={onCanvasClick}
          tabIndex={0}
          className="w-full cursor-crosshair touch-none rounded outline-none"
        />
      </div>
    </div>
  );
}

function draw(canvas: HTMLCanvasElement | null, s: GameState, running: boolean) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // Floor
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

  // Dot
  if (running) {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(s.dot.x, s.dot.y, DOT_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#0a0a0b";
    ctx.beginPath();
    ctx.arc(s.dot.x, s.dot.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Velocity arrow
  const speed = Math.hypot(s.vx, s.vy);
  if (speed > 1) {
    const len = Math.min(60, speed * 0.18);
    const nx = s.vx / speed;
    const ny = s.vy / speed;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.px, s.py);
    ctx.lineTo(s.px + nx * len, s.py + ny * len);
    ctx.stroke();
  }

  // Player
  const accurate = speed < ACCURATE_VELOCITY;
  ctx.fillStyle = accurate ? "#22c55e" : "#ef4444";
  ctx.beginPath();
  ctx.arc(s.px, s.py, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0a0a0b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Velocity bar (top-left HUD)
  const barW = 200;
  const barH = 8;
  ctx.fillStyle = "#18181c";
  ctx.fillRect(16, 16, barW, barH);
  const pct = Math.min(1, speed / MAX_SPEED);
  ctx.fillStyle = accurate ? "#22c55e" : "#f59e0b";
  ctx.fillRect(16, 16, barW * pct, barH);
  ctx.strokeStyle = "#3a3a44";
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, barW, barH);
  ctx.fillStyle = "#9a9aa3";
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText(`v = ${speed.toFixed(0)} u/s`, 16, 40);
  // Threshold tick
  const tickX = 16 + (ACCURATE_VELOCITY / MAX_SPEED) * barW;
  ctx.strokeStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(tickX, 14);
  ctx.lineTo(tickX, 16 + barH + 2);
  ctx.stroke();

  // Key indicators (bottom-left)
  drawKey(ctx, 24, h - 80, "W", s.keys.w);
  drawKey(ctx, 24 - 28, h - 50, "A", s.keys.a);
  drawKey(ctx, 24, h - 50, "S", s.keys.s);
  drawKey(ctx, 24 + 28, h - 50, "D", s.keys.d);

  // Flash overlay
  if (s.flashTimer > 0) {
    const alpha = Math.min(0.35, s.flashTimer / 220 * 0.35);
    ctx.fillStyle = s.flashKind === "hit" ? `rgba(34, 197, 94, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
    ctx.fillRect(0, 0, w, h);
  }

  if (!running) {
    ctx.fillStyle = "rgba(10, 10, 11, 0.5)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ededf0";
    ctx.font = "16px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Press Start, then move with WASD. Tap the opposite key to stop.", w / 2, h / 2);
    ctx.textAlign = "left";
  }
}

function drawKey(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string, pressed: boolean) {
  const size = 24;
  ctx.fillStyle = pressed ? "#f59e0b" : "#18181c";
  ctx.strokeStyle = pressed ? "#7c2d12" : "#3a3a44";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(cx - size / 2, cy - size / 2, size, size);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = pressed ? "#0a0a0b" : "#9a9aa3";
  ctx.font = "bold 12px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 0.5);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function KeysHint() {
  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="inline-block rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-2 py-0.5">WASD</span>
        <span className="text-[var(--text-muted)]">move</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-2 py-0.5">A↔D</span>
        <span className="text-[var(--text-muted)]">horizontal counter</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-2 py-0.5">W↔S</span>
        <span className="text-[var(--text-muted)]">vertical counter</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-2 py-0.5">click</span>
        <span className="text-[var(--text-muted)]">shoot — must be stationary</span>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={"font-mono " + (valueClass ?? "")}>{value}</span>
    </div>
  );
}
