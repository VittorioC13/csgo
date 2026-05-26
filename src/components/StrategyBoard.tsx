"use client";
import { useEffect, useRef, useState } from "react";
import Dust2Map from "./Dust2Map";

type PieceType = "t" | "ct" | "smoke" | "flash" | "molly" | "he";

type Piece = {
  id: string;
  type: PieceType;
  x: number;
  y: number;
  label?: string;
};

const PALETTE: { type: PieceType; label: string; sub: string }[] = [
  { type: "t", label: "T player", sub: "5 max" },
  { type: "ct", label: "CT player", sub: "5 max" },
  { type: "smoke", label: "Smoke", sub: "" },
  { type: "flash", label: "Flash", sub: "" },
  { type: "molly", label: "Molly", sub: "" },
  { type: "he", label: "HE", sub: "" },
];

const STORAGE_KEY = "strat:dust2:saves";

export default function StrategyBoard() {
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [saves, setSaves] = useState<Record<string, Piece[]>>({});
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setSaves(JSON.parse(raw)); } catch {}
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        setPieces((prev) => prev.filter((p) => p.id !== selected));
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const spawnPiece = (type: PieceType) => {
    if (type === "t" || type === "ct") {
      const sameSide = pieces.filter((p) => p.type === type);
      if (sameSide.length >= 5) return;
      const label = String(sameSide.length + 1);
      const id = `${type}-${Date.now()}`;
      setPieces([...pieces, { id, type, x: 500, y: 350, label }]);
      setSelected(id);
      return;
    }
    const id = `${type}-${Date.now()}`;
    setPieces([...pieces, { id, type, x: 500, y: 350 }]);
    setSelected(id);
  };

  const svgPoint = (clientX: number, clientY: number) => {
    const wrap = svgWrapRef.current;
    if (!wrap) return { x: 0, y: 0 };
    const svg = wrap.querySelector("svg");
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 1000;
    const y = ((clientY - rect.top) / rect.height) * 700;
    return { x, y };
  };

  const onPiecePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setSelected(id);
    setDragging(id);
  };

  const onPiecePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const { x, y } = svgPoint(e.clientX, e.clientY);
    setPieces((prev) =>
      prev.map((p) =>
        p.id === dragging
          ? { ...p, x: Math.max(20, Math.min(980, x)), y: Math.max(20, Math.min(680, y)) }
          : p,
      ),
    );
  };

  const onPiecePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch {}
    }
    setDragging(null);
  };

  const clearAll = () => {
    setPieces([]);
    setSelected(null);
  };

  const saveCurrent = () => {
    const name = saveName.trim();
    if (!name) return;
    const next = { ...saves, [name]: pieces };
    setSaves(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaveName("");
  };

  const loadSetup = (name: string) => {
    const s = saves[name];
    if (s) {
      setPieces(s);
      setSelected(null);
    }
  };

  const deleteSetup = (name: string) => {
    const next = { ...saves };
    delete next[name];
    setSaves(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pieces</h3>
          <div className="grid grid-cols-2 gap-2">
            {PALETTE.map((p) => (
              <button
                key={p.type}
                onClick={() => spawnPiece(p.type)}
                className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-2 text-left text-xs transition-colors hover:border-[var(--border-strong)]"
              >
                <PieceGlyph type={p.type} small />
                <div>
                  <div>{p.label}</div>
                  {p.sub && <div className="text-[10px] text-[var(--text-muted)]">{p.sub}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <button
            onClick={clearAll}
            className="w-full rounded border border-[var(--border)] py-2 text-xs uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            Clear board
          </button>
          {selected && (
            <button
              onClick={() => {
                setPieces((prev) => prev.filter((p) => p.id !== selected));
                setSelected(null);
              }}
              className="w-full rounded border border-red-900/60 bg-red-950/30 py-2 text-xs uppercase tracking-wider text-red-300 transition-colors hover:bg-red-950/50"
            >
              Delete selected
            </button>
          )}
        </div>
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Save current</h3>
          <div className="flex gap-2">
            <input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. A-default"
              className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-elev)] px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={saveCurrent}
              className="rounded bg-[var(--accent)] px-3 text-xs font-semibold text-black hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
        {Object.keys(saves).length > 0 && (
          <div className="space-y-1 border-t border-[var(--border)] pt-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Saved setups</h3>
            {Object.keys(saves).map((name) => (
              <div key={name} className="flex items-center gap-1">
                <button
                  onClick={() => loadSetup(name)}
                  className="flex-1 rounded border border-[var(--border)] px-2 py-1.5 text-left text-xs transition-colors hover:border-[var(--border-strong)]"
                >
                  {name} <span className="text-[10px] text-[var(--text-muted)]">({saves[name].length})</span>
                </button>
                <button
                  onClick={() => deleteSetup(name)}
                  className="rounded border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-muted)] hover:border-red-900 hover:text-red-400"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </aside>
      <div
        ref={svgWrapRef}
        onClick={() => setSelected(null)}
        className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2"
      >
        <Dust2Map>
          {pieces.map((p) => (
            <g
              key={p.id}
              transform={`translate(${p.x}, ${p.y})`}
              onPointerDown={(e) => onPiecePointerDown(e, p.id)}
              onPointerMove={onPiecePointerMove}
              onPointerUp={onPiecePointerUp}
              onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
              className="cursor-grab"
            >
              <PieceGlyph type={p.type} label={p.label} selected={selected === p.id} />
            </g>
          ))}
        </Dust2Map>
      </div>
    </div>
  );
}

const COLORS: Record<PieceType, { fill: string; stroke: string; text: string }> = {
  t: { fill: "#d97706", stroke: "#7c2d12", text: "#1c0a00" },
  ct: { fill: "#38bdf8", stroke: "#075985", text: "#03263a" },
  smoke: { fill: "#6b7280", stroke: "#1f2937", text: "#e5e7eb" },
  flash: { fill: "#facc15", stroke: "#854d0e", text: "#1c1300" },
  molly: { fill: "#ef4444", stroke: "#7f1d1d", text: "#1c0000" },
  he: { fill: "#22c55e", stroke: "#14532d", text: "#022c12" },
};

function PieceGlyph({
  type,
  label,
  selected,
  small,
}: {
  type: PieceType;
  label?: string;
  selected?: boolean;
  small?: boolean;
}) {
  const c = COLORS[type];
  const isPlayer = type === "t" || type === "ct";
  if (small) {
    return (
      <svg width={20} height={20} viewBox="-12 -12 24 24" className="shrink-0">
        <circle r={10} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} />
        {!isPlayer && (
          <text textAnchor="middle" dominantBaseline="central" fill={c.text} fontSize={9} fontFamily="ui-monospace, monospace">
            {type === "smoke" ? "S" : type === "flash" ? "F" : type === "molly" ? "M" : "H"}
          </text>
        )}
      </svg>
    );
  }
  const r = isPlayer ? 16 : 13;
  return (
    <g>
      {selected && <circle r={r + 5} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" />}
      <circle r={r} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={c.text}
        fontSize={isPlayer ? 14 : 11}
        fontWeight={700}
        fontFamily="ui-monospace, monospace"
        pointerEvents="none"
      >
        {isPlayer ? label ?? "" : type === "smoke" ? "S" : type === "flash" ? "F" : type === "molly" ? "M" : "H"}
      </text>
    </g>
  );
}
