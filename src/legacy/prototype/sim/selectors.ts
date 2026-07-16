import type { Body, WorldState } from "./types";

export function getBodySpeed(body: Body): number {
  return Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
}

export function getTotalMass(world: WorldState): number {
  return world.bodies.reduce((total, body) => total + body.mass, 0);
}

export function getAverageSpeed(world: WorldState): number {
  if (world.bodies.length === 0) return 0;

  const totalSpeed = world.bodies.reduce(
    (total, body) => total + getBodySpeed(body),
    0,
  );

  return totalSpeed / world.bodies.length;
}

export function getHeaviestBody(world: WorldState): Body | null {
  if (world.bodies.length === 0) return null;

  return world.bodies.reduce((heaviestBody, currentBody) => {
    return currentBody.mass > heaviestBody.mass ? currentBody : heaviestBody;
  });
}

export function getFastestBody(world: WorldState): Body | null {
  if (world.bodies.length === 0) return null;

  return world.bodies.reduce((fastestBody, currentBody) => {
    return getBodySpeed(currentBody) > getBodySpeed(fastestBody)
      ? currentBody
      : fastestBody;
  });
}
