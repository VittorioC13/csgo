type Region = { id: string; label: string; d: string; cx: number; cy: number };

export const DUST2_REGIONS: Region[] = [
  { id: "b-site", label: "B site", d: "M40,40 L300,40 L300,200 L40,200 Z", cx: 170, cy: 120 },
  { id: "ct-spawn", label: "CT spawn", d: "M380,40 L620,40 L620,180 L380,180 Z", cx: 500, cy: 110 },
  { id: "a-site", label: "A site", d: "M700,40 L960,40 L960,240 L700,240 Z", cx: 830, cy: 140 },
  { id: "b-doors", label: "B doors", d: "M120,200 L260,200 L260,320 L120,320 Z", cx: 190, cy: 260 },
  { id: "ct-mid", label: "CT mid", d: "M420,180 L580,180 L580,300 L420,300 Z", cx: 500, cy: 240 },
  { id: "short", label: "Short / Cat", d: "M620,240 L700,240 L700,360 L620,360 Z", cx: 660, cy: 300 },
  { id: "long", label: "Long A", d: "M740,240 L960,240 L960,500 L740,500 Z", cx: 850, cy: 370 },
  { id: "b-tunnels", label: "B tunnels", d: "M40,320 L260,320 L260,460 L40,460 Z", cx: 150, cy: 390 },
  { id: "mid", label: "Mid", d: "M420,300 L580,300 L580,500 L420,500 Z", cx: 500, cy: 400 },
  { id: "long-doors", label: "Long doors", d: "M620,440 L740,440 L740,540 L620,540 Z", cx: 680, cy: 490 },
  { id: "outside-t", label: "Outside / Pit", d: "M740,500 L960,500 L960,600 L740,600 Z", cx: 850, cy: 550 },
  { id: "upper-tunnel", label: "Upper tunnel", d: "M40,460 L260,460 L260,560 L40,560 Z", cx: 150, cy: 510 },
  { id: "t-ramp", label: "T ramp", d: "M280,440 L400,440 L400,560 L280,560 Z", cx: 340, cy: 500 },
  { id: "t-spawn", label: "T spawn", d: "M280,580 L720,580 L720,680 L280,680 Z", cx: 500, cy: 630 },
];

export default function Dust2Map({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 1000 700" className="block h-auto w-full select-none" preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="1000" height="700" fill="#0f0f12" />
      <g>
        {DUST2_REGIONS.map((r) => (
          <g key={r.id}>
            <path d={r.d} fill="#1d1d22" stroke="#3a3a44" strokeWidth={1.5} />
            <text
              x={r.cx}
              y={r.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#7a7a86"
              fontSize={13}
              fontFamily="ui-monospace, monospace"
              pointerEvents="none"
            >
              {r.label}
            </text>
          </g>
        ))}
        <text x="500" y="30" textAnchor="middle" fill="#3a3a44" fontSize={11} fontFamily="ui-monospace, monospace" pointerEvents="none">
          DE_DUST2 · CT SIDE
        </text>
        <text x="500" y="695" textAnchor="middle" fill="#3a3a44" fontSize={11} fontFamily="ui-monospace, monospace" pointerEvents="none">
          T SIDE
        </text>
      </g>
      {children}
    </svg>
  );
}
