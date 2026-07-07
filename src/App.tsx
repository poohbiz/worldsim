import { useEffect, useState } from "react";
import { UniverseCanvas } from "./components/UniverseCanvas";
import { createInitialWorld } from "./sim/createWorld";
import {
  getAverageSpeed,
  getBodySpeed,
  getFastestBody,
  getHeaviestBody,
  getTotalMass,
} from "./sim/selectors";
import { createBodyForSpawnMode, type SpawnMode } from "./sim/spawnBodies";
import type { BodyMergeEvent, WorldState } from "./sim/types";
import type { WorldEvent } from "./events/types";
import { createLivingCommonwealthSeed } from "./society/createSociety";
import { updateSociety } from "./society/updateSociety";
import type { Society } from "./society/types";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

export default function App() {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [spawnMode, setSpawnMode] = useState<SpawnMode>("asteroid");
  const [society, setSociety] = useState<Society | null>(null);
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>([]);

  useEffect(() => {
    const initialWorld = createInitialWorld(CANVAS_WIDTH, CANVAS_HEIGHT);

    setWorld(initialWorld);
    setSociety(createLivingCommonwealthSeed("planet-1"));
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

  function addWorldEvents(events: Array<Omit<WorldEvent, "id" | "createdAt">>) {
    setWorldEvents((currentEvents) => {
      const newEvents = events.map((event) => ({
        ...event,
        id: `${event.kind}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        createdAt: Date.now(),
      }));

      return [...newEvents, ...currentEvents].slice(0, 12);
    });
  }

  function getSocietyFoundationScore(currentSociety: Society): number {
    return Math.min(
      currentSociety.resources.food / currentSociety.population,
      currentSociety.resources.housing / currentSociety.population,
      currentSociety.resources.energy / currentSociety.population / 0.85,
    );
  }

  function resetWorld() {
    const initialWorld = createInitialWorld(CANVAS_WIDTH, CANVAS_HEIGHT);

    setWorld(initialWorld);
    setSociety(createLivingCommonwealthSeed("planet-1"));
    setSelectedBodyId(null);

    addWorldEvents([
      {
        kind: "system",
        importance: "medium",
        message: "Genesis System was reset.",
      },
    ]);
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

    const bodyToDelete =
      world?.bodies.find((body) => body.id === selectedBodyId) ?? null;

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

    if (bodyToDelete) {
      addWorldEvents([
        {
          kind: "user-action",
          importance: "medium",
          message: `Deleted ${bodyToDelete.name}.`,
        },
      ]);

      if (society?.homeBodyId === bodyToDelete.id) {
        setSociety({
          ...society,
          homeBodyId: null,
        });

        addWorldEvents([
          {
            kind: "warning",
            importance: "high",
            message: `${society.name} lost its home world.`,
          },
        ]);
      }
    }
  }

  function clearAsteroids() {
    const asteroidCount =
      world?.bodies.filter((body) => body.kind === "asteroid").length ?? 0;

    setWorld((currentWorld) => {
      if (!currentWorld) return currentWorld;

      return {
        ...currentWorld,
        bodies: currentWorld.bodies.filter((body) => body.kind !== "asteroid"),
      };
    });

    setSelectedBodyId((currentSelectedBodyId) => {
      if (!currentSelectedBodyId || !world) return null;

      const selectedBody = world.bodies.find(
        (body) => body.id === currentSelectedBodyId,
      );

      addWorldEvents([
        {
          kind: "user-action",
          importance: "medium",
          message: `Cleared ${asteroidCount} asteroid${asteroidCount === 1 ? "" : "s"}.`,
        },
      ]);

      return selectedBody?.kind === "asteroid" ? null : currentSelectedBodyId;
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

      const body = createBodyForSpawnMode(
        spawnMode,
        bodyId,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );

      return {
        ...currentWorld,
        bodies: [...currentWorld.bodies, body],
      };
    });

    setSelectedBodyId(bodyId);

    addWorldEvents([
      {
        kind: "user-action",
        importance: "low",
        message: `Spawned ${spawnMode.replace("-", " ")} into the system.`,
      },
    ]);
  }

  function advanceSocietyTurn() {
    if (!society) return;

    const nextSociety = updateSociety(society);

    const previousFoundation = getSocietyFoundationScore(society);
    const nextFoundation = getSocietyFoundationScore(nextSociety);
    const populationChange = nextSociety.population - society.population;

    setSociety(nextSociety);

    const societyEvents: Array<Omit<WorldEvent, "id" | "createdAt">> = [
      {
        kind: "society",
        importance: "low",
        message: `${nextSociety.name} advanced to turn ${nextSociety.turn}.`,
      },
    ];

    if (populationChange > 0) {
      societyEvents.push({
        kind: "society",
        importance: "medium",
        message: `${nextSociety.name} grew by ${populationChange.toLocaleString()} people.`,
      });
    }

    if (populationChange < 0) {
      societyEvents.push({
        kind: "warning",
        importance: "medium",
        message: `${nextSociety.name} declined by ${Math.abs(
          populationChange,
        ).toLocaleString()} people.`,
      });
    }

    if (previousFoundation < 1 && nextFoundation >= 1) {
      societyEvents.push({
        kind: "society",
        importance: "high",
        message: `${nextSociety.name} achieved a stable foundation.`,
      });
    }

    if (previousFoundation >= 1 && nextFoundation < 1) {
      societyEvents.push({
        kind: "warning",
        importance: "high",
        message: `${nextSociety.name}'s foundation has become unstable.`,
      });
    }

    addWorldEvents(societyEvents);
  }

  function handleMergeEvents(mergeEvents: BodyMergeEvent[]) {
    if (mergeEvents.length === 0) return;

    const eventMessages: Array<Omit<WorldEvent, "id" | "createdAt">> =
      mergeEvents.map((mergeEvent) => ({
        kind: "physics",
        importance: "medium",
        message: `${mergeEvent.bodyAName} and ${mergeEvent.bodyBName} merged into ${mergeEvent.mergedBodyName}.`,
      }));

    if (society?.homeBodyId) {
      for (const mergeEvent of mergeEvents) {
        const homeWorldWasInvolved =
          mergeEvent.bodyAId === society.homeBodyId ||
          mergeEvent.bodyBId === society.homeBodyId;

        if (!homeWorldWasInvolved) continue;

        if (mergeEvent.mergedKind === "planet") {
          setSociety({
            ...society,
            homeBodyId: mergeEvent.mergedBodyId,
          });

          eventMessages.push({
            kind: "warning",
            importance: "high",
            message: `${society.name}'s home world survived an impact and is now ${mergeEvent.mergedBodyName}.`,
          });
        } else {
          setSociety({
            ...society,
            homeBodyId: null,
          });

          eventMessages.push({
            kind: "warning",
            importance: "high",
            message: `${society.name}'s home world was destroyed in a collision.`,
          });
        }
      }
    }

    addWorldEvents(eventMessages);
  }

  const selectedBody =
    world?.bodies.find((body) => body.id === selectedBodyId) ?? null;

  const selectedBodySpeed = selectedBody ? getBodySpeed(selectedBody) : 0;
  if (!world) {
    return <main className="page">Creating universe...</main>;
  }

  const totalMass = getTotalMass(world);
  const averageSpeed = getAverageSpeed(world);
  const heaviestBody = getHeaviestBody(world);
  const fastestBody = getFastestBody(world);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">WorldSim / Genesis Build 011</p>
        <h1>{world.name}</h1>
        <p>
          A living gravity sandbox where bodies orbit, collide, merge, and host
          the first seeds of civilization.
        </p>
      </section>

      <section className="sim-layout">
        <div className="canvas-shell">
          <UniverseCanvas
            world={world}
            setWorld={setWorld}
            selectedBodyId={selectedBodyId}
            onSelectBody={setSelectedBodyId}
            society={society}
            onMergeEvents={handleMergeEvents}
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
            <h3>Simulation State</h3>

            <div className="selected-body-details">
              <span>status: {world.isPaused ? "paused" : "running"}</span>
              <span>scale: {world.scale}</span>
              <span>body count: {world.bodies.length}</span>
              <span>total mass: {totalMass.toFixed(1)}</span>
              <span>average speed: {averageSpeed.toFixed(2)}</span>
              <span>heaviest: {heaviestBody ? heaviestBody.id : "none"}</span>
              <span>fastest: {fastestBody ? fastestBody.id : "none"}</span>
              <span>trails: {world.showTrails ? "visible" : "hidden"}</span>
            </div>
          </div>
          <div className="selected-body-panel world-chronicle">
            <h3>World Chronicle</h3>

            {worldEvents.length > 0 ? (
              <div className="event-list">
                {worldEvents.map((event) => (
                  <article
                    key={event.id}
                    className={`event-item event-item-${event.importance}`}
                  >
                    <span className="event-kind">{event.kind}</span>
                    <p>{event.message}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>No major events yet.</p>
            )}
          </div>
          <div className="selected-body-panel">
            <h3>Society Seed</h3>

            {society ? (
              <div className="selected-body-details">
                <strong>{society.name}</strong>
                <span>turn: {society.turn}</span>
                <span>home body: {society.homeBodyId ?? "unattached"}</span>
                <span>policy: {society.policy}</span>
                <span>population: {society.population.toLocaleString()}</span>
                <span>food: {society.resources.food.toFixed(0)}</span>
                <span>housing: {society.resources.housing.toFixed(0)}</span>
                <span>energy: {society.resources.energy.toFixed(0)}</span>
                <span>health: {society.wellbeing.health.toFixed(0)}</span>
                <span>education: {society.wellbeing.education.toFixed(0)}</span>
                <span>
                  social trust: {society.wellbeing.socialTrust.toFixed(0)}
                </span>
                <span>
                  productivity: {society.wellbeing.productivity.toFixed(0)}
                </span>
                <span>presence: {society.wellbeing.presence.toFixed(0)}</span>
                <span>
                  foundation:{" "}
                  {Math.min(
                    society.resources.food / society.population,
                    society.resources.housing / society.population,
                    society.resources.energy / society.population / 0.85,
                  ).toFixed(2)}
                </span>
              </div>
            ) : (
              <p>No society loaded.</p>
            )}

            <button onClick={advanceSocietyTurn} disabled={!society}>
              Advance Society Turn
            </button>
          </div>
          <div className="selected-body-panel">
            <h3>Selected Body</h3>

            {selectedBody ? (
              <div className="selected-body-details">
                <strong>{selectedBody.name}</strong>
                <span>id: {selectedBody.id}</span>
                <span>kind: {selectedBody.kind}</span>
                {society?.homeBodyId === selectedBody.id && (
                  <span>society: {society.name}</span>
                )}
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
                <strong>{body.name}</strong>
                <span>kind: {body.kind}</span>
                <span>mass: {body.mass.toFixed(1)}</span>
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
