export type Vector2 = {
  x: number;
  y: number;
};

export type BodyKind =
  | "star"
  | "planet"
  | "moon"
  | "asteroid"
  | "black-hole"
  | "unknown";

export type Body = {
  id: string;
  name: string;
  kind: BodyKind;
  position: Vector2;
  velocity: Vector2;
  mass: number;
  radius: number;
  color: string;
  trail: Vector2[];
};

export type WorldScale = "sandbox" | "star-system" | "galaxy" | "universe";

export type WorldState = {
  id: string;
  name: string;
  scale: WorldScale;
  bodies: Body[];
  timeScale: number;
  isPaused: boolean;
  showTrails: boolean;
};
