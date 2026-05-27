import { useEffect, useState } from "react";
import { UniverseCanvas } from "./components/UniverseCanvas";
import { createInitialWorld } from "./sim/createWorld";
import type { Body, WorldState } from "./sim/types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const ASTEROID_COLORS = ["#d6d0c4", "#aaa49a", "#c7b7a3", "#8f8a84"];

function createSpawnedAsteroid(id: string): Body {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 260 + Math.random() * 160;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 1.2 + Math.random() * 1.3;

  const velocity = {
    x: -Math.sin(angle) * speed * direction,
    y: Math.cos(angle) * speed * direction,
  };

  const mass = 2 + Math.random() * 6;
  const radius = Math.sqrt(mass) * 2.2;

  const color =
    ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)];

  return {
    id,
    position,
    velocity,
    mass,
    radius,
    color,
  };
}

export default function App() {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);

  useEffect(() => {
    setWorld(createInitialWorld(CANVAS_WIDTH, CANVAS_HEIGHT));
  }, []);

  useEffect(() => {
    if (!world || !selectedBodyId) return;

    const selectedBodyStillExists = world.bodies.some(
      (body) => body.id === selectedBodyId,
    );

    if (!selectedBodyStillExists) {
      setSelectedBodyId(null);
    }
  }, [world, selectedBodyId]);

  function resetWorld() {
    setWorld(createInitialWorld(CANVAS_WIDTH, CANVAS_HEIGHT));
    setSelectedBodyId(null);
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

  function spawnAsteroid() {
    const asteroidId = `asteroid-${Date.now()}`;

    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      const asteroid = createSpawnedAsteroid(asteroidId);

      return {
        ...currentWorld,
        bodies: [...currentWorld.bodies, asteroid],
      };
    });

    setSelectedBodyId(asteroidId);
  }

  const selectedBody =
    world?.bodies.find((body) => body.id === selectedBodyId) ?? null;

  const selectedBodySpeed = selectedBody
    ? Math.sqrt(
        selectedBody.velocity.x * selectedBody.velocity.x +
          selectedBody.velocity.y * selectedBody.velocity.y,
      )
    : 0;
  if (!world) {
    return <main className="page">Creating universe...</main>;
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">WorldSim / Genesis Build 004</p>
        <h1>Asteroid Spawning</h1>
        <p>
          Bodies move, collide, merge, can be selected for live inspection, and
          new asteroids can now be spawned into the system.
        </p>
      </section>

      <section className="sim-layout">
        <div className="canvas-shell">
          <UniverseCanvas
            world={world}
            setWorld={setWorld}
            selectedBodyId={selectedBodyId}
            onSelectBody={setSelectedBodyId}
          />
        </div>

        <aside className="control-panel">
          <h2>Controls</h2>

          <p className="stat-line">Body Count: {world.bodies.length}</p>

          <button onClick={togglePause}>
            {world.isPaused ? "Resume Time" : "Pause Time"}
          </button>

          <button onClick={spawnAsteroid}>Spawn Asteroid</button>

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
          <div className="selected-body-panel">
            <h3>Selected Body</h3>

            {selectedBody ? (
              <div className="selected-body-details">
                <strong>{selectedBody.id}</strong>
                <span>mass: {selectedBody.mass.toFixed(1)}</span>
                <span>radius: {selectedBody.radius.toFixed(1)}</span>
                <span>
                  position: x {selectedBody.position.x.toFixed(1)}, y{" "}
                  {selectedBody.position.y.toFixed(1)}
                </span>
                <span>
                  velocity: x {selectedBody.velocity.x.toFixed(2)}, y{" "}
                  {selectedBody.velocity.y.toFixed(2)}
                </span>
                <span>speed: {selectedBodySpeed.toFixed(2)}</span>
              </div>
            ) : (
              <p>Click a body on the canvas or in the list.</p>
            )}
          </div>
          <div className="body-list">
            <h3>Bodies</h3>
            {world.bodies.map((body) => (
              <button
                key={body.id}
                type="button"
                className={`body-card ${
                  body.id === selectedBodyId ? "body-card-selected" : ""
                }`}
                onClick={() => setSelectedBodyId(body.id)}
              >
                <strong>{body.id}</strong>
                <span>mass: {body.mass}</span>
                <span>
                  x: {body.position.x.toFixed(1)}, {body.position.y.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
