import type { Body } from "./types";

export type SpawnMode = "asteroid" | "orbiting-body" | "heavy-body";

const ASTEROID_COLORS = ["#d6d0c4", "#aaa49a", "#c7b7a3", "#8f8a84"];
const ORBITING_BODY_COLORS = ["#5aa9ff", "#4fd1c5", "#7dd3fc", "#93c5fd"];
const HEAVY_BODY_COLORS = ["#f5c542", "#ff8f70", "#f97316", "#facc15"];

function pickRandomColor(colors: string[]): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

function createTangentialVelocity(
  angle: number,
  speed: number,
  direction: 1 | -1,
) {
  return {
    x: -Math.sin(angle) * speed * direction,
    y: Math.cos(angle) * speed * direction,
  };
}

export function createBodyForSpawnMode(
  mode: SpawnMode,
  id: string,
  canvasWidth: number,
  canvasHeight: number,
): Body {
  if (mode === "orbiting-body") {
    return createSpawnedOrbitingBody(id, canvasWidth, canvasHeight);
  }

  if (mode === "heavy-body") {
    return createSpawnedHeavyBody(id, canvasWidth, canvasHeight);
  }

  return createSpawnedAsteroid(id, canvasWidth, canvasHeight);
}

function createSpawnedAsteroid(
  id: string,
  canvasWidth: number,
  canvasHeight: number,
): Body {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 260 + Math.random() * 180;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 1.2 + Math.random() * 1.5;
  const velocity = createTangentialVelocity(angle, speed, direction);

  const mass = 2 + Math.random() * 6;
  const radius = Math.sqrt(mass) * 2.2;

  return {
    id,
    name: "Asteroid",
    kind: "asteroid",
    position,
    velocity,
    mass,
    radius,
    color: pickRandomColor(ASTEROID_COLORS),
    trail: [],
  };
}

function createSpawnedOrbitingBody(
  id: string,
  canvasWidth: number,
  canvasHeight: number,
): Body {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 170 + Math.random() * 170;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 2.0 + Math.random() * 1.0;
  const velocity = createTangentialVelocity(angle, speed, direction);

  const mass = 8 + Math.random() * 18;
  const radius = Math.sqrt(mass) * 2.4;

  return {
    id,
    name: "Orbiting Body",
    kind: "planet",
    position,
    velocity,
    mass,
    radius,
    color: pickRandomColor(ORBITING_BODY_COLORS),
    trail: [],
  };
}

function createSpawnedHeavyBody(
  id: string,
  canvasWidth: number,
  canvasHeight: number,
): Body {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 300 + Math.random() * 160;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 0.7 + Math.random() * 0.8;
  const velocity = createTangentialVelocity(angle, speed, direction);

  const mass = 80 + Math.random() * 120;
  const radius = Math.sqrt(mass) * 1.8;

  return {
    id,
    name: "Heavy Body",
    kind: "star",
    position,
    velocity,
    mass,
    radius,
    color: pickRandomColor(HEAVY_BODY_COLORS),
    trail: [],
  };
}
