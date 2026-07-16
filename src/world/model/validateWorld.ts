import { WORLD_SCHEMA_VERSION, type WorldSave } from "./worldTypes";

const MIN_WORLD_NAME_LENGTH = 2;
const MAX_WORLD_NAME_LENGTH = 40;

export function validateWorldName(name: string): string | null {
  const trimmedName = name.trim();

  if (trimmedName.length < MIN_WORLD_NAME_LENGTH) {
    return `World names must contain at least ${MIN_WORLD_NAME_LENGTH} characters.`;
  }

  if (trimmedName.length > MAX_WORLD_NAME_LENGTH) {
    return `World names cannot exceed ${MAX_WORLD_NAME_LENGTH} characters.`;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isWorldSave(value: unknown): value is WorldSave {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaVersion === WORLD_SCHEMA_VERSION &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    validateWorldName(value.name) === null &&
    typeof value.seed === "number" &&
    Number.isFinite(value.seed) &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt) &&
    typeof value.updatedAt === "number" &&
    Number.isFinite(value.updatedAt) &&
    typeof value.ageYears === "number" &&
    Number.isFinite(value.ageYears) &&
    value.ageYears >= 0
  );
}
