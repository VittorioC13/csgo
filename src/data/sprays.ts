export type SprayPoint = { x: number; y: number };
export type SprayPattern = {
  id: string;
  weapon: string;
  side: "T" | "CT" | "both";
  notes: string;
  points: SprayPoint[];
};

// Stylized recoil patterns (not pixel-perfect — meant for shape memorization).
// Points are normalized to a 0-100 coordinate space, (50, 95) ≈ first shot.

export const SPRAY_PATTERNS: SprayPattern[] = [
  {
    id: "ak47",
    weapon: "AK-47",
    side: "T",
    notes: "First 4 bullets nearly straight up. Pull DOWN. Bullets 5-9 drift right — pull LEFT. Final bullets oscillate left-right.",
    points: [
      { x: 50, y: 95 }, { x: 50, y: 85 }, { x: 50, y: 75 }, { x: 51, y: 65 },
      { x: 55, y: 56 }, { x: 60, y: 48 }, { x: 65, y: 42 }, { x: 67, y: 38 }, { x: 65, y: 34 },
      { x: 60, y: 32 }, { x: 54, y: 31 }, { x: 48, y: 32 }, { x: 42, y: 33 }, { x: 38, y: 34 },
      { x: 42, y: 31 }, { x: 48, y: 29 }, { x: 54, y: 28 }, { x: 60, y: 27 }, { x: 65, y: 26 },
      { x: 62, y: 25 }, { x: 56, y: 24 }, { x: 50, y: 24 }, { x: 44, y: 25 }, { x: 40, y: 26 },
      { x: 44, y: 24 }, { x: 50, y: 23 }, { x: 56, y: 23 }, { x: 62, y: 22 },
    ],
  },
  {
    id: "m4a4",
    weapon: "M4A4",
    side: "CT",
    notes: "Initial vertical climb is shorter than AK. After ~6 bullets, pull LEFT then RIGHT. More forgiving, but 30 rounds = longer tail.",
    points: [
      { x: 50, y: 95 }, { x: 50, y: 87 }, { x: 50, y: 78 }, { x: 51, y: 70 }, { x: 53, y: 62 },
      { x: 56, y: 56 }, { x: 60, y: 50 }, { x: 63, y: 45 }, { x: 62, y: 41 }, { x: 58, y: 38 },
      { x: 52, y: 36 }, { x: 46, y: 35 }, { x: 42, y: 35 }, { x: 40, y: 34 }, { x: 44, y: 32 },
      { x: 50, y: 31 }, { x: 56, y: 30 }, { x: 60, y: 29 }, { x: 58, y: 27 }, { x: 52, y: 26 },
      { x: 46, y: 26 }, { x: 42, y: 25 }, { x: 46, y: 23 }, { x: 52, y: 22 }, { x: 56, y: 22 },
      { x: 52, y: 21 }, { x: 48, y: 21 }, { x: 50, y: 20 },
    ],
  },
  {
    id: "m4a1s",
    weapon: "M4A1-S",
    side: "CT",
    notes: "Tightest pattern of the three rifles. Pull straight down with minor right→left after bullet 5. Only 20 rounds — burst, don't spray.",
    points: [
      { x: 50, y: 95 }, { x: 50, y: 87 }, { x: 50, y: 79 }, { x: 51, y: 72 }, { x: 53, y: 65 },
      { x: 56, y: 59 }, { x: 58, y: 54 }, { x: 56, y: 49 }, { x: 52, y: 46 }, { x: 48, y: 44 },
      { x: 46, y: 41 }, { x: 49, y: 38 }, { x: 52, y: 36 }, { x: 50, y: 34 }, { x: 47, y: 32 },
      { x: 50, y: 30 }, { x: 53, y: 29 }, { x: 50, y: 27 }, { x: 48, y: 26 }, { x: 50, y: 25 },
    ],
  },
];
