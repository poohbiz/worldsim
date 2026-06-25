export type SocietyPolicy = "survival" | "balanced" | "commonwealth";

export type SocietyResources = {
  food: number;
  housing: number;
  energy: number;
};

export type SocietyWellbeing = {
  health: number;
  education: number;
  socialTrust: number;
  productivity: number;
  presence: number;
};

export type Society = {
  id: string;
  name: string;
  homeBodyId: string | null;
  turn: number;
  population: number;
  policy: SocietyPolicy;
  resources: SocietyResources;
  wellbeing: SocietyWellbeing;
};
