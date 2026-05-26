export type EcoChoice = "eco" | "force" | "full";

export type EcoScenario = {
  id: string;
  prompt: string;
  details: string[];
  answer: EcoChoice;
  rationale: string;
};

export const ECONOMY_SCENARIOS: EcoScenario[] = [
  {
    id: "pistol-start",
    prompt: "Round 1 — pistol round on Dust 2.",
    details: ["Everyone has $800.", "Score 0-0."],
    answer: "full",
    rationale:
      "Pistol round = full buy. Spend on the best pistol your team plays (USP/P250/Glock) plus armor + a flash or smoke. Winning pistol swings the half.",
  },
  {
    id: "lost-pistol",
    prompt: "You lost the pistol. Round 2.",
    details: ["You have $1,400.", "Your team avg $1,600.", "Enemy will have full util + upgraded pistols."],
    answer: "eco",
    rationale:
      "Save. Trying to fight a full-util enemy with $1,400 burns the gun for round 3. Buy minimal (P250 max) and stack a site to bait an Eco-round win.",
  },
  {
    id: "won-pistol",
    prompt: "You won the pistol. Round 2.",
    details: ["You have $3,300.", "Bonus puts everyone over $3,000."],
    answer: "full",
    rationale:
      "Anti-eco / SMG buy. Get MP9/MAC-10 + armor + util. SMGs print money on kills, and the enemy is on a forced buy at best.",
  },
  {
    id: "loss-bonus-1500",
    prompt: "You're 0-3, on a loss bonus.",
    details: ["You have $2,800.", "Teammates avg $2,400.", "Need to rebuild economy."],
    answer: "eco",
    rationale:
      "Full save. Buying half-rifles now wastes both this round AND next. Take the L this round, full buy with $3,400 loss bonus + base $1k next round.",
  },
  {
    id: "force-window",
    prompt: "You're 6-7. Enemy lost last round and will be on a partial buy.",
    details: ["You have $4,200.", "Teammates avg $4,000.", "Enemy will have ~$3,500."],
    answer: "force",
    rationale:
      "Force-buy. Even buy on both sides — winning here gives you economy lead. Galil/FAMAS + armor + util beats a half-buy at ~$3,500.",
  },
  {
    id: "full-vs-full",
    prompt: "Round 10, 5-4 you. Both teams full economy.",
    details: ["You have $5,800.", "Everyone full buy.", "Standard round."],
    answer: "full",
    rationale: "Full buy. AK/M4 + armor + nades. Play your default setup.",
  },
  {
    id: "1500-trap",
    prompt: "You have $2,500 after losing two in a row. Teammates have $5,000+.",
    details: ["Your money: $2,500.", "Team avg: $5,200.", "Enemy on full buy."],
    answer: "eco",
    rationale:
      "Save individually — but don't drag the team down. Ask for a drop. Buying a Galil here puts you ammo-light and underleveled vs M4s.",
  },
  {
    id: "ct-anti-eco",
    prompt: "You're CT, won last round. Enemy is on a full save.",
    details: ["You have $5,500.", "Enemy under $1,500 each."],
    answer: "full",
    rationale:
      "Full buy with anti-eco util — shotgun on one site (MAG-7/Nova) or just AWP + util. Don't peek aggressively; let them run into you.",
  },
  {
    id: "broken-eco",
    prompt: "Mid-half, 4-7. You and one teammate have $4,000, the other three have ~$1,800.",
    details: ["Team is split.", "Enemy will have full buy."],
    answer: "eco",
    rationale:
      "Coordinated save. A split buy with three weak players loses 4v5. Save together, drop weapons next round, hit them at full strength.",
  },
  {
    id: "second-half-pistol",
    prompt: "Second half pistol. Score 9-6 you on T side, now CT.",
    details: ["Everyone $800.", "First round on the opposite side."],
    answer: "full",
    rationale:
      "Pistol = full. CT side: USP + kit on AWPer if planned, otherwise armor + util + P250 on one site stacker.",
  },
];
