export type Vector2 = {
  x: number;
  y: number;
};

export type Body = {
  id: string;
  position: Vector2;
  velocity: Vector2;
  mass: number;
  radius: number;
  color: string;
  trail: Vector2[];
};

export type WorldState = {
  bodies: Body[];
  timeScale: number;
  isPaused: boolean;
  showTrails: boolean;
};
