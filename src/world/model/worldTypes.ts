export const WORLD_SCHEMA_VERSION = 1 as const;

export type WorldSaveV1 = {
  schemaVersion: typeof WORLD_SCHEMA_VERSION;

  id: string;
  name: string;
  seed: number;

  createdAt: number;
  updatedAt: number;
  ageYears: number;
};

export type WorldSave = WorldSaveV1;
