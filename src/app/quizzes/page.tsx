import Quizzes from "@/components/Quizzes";

export const metadata = { title: "Quizzes — Deskwork" };

export default function QuizzesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">Module 03</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Theory quizzes</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Callouts, economy decisions, spray-pattern reference. Looks like flashcards — works at the desk.
        </p>
      </header>
      <Quizzes />
    </div>
  );
}
