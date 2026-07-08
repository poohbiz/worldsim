import type { Body } from "./types";

const STAR_NAMES = [
  "Asterion",
  "Solara",
  "Helion",
  "Caelus",
  "Eos",
  "Vesper",
  "Orionis",
  "Aureon",
  "Solis",
  "Ignara",
];

const PLANET_NAMES = [
  "Zion",
  "Namek",
  "Elaris",
  "Veyra",
  "Thalassa",
  "Solace",
  "Kairo",
  "Numa",
  "Aurelia",
  "Eden",
  "Morrow",
  "Luma",
  "Vanta",
  "Ionia",
  "Cyris",
  "Nalara",
  "Oryn",
  "Vael",
  "Tirra",
  "Halcyon",
];

const ASTEROID_NAMES = [
  "Grey Shard",
  "Cinder Rock",
  "Mote",
  "Driftstone",
  "Iron Seed",
  "Ash Fragment",
  "Pale Stone",
  "Rift Pebble",
  "Dustborn",
  "Cold Shard",
  "Ember Chip",
  "Gravelite",
];

function pickRandomItem(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}

function getPoolForKind(kind: Body["kind"]): string[] {
  if (kind === "star" || kind === "black-hole") return STAR_NAMES;
  if (kind === "planet" || kind === "moon") return PLANET_NAMES;
  if (kind === "asteroid") return ASTEROID_NAMES;

  return PLANET_NAMES;
}

function formatKind(kind: Body["kind"]): string {
  return kind
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateBodyName(
  kind: Body["kind"],
  existingNames: string[],
): string {
  const pool = getPoolForKind(kind);
  const availableNames = pool.filter((name) => !existingNames.includes(name));

  if (availableNames.length > 0) {
    return pickRandomItem(availableNames);
  }

  return `${formatKind(kind)} ${existingNames.length + 1}`;
}

export function createMergedBodyName(bodyA: Body, bodyB: Body): string {
  const primaryBody = bodyA.mass >= bodyB.mass ? bodyA : bodyB;
  const secondaryBody = primaryBody.id === bodyA.id ? bodyB : bodyA;

  if (primaryBody.kind === "star") {
    return primaryBody.name;
  }

  if (primaryBody.kind === "planet" && secondaryBody.kind === "asteroid") {
    return primaryBody.name;
  }

  if (primaryBody.kind === "planet" && secondaryBody.kind === "moon") {
    return primaryBody.name;
  }

  if (primaryBody.kind === "planet" && secondaryBody.kind === "planet") {
    return `${primaryBody.name}-${secondaryBody.name}`;
  }

  if (primaryBody.kind === "asteroid" && secondaryBody.kind === "asteroid") {
    return primaryBody.name;
  }

  return primaryBody.name;
}
