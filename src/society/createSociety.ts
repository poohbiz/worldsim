import type { Society } from "./types";

export function createLivingCommonwealthSeed(
  homeBodyId: string | null = null,
): Society {
  return {
    id: "living-commonwealth-seed",
    name: "Living Commonwealth Seed",
    homeBodyId,
    turn: 0,
    population: 1000,
    policy: "commonwealth",
    resources: {
      food: 1300,
      housing: 1100,
      energy: 1000,
    },
    wellbeing: {
      health: 78,
      education: 72,
      socialTrust: 68,
      productivity: 66,
      presence: 70,
    },
  };
}
