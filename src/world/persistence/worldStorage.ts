import type { WorldSave } from "../model/worldTypes";
import { isWorldSave } from "../model/validateWorld";

const ACTIVE_WORLD_KEY = "worldsim.active-world";

export type LoadWorldResult =
  | {
      ok: true;
      world: WorldSave | null;
    }
  | {
      ok: false;
      world: null;
      error: string;
    };

export type SaveWorldResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export function loadActiveWorld(): LoadWorldResult {
  try {
    const storedValue = localStorage.getItem(ACTIVE_WORLD_KEY);

    if (!storedValue) {
      return {
        ok: true,
        world: null,
      };
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isWorldSave(parsedValue)) {
      return {
        ok: false,
        world: null,
        error: "The saved WorldSim world is invalid or incompatible.",
      };
    }

    return {
      ok: true,
      world: parsedValue,
    };
  } catch (error) {
    console.error("Failed to load the active world.", error);

    return {
      ok: false,
      world: null,
      error: "WorldSim could not load the saved world.",
    };
  }
}

export function saveActiveWorld(world: WorldSave): SaveWorldResult {
  try {
    localStorage.setItem(ACTIVE_WORLD_KEY, JSON.stringify(world));

    return {
      ok: true,
    };
  } catch (error) {
    console.error("Failed to save the active world.", error);

    return {
      ok: false,
      error: "WorldSim could not save the world.",
    };
  }
}

export function deleteActiveWorld(): SaveWorldResult {
  try {
    localStorage.removeItem(ACTIVE_WORLD_KEY);

    return {
      ok: true,
    };
  } catch (error) {
    console.error("Failed to delete the active world.", error);

    return {
      ok: false,
      error: "WorldSim could not remove the saved world.",
    };
  }
}
