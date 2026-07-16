import type { Society } from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

function approach(current: number, target: number, step: number): number {
  if (current < target) {
    return Math.min(current + step, target);
  }

  if (current > target) {
    return Math.max(current - step, target);
  }

  return current;
}

export function updateSociety(society: Society): Society {
  const foodPerPerson = society.resources.food / society.population;
  const housingPerPerson = society.resources.housing / society.population;
  const energyPerPerson = society.resources.energy / society.population;

  const foundationScore = Math.min(
    foodPerPerson,
    housingPerPerson,
    energyPerPerson / 0.85,
  );

  const hasFoodSecurity = foodPerPerson >= 1;
  const hasHousingSecurity = housingPerPerson >= 1;
  const hasEnergySecurity = energyPerPerson >= 0.85;

  const hasStableFoundation =
    hasFoodSecurity && hasHousingSecurity && hasEnergySecurity;

  let healthTarget = 35;
  let educationTarget = 45;
  let socialTrustTarget = 30;
  let productivityTarget = 35;
  let presenceTarget = 30;

  if (hasStableFoundation) {
    healthTarget = 88;
    educationTarget =
      society.policy === "commonwealth" || society.policy === "balanced"
        ? 92
        : 78;
    socialTrustTarget = 86;
    productivityTarget = 82;
    presenceTarget = society.policy === "commonwealth" ? 90 : 75;
  } else if (foundationScore >= 0.75) {
    healthTarget = 65;
    educationTarget = 68;
    socialTrustTarget = 62;
    productivityTarget = 58;
    presenceTarget = 60;
  }

  const nextHealth = clamp(
    approach(society.wellbeing.health, healthTarget, 0.4),
  );

  const nextEducation = clamp(
    approach(society.wellbeing.education, educationTarget, 0.35),
  );

  const nextSocialTrust = clamp(
    approach(society.wellbeing.socialTrust, socialTrustTarget, 0.35),
  );

  const nextProductivity = clamp(
    approach(society.wellbeing.productivity, productivityTarget, 0.3),
  );

  const nextPresence = clamp(
    approach(society.wellbeing.presence, presenceTarget, 0.35),
  );

  const productivityEffectiveness = 0.35 + (nextProductivity / 100) * 0.65;

  const foodProduced = society.population * productivityEffectiveness * 1.3;
  const foodConsumed = society.population * 1.0;
  const foodLoss = society.resources.food * 0.01;

  const housingBuilt = society.population * productivityEffectiveness * 0.035;
  const housingDecay = society.resources.housing * 0.003;

  const energyProduced = society.population * productivityEffectiveness * 1.1;
  const energyConsumed = society.population * 0.85;
  const energyLoss = society.resources.energy * 0.008;

  const rawFood = Math.max(
    0,
    society.resources.food + foodProduced - foodConsumed - foodLoss,
  );

  const nextHousing = Math.max(
    0,
    society.resources.housing + housingBuilt - housingDecay,
  );

  const rawEnergy = Math.max(
    0,
    society.resources.energy + energyProduced - energyConsumed - energyLoss,
  );

  const nextFood = Math.min(rawFood, society.population * 3);
  const nextEnergy = Math.min(rawEnergy, society.population * 2.5);

  const nextFoodPerPerson = nextFood / society.population;
  const nextHousingPerPerson = nextHousing / society.population;
  const nextEnergyPerPerson = nextEnergy / society.population;

  const nextFoundationScore = Math.min(
    nextFoodPerPerson,
    nextHousingPerPerson,
    nextEnergyPerPerson / 0.85,
  );

  let populationGrowthRate = 0;

  if (nextFoundationScore >= 1 && nextHealth > 65 && nextSocialTrust > 55) {
    populationGrowthRate = 0.0015;
  } else if (nextFoundationScore >= 0.9) {
    populationGrowthRate = 0.0005;
  } else if (nextFoundationScore > 0.7) {
    populationGrowthRate = -0.002;
  } else {
    populationGrowthRate = -0.008;
  }

  const nextPopulation = Math.max(
    1,
    Math.round(society.population * (1 + populationGrowthRate)),
  );

  return {
    ...society,
    turn: society.turn + 1,
    population: nextPopulation,
    resources: {
      food: nextFood,
      housing: nextHousing,
      energy: nextEnergy,
    },
    wellbeing: {
      health: nextHealth,
      education: nextEducation,
      socialTrust: nextSocialTrust,
      productivity: nextProductivity,
      presence: nextPresence,
    },
  };
}
