import type { Body } from "./types";

const G = 0.08;
const SOFTENING = 25;
const MAX_TRAIL_LENGTH = 120;

export function updateBodies(bodies: Body[], dt: number): Body[] {
  let updatedBodies = bodies.map((body) => ({
    ...body,
    position: { ...body.position },
    velocity: { ...body.velocity },
    trail: [...body.trail],
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

    body.trail.push({ ...body.position });

    if (body.trail.length > MAX_TRAIL_LENGTH) {
      body.trail.shift();
    }
  }

  updatedBodies = mergeCollidingBodies(updatedBodies);

  return updatedBodies;
}

function mergeCollidingBodies(bodies: Body[]): Body[] {
  const remainingBodies = [...bodies];
  let didMerge = true;

  while (didMerge) {
    didMerge = false;

    for (let i = 0; i < remainingBodies.length; i++) {
      for (let j = i + 1; j < remainingBodies.length; j++) {
        const bodyA = remainingBodies[i];
        const bodyB = remainingBodies[j];

        if (areBodiesColliding(bodyA, bodyB)) {
          const mergedBody = mergeBodies(bodyA, bodyB);

          remainingBodies.splice(j, 1);
          remainingBodies.splice(i, 1);
          remainingBodies.push(mergedBody);

          didMerge = true;
          break;
        }
      }

      if (didMerge) break;
    }
  }

  return remainingBodies;
}

function areBodiesColliding(bodyA: Body, bodyB: Body): boolean {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= bodyA.radius + bodyB.radius;
}

function mergeBodies(bodyA: Body, bodyB: Body): Body {
  const totalMass = bodyA.mass + bodyB.mass;

  const position = {
    x:
      (bodyA.position.x * bodyA.mass + bodyB.position.x * bodyB.mass) /
      totalMass,
    y:
      (bodyA.position.y * bodyA.mass + bodyB.position.y * bodyB.mass) /
      totalMass,
  };

  const velocity = {
    x:
      (bodyA.velocity.x * bodyA.mass + bodyB.velocity.x * bodyB.mass) /
      totalMass,
    y:
      (bodyA.velocity.y * bodyA.mass + bodyB.velocity.y * bodyB.mass) /
      totalMass,
  };

  const radius = Math.sqrt(
    bodyA.radius * bodyA.radius + bodyB.radius * bodyB.radius,
  );

  const largerBody = bodyA.mass >= bodyB.mass ? bodyA : bodyB;
  const trail = [...largerBody.trail, position].slice(-MAX_TRAIL_LENGTH);

  return {
    id: createMergedId(largerBody, totalMass),
    name: createMergedName(largerBody, totalMass),
    kind: largerBody.kind,
    position,
    velocity,
    mass: totalMass,
    radius,
    color: largerBody.color,
    trail,
  };
}

function getBaseId(id: string): string {
  return id.split("+")[0];
}

function createMergedId(largerBody: Body, totalMass: number): string {
  const baseId = getBaseId(largerBody.id);
  return `${baseId}+m${Math.round(totalMass)}`;
}

function createMergedName(largerBody: Body, totalMass: number): string {
  return `${largerBody.name} Merged ${Math.round(totalMass)}`;
}
