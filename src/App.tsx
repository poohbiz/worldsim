import { useEffect, useState } from "react";
import { UniverseCanvas } from "./components/UniverseCanvas";
import { createInitialWorld } from "./sim/createWorld";
import type { Body, WorldState } from "./sim/types";

type SpawnMode = "asteroid" | "orbiting-body" | "heavy-body";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const ASTEROID_COLORS = ["#d6d0c4", "#aaa49a", "#c7b7a3", "#8f8a84"];
const ORBITING_BODY_COLORS = ["#5aa9ff", "#4fd1c5", "#7dd3fc", "#93c5fd"];
const HEAVY_BODY_COLORS = ["#f5c542", "#ff8f70", "#f97316", "#facc15"];

function pickRandomColor(colors: string[]): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

function createTangentialVelocity(
  angle: number,
  speed: number,
  direction: 1 | -1,
) {
  return {
    x: -Math.sin(angle) * speed * direction,
    y: Math.cos(angle) * speed * direction,
  };
}

function createSpawnedAsteroid(id: string): Body {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 260 + Math.random() * 180;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 1.2 + Math.random() * 1.5;

  const velocity = createTangentialVelocity(angle, speed, direction);

  const mass = 2 + Math.random() * 6;
  const radius = Math.sqrt(mass) * 2.2;

  return {
    id,
    position,
    velocity,
    mass,
    radius,
    color: pickRandomColor(ASTEROID_COLORS),
    trail: [],
  };
}

function createSpawnedOrbitingBody(id: string): Body {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 170 + Math.random() * 170;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 2.0 + Math.random() * 1.0;
  const velocity = createTangentialVelocity(angle, speed, direction);

  const mass = 8 + Math.random() * 18;
  const radius = Math.sqrt(mass) * 2.4;

  return {
    id,
    position,
    velocity,
    mass,
    radius,
    color: pickRandomColor(ORBITING_BODY_COLORS),
    trail: [],
  };
}

function createSpawnedHeavyBody(id: string): Body {
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;

  const angle = Math.random() * Math.PI * 2;
  const distanceFromCenter = 300 + Math.random() * 160;

  const position = {
    x: centerX + Math.cos(angle) * distanceFromCenter,
    y: centerY + Math.sin(angle) * distanceFromCenter,
  };

  const direction = Math.random() > 0.5 ? 1 : -1;
  const speed = 0.7 + Math.random() * 0.8;
  const velocity = createTangentialVelocity(angle, speed, direction);

  const mass = 80 + Math.random() * 120;
  const radius = Math.sqrt(mass) * 1.8;

  return {
    id,
    position,
    velocity,
    mass,
    radius,
    color: pickRandomColor(HEAVY_BODY_COLORS),
    trail: [],
  };
}

function createBodyForSpawnMode(mode: SpawnMode, id: string): Body {
  if (mode === "orbiting-body") {
    return createSpawnedOrbitingBody(id);
  }

  if (mode === "heavy-body") {
    return createSpawnedHeavyBody(id);
  }

  return createSpawnedAsteroid(id);
}

export default function App() {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [spawnMode, setSpawnMode] = useState<SpawnMode>("asteroid");

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

  function toggleTrails() {
    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      return {
        ...currentWorld,
        showTrails: !currentWorld.showTrails,
      };
    });
  }

  function deleteSelectedBody() {
    if (!selectedBodyId) return;

    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      return {
        ...currentWorld,
        bodies: currentWorld.bodies.filter(
          (body) => body.id !== selectedBodyId,
        ),
      };
    });

    setSelectedBodyId(null);
  }

  function clearAsteroids() {
    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      return {
        ...currentWorld,
        bodies: currentWorld.bodies.filter(
          (body) => !body.id.startsWith("asteroid"),
        ),
      };
    });

    setSelectedBodyId((currentSelectedBodyId) => {
      if (!currentSelectedBodyId) return null;

      return currentSelectedBodyId.startsWith("asteroid")
        ? null
        : currentSelectedBodyId;
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

  function spawnBody() {
    const bodyId = `${spawnMode}-${Date.now()}`;

    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      const body = createBodyForSpawnMode(spawnMode, bodyId);

      return {
        ...currentWorld,
        bodies: [...currentWorld.bodies, body],
      };
    });

    setSelectedBodyId(bodyId);
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
        <p className="eyebrow">WorldSim / Genesis Build 007</p>
        <h1>Sandbox Controls</h1>
        <p>
          Bodies move, collide, merge, leave trails, can be spawned in different
          modes, and can now be removed from the sandbox.
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

          <label>
            Spawn Mode
            <select
              value={spawnMode}
              onChange={(event) =>
                setSpawnMode(event.target.value as SpawnMode)
              }
            >
              <option value="asteroid">Asteroid</option>
              <option value="orbiting-body">Orbiting Body</option>
              <option value="heavy-body">Heavy Body</option>
            </select>
          </label>

          <button onClick={spawnBody}>Spawn Body</button>

          <button onClick={deleteSelectedBody} disabled={!selectedBody}>
            Delete Selected Body
          </button>

          <button onClick={clearAsteroids}>Clear Asteroids</button>

          <button onClick={toggleTrails}>
            {world.showTrails ? "Hide Trails" : "Show Trails"}
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
