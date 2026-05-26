"use client";
import { useMemo, useState } from "react";
import { DUST2_REGIONS } from "./Dust2Map";
import { ECONOMY_SCENARIOS, type EcoChoice } from "@/data/economy";
import { SPRAY_PATTERNS } from "@/data/sprays";

type Tab = "callouts" | "economy" | "sprays";

export default function Quizzes() {
  const [tab, setTab] = useState<Tab>("callouts");
  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-1">
        {(["callouts", "economy", "sprays"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "flex-1 rounded px-3 py-2 text-sm capitalize transition-colors " +
              (tab === t
                ? "bg-[var(--bg-elev)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elev)]")
            }
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "callouts" && <CalloutQuiz />}
      {tab === "economy" && <EconomyQuiz />}
      {tab === "sprays" && <SprayReference />}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestion() {
  const correct = DUST2_REGIONS[Math.floor(Math.random() * DUST2_REGIONS.length)];
  const distractors = shuffle(DUST2_REGIONS.filter((r) => r.id !== correct.id)).slice(0, 3);
  const options = shuffle([correct, ...distractors]);
  return { correct, options };
}

function CalloutQuiz() {
  const [q, setQ] = useState(() => pickQuestion());
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const next = () => {
    setQ(pickQuestion());
    setChosen(null);
  };

  const onPick = (id: string) => {
    if (chosen) return;
    setChosen(id);
    setScore((s) => ({ right: s.right + (id === q.correct.id ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-2">
        <svg viewBox="0 0 1000 700" className="block h-auto w-full">
          <rect x="0" y="0" width="1000" height="700" fill="#0f0f12" />
          {DUST2_REGIONS.map((r) => {
            const isCorrect = r.id === q.correct.id;
            const highlight = isCorrect;
            const reveal = chosen !== null;
            const wasChosen = chosen === r.id;
            const fill = highlight
              ? reveal && chosen === r.id
                ? "#16a34a"
                : "#f59e0b"
              : reveal && wasChosen && !isCorrect
              ? "#7f1d1d"
              : "#1d1d22";
            return (
              <path key={r.id} d={r.d} fill={fill} stroke="#3a3a44" strokeWidth={1.5} />
            );
          })}
          {reveal_labels(chosen, q.correct.id)}
        </svg>
      </div>
      <aside className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Where is this?</h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {score.right}/{score.total}
          </span>
        </div>
        <div className="space-y-2">
          {q.options.map((opt) => {
            const isPicked = chosen === opt.id;
            const isCorrect = opt.id === q.correct.id;
            const cls = chosen
              ? isCorrect
                ? "border-green-700 bg-green-950/40 text-green-200"
                : isPicked
                ? "border-red-900 bg-red-950/40 text-red-200"
                : "border-[var(--border)] text-[var(--text-muted)] opacity-60"
              : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elev)]";
            return (
              <button
                key={opt.id}
                onClick={() => onPick(opt.id)}
                disabled={chosen !== null}
                className={"w-full rounded border px-3 py-2 text-left text-sm transition-colors " + cls}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={next}
          className="mt-2 w-full rounded bg-[var(--accent)] py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          {chosen ? "Next →" : "Skip"}
        </button>
      </aside>
    </div>
  );
}

function reveal_labels(chosen: string | null, correctId: string) {
  if (!chosen) return null;
  const r = DUST2_REGIONS.find((x) => x.id === correctId);
  if (!r) return null;
  return (
    <text x={r.cx} y={r.cy} textAnchor="middle" dominantBaseline="middle" fill="#0a0a0b" fontSize={14} fontWeight={700} fontFamily="ui-monospace, monospace">
      {r.label}
    </text>
  );
}

function EconomyQuiz() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * ECONOMY_SCENARIOS.length));
  const [chosen, setChosen] = useState<EcoChoice | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const scenario = ECONOMY_SCENARIOS[idx];

  const pick = (c: EcoChoice) => {
    if (chosen) return;
    setChosen(c);
    setScore((s) => ({ right: s.right + (c === scenario.answer ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    let n = idx;
    while (n === idx && ECONOMY_SCENARIOS.length > 1) {
      n = Math.floor(Math.random() * ECONOMY_SCENARIOS.length);
    }
    setIdx(n);
    setChosen(null);
  };

  const choices: { c: EcoChoice; label: string }[] = [
    { c: "eco", label: "Eco / save" },
    { c: "force", label: "Force buy" },
    { c: "full", label: "Full buy" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Scenario</p>
        <h3 className="mt-1 text-xl font-semibold">{scenario.prompt}</h3>
        <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
          {scenario.details.map((d, i) => (
            <li key={i}>· {d}</li>
          ))}
        </ul>
        {chosen && (
          <div className="mt-6 rounded border border-[var(--border)] bg-[var(--bg-elev)] p-4 text-sm">
            <div className="mb-1 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Answer:{" "}
              <span className={chosen === scenario.answer ? "text-green-400" : "text-red-400"}>
                {scenario.answer.toUpperCase()}{chosen === scenario.answer ? " · correct" : ` · you picked ${chosen.toUpperCase()}`}
              </span>
            </div>
            <p>{scenario.rationale}</p>
          </div>
        )}
      </div>
      <aside className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Your call</h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {score.right}/{score.total}
          </span>
        </div>
        {choices.map(({ c, label }) => {
          const isPicked = chosen === c;
          const isCorrect = c === scenario.answer;
          const cls = chosen
            ? isCorrect
              ? "border-green-700 bg-green-950/40 text-green-200"
              : isPicked
              ? "border-red-900 bg-red-950/40 text-red-200"
              : "border-[var(--border)] text-[var(--text-muted)] opacity-60"
            : "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elev)]";
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              disabled={chosen !== null}
              className={"w-full rounded border px-3 py-2 text-left text-sm transition-colors " + cls}
            >
              {label}
            </button>
          );
        })}
        <button
          onClick={next}
          className="mt-2 w-full rounded bg-[var(--accent)] py-2 text-sm font-semibold text-black hover:opacity-90"
        >
          {chosen ? "Next scenario →" : "Skip"}
        </button>
      </aside>
    </div>
  );
}

function SprayReference() {
  const [selectedId, setSelectedId] = useState(SPRAY_PATTERNS[0].id);
  const pattern = useMemo(
    () => SPRAY_PATTERNS.find((p) => p.id === selectedId) ?? SPRAY_PATTERNS[0],
    [selectedId],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <aside className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
        {SPRAY_PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={
              "flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm transition-colors " +
              (p.id === selectedId
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]")
            }
          >
            <span>{p.weapon}</span>
            <span className="font-mono text-[10px]">{p.side}</span>
          </button>
        ))}
      </aside>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {pattern.weapon} · spray
          </h3>
          <svg viewBox="0 0 100 100" className="aspect-square w-full">
            <rect x="0" y="0" width="100" height="100" fill="#0f0f12" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#22222a" strokeWidth="0.3" />
            <line x1="0" y1="95" x2="100" y2="95" stroke="#22222a" strokeWidth="0.3" />
            <polyline
              points={pattern.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
            {pattern.points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === 0 ? 1.2 : 0.7}
                fill={i === 0 ? "#fbbf24" : "#f59e0b"}
              />
            ))}
          </svg>
          <p className="mt-2 font-mono text-[10px] text-[var(--text-muted)]">
            ● = bullet impact · brighter = first shot
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Counter</h3>
          <p className="text-sm leading-6">{pattern.notes}</p>
          <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
            <li>· Mirror the pattern with your mouse — drag opposite the climb.</li>
            <li>· Tap or burst beyond ~15m. Spray inside that.</li>
            <li>· Reset between bursts: 0.3s pause restores accuracy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
