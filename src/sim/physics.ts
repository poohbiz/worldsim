import type { Body } from "./types";

const G = 0.08;
const SOFTENING = 25;

export function updateBodies(bodies: Body[], dt: number): Body[] {
  const updatedBodies = bodies.map((body) => ({
    ...body,
    position: { ...body.position },
    velocity: { ...body.velocity },
  }));

  for (let i = 0; i < updatedBodies.length; i++) {
    const bodyA = updatedBodies[i];

    let accelerationX = 0;
    let accelerationY = 0;

    for (let j = 0; j < updatedBodies.length; j++) {
      if (i === j) continue;

      const bodyB = updatedBodies[j];

      const dx = bodyB.position.x - bodyA.position.x;
      const dy = bodyB.position.y - bodyA.position.y;

      const distanceSquared = dx * dx + dy * dy + SOFTENING;
      const distance = Math.sqrt(distanceSquared);

      const force = (G * bodyB.mass) / distanceSquared;

      accelerationX += force * (dx / distance);
      accelerationY += force * (dy / distance);
    }

    bodyA.velocity.x += accelerationX * dt;
    bodyA.velocity.y += accelerationY * dt;
  }

  for (const body of updatedBodies) {
    body.position.x += body.velocity.x * dt;
    body.position.y += body.velocity.y * dt;
  }

  return updatedBodies;
}
