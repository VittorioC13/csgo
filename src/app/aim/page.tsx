import AimTrainer from "@/components/AimTrainer";

export const metadata = { title: "Aim — Deskwork" };

export default function AimPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Module 01</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Aim trainer</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Browser drills for flicks and tracking. Won&rsquo;t replace Aim Lab muscle memory perfectly — but builds
          mouse discipline in five-minute sessions at the desk.
        </p>
      </header>
      <AimTrainer />
    </div>
  );
}
