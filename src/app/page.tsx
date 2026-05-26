import Link from "next/link";

const cards = [
  {
    href: "/aim",
    title: "Aim trainer",
    blurb: "Browser flick & tracking drills. Builds mouse discipline when your gaming rig is out of reach.",
    tag: "reflex",
  },
  {
    href: "/strategy",
    title: "Strategy board",
    blurb: "Top-down Dust 2. Drag T/CT players, drop smokes, flashes, mollies. Save your setups.",
    tag: "tactics",
  },
  {
    href: "/quizzes",
    title: "Quizzes",
    blurb: "Callouts, economy decisions, spray patterns. Pure theory — looks like flashcards.",
    tag: "theory",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          Counter-Strike desk trainer
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Train when you can&rsquo;t play.
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--text-muted)]">
          A browser-only trainer for the hours between matches — aim drills, map theory, and a strategy board.
          Built to look unremarkable on a work monitor.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elev)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">
                {c.tag}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{c.blurb}</p>
            <div className="mt-4 text-sm text-[var(--text-muted)] group-hover:text-[var(--text)]">
              Open →
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-12 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          How it works
        </h3>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li>· Pure browser — no install, no game required.</li>
          <li>· Local-only progress (your tracker can&rsquo;t see it).</li>
          <li>· <kbd className="rounded border border-[var(--border-strong)] bg-[var(--bg-elev)] px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> swaps to a fake spreadsheet.</li>
          <li>· Works on phone under the desk too.</li>
        </ul>
      </section>
    </div>
  );
}
