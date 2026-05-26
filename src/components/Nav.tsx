"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/aim", label: "Aim" },
  { href: "/strategy", label: "Strategy" },
  { href: "/quizzes", label: "Quizzes" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-elev)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--accent)]" />
          <span className="font-semibold">desk.train</span>
          <span className="text-[var(--text-muted)]">/cs</span>
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    "rounded-md px-3 py-1.5 transition-colors " +
                    (active
                      ? "bg-[var(--bg-card)] text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]")
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
