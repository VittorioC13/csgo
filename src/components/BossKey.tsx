"use client";
import { useEffect, useState } from "react";

export default function BossKey() {
  const [stealth, setStealth] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStealth((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (stealth) {
      document.title = "Quarterly Forecast — Sheet 1";
      document.documentElement.classList.add("stealth-mode");
    } else {
      document.title = "Deskwork";
      document.documentElement.classList.remove("stealth-mode");
    }
  }, [stealth]);

  if (!stealth) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-white text-zinc-800">
      <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold">File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Insert</span>
          <span>Format</span>
          <span>Data</span>
          <span>Tools</span>
          <span className="ml-auto text-zinc-500">Quarterly Forecast — autosaved</span>
        </div>
      </div>
      <table className="w-full border-collapse text-xs font-mono">
        <thead>
          <tr className="bg-zinc-100">
            {["", "A", "B", "C", "D", "E", "F", "G", "H"].map((c) => (
              <th key={c} className="border border-zinc-300 px-2 py-1 text-zinc-500">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 40 }).map((_, r) => (
            <tr key={r}>
              <td className="border border-zinc-300 bg-zinc-100 px-2 py-1 text-center text-zinc-500">{r + 1}</td>
              {Array.from({ length: 8 }).map((_, c) => (
                <td key={c} className="border border-zinc-200 px-2 py-1">
                  {r === 0 && c === 0 ? "Region" : r === 0 && c === 1 ? "Q1" : r === 0 && c === 2 ? "Q2" : r === 0 && c === 3 ? "Q3" : r === 0 && c === 4 ? "Q4" : r > 0 && r < 6 && c === 0 ? ["NA", "EMEA", "APAC", "LATAM", "ROW"][r - 1] : r > 0 && r < 6 && c > 0 && c < 5 ? `$${(Math.random() * 100 + 50).toFixed(1)}K` : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fixed bottom-2 right-3 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 opacity-60">
        Esc to return
      </div>
    </div>
  );
}
