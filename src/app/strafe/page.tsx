import CounterStrafe from "@/components/CounterStrafe";

export const metadata = { title: "Counter-strafe — Deskwork" };

export default function StrafePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Module 04</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Counter-strafe trainer</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          You can only shoot accurately when stationary. Counter-strafing — tapping the opposite key (A↔D, W↔S) — is
          what separates DMG from Global. Move to the dot, stop on it, click to shoot. You only score if your velocity
          is near zero on the click.
        </p>
      </header>
      <CounterStrafe />
    </div>
  );
}
