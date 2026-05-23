import type { WorldState } from "./types";

export function createInitialWorld(width: number, height: number): WorldState {
  return {
    isPaused: false,
    timeScale: 1,
    bodies: [
      {
        id: "star",
        position: { x: width / 2, y: height / 2 },
        velocity: { x: 0, y: 0 },
        mass: 10000,
        radius: 18,
        color: "#f5c542",
      },
      {
        id: "planet-1",
        position: { x: width / 2 + 140, y: height / 2 },
        velocity: { x: 0, y: 2.7 },
        mass: 10,
        radius: 7,
        color: "#5aa9ff",
      },
      {
        id: "planet-2",
        position: { x: width / 2 - 220, y: height / 2 },
        velocity: { x: 0, y: -2.1 },
        mass: 20,
        radius: 9,
        color: "#b388ff",
      },
      {
        id: "asteroid-a",
        position: { x: width / 2 + 330, y: height / 2 - 160 },
        velocity: { x: 0.7, y: 1.15 },
        mass: 4,
        radius: 5,
        color: "#d6d0c4",
      },
      {
        id: "asteroid-b",
        position: { x: width / 2 + 360, y: height / 2 - 135 },
        velocity: { x: -0.6, y: 0.85 },
        mass: 3,
        radius: 4,
        color: "#aaa49a",
      },
    ],
  };
}
