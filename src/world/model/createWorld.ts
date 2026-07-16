import { WORLD_SCHEMA_VERSION, type WorldSave } from "./worldTypes";
import { validateWorldName } from "./validateWorld";

function generateWorldSeed(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);

  return values[0];
}

export function createWorld(name: string): WorldSave {
  const nameError = validateWorldName(name);

  if (nameError) {
    throw new Error(nameError);
  }

  const now = Date.now();

  return {
    schemaVersion: WORLD_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name: name.trim(),
    seed: generateWorldSeed(),
    createdAt: now,
    updatedAt: now,
    ageYears: 0,
  };
}
