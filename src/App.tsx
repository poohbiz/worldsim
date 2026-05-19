import { useEffect, useState } from "react";
import { UniverseCanvas } from "./components/UniverseCanvas";
import { createInitialWorld } from "./sim/createWorld";
import type { WorldState } from "./sim/types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

export default function App() {
  const [world, setWorld] = useState<WorldState | null>(null);

  useEffect(() => {
    setWorld(createInitialWorld(CANVAS_WIDTH, CANVAS_HEIGHT));
  }, []);

  function resetWorld() {
    setWorld(createInitialWorld(CANVAS_WIDTH, CANVAS_HEIGHT));
  }

  function togglePause() {
    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      return {
        ...currentWorld,
        isPaused: !currentWorld.isPaused,
      };
    });
  }

  function changeTimeScale(value: number) {
    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      return {
        ...currentWorld,
        timeScale: value,
      };
    });
  }

  if (!world) {
    return <main className="page">Creating universe...</main>;
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">WorldSim / Genesis Build 001</p>
        <h1>First Universe Loop</h1>
        <p>
          Bodies exist in space, move through time, and pull on each other with
          gravity.
        </p>
      </section>

      <section className="sim-layout">
        <div className="canvas-shell">
          <UniverseCanvas setWorld={setWorld} />
        </div>

        <aside className="control-panel">
          <h2>Controls</h2>

          <button onClick={togglePause}>
            {world.isPaused ? "Resume Time" : "Pause Time"}
          </button>

          <button onClick={resetWorld}>Reset Universe</button>

          <label>
            Time Scale: {world.timeScale.toFixed(1)}x
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={world.timeScale}
              onChange={(event) => changeTimeScale(Number(event.target.value))}
            />
          </label>

          <div className="body-list">
            <h3>Bodies</h3>
            {world.bodies.map((body) => (
              <div key={body.id} className="body-card">
                <strong>{body.id}</strong>
                <span>mass: {body.mass}</span>
                <span>
                  x: {body.position.x.toFixed(1)}, y:{" "}
                  {body.position.y.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
