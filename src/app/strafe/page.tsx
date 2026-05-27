import CounterStrafe from "@/components/CounterStrafe";

export const metadata = { title: "Counter-strafe — Deskwork" };

export default function StrafePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Module 04</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Counter-strafe trainer</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          You can only shoot accurately when stationary. Counter-strafing — release the move key and tap the opposite
          (A↔D, W↔S) — is what separates DMG from Global. Movement here uses the real CS2 ground equations
          (sv_accelerate 5.5, sv_friction 5.2, sv_stopspeed 80) at 128 tick, so a clean counter-strafe stops you in
          ~80 ms vs. ~400 ms for friction alone.
        </p>
      </header>
      <CounterStrafe />
    </div>
  );
}
