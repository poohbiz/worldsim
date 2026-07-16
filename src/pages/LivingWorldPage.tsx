import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { WorldSave } from "../world/model/worldTypes";
import {
  loadActiveWorld,
  saveActiveWorld,
} from "../world/persistence/worldStorage";

export default function LivingWorldPage() {
  const { worldId } = useParams();
  const navigate = useNavigate();

  const [initialLoad] = useState(loadActiveWorld);

  const [world, setWorld] = useState<WorldSave | null>(
    initialLoad.ok ? initialLoad.world : null,
  );

  const [message, setMessage] = useState<string | null>(
    initialLoad.ok ? null : initialLoad.error,
  );

  if (!world || world.id !== worldId) {
    return (
      <main className="product-page">
        <section className="world-shell-card">
          <p className="eyebrow">World unavailable</p>
          <h1>World not found</h1>

          <p>
            This address does not match the active WorldSim world saved in this
            browser.
          </p>

          <Link className="button button-primary" to="/">
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  function saveWorld(): boolean {
    if (!world) {
      return false;
    }

    const updatedWorld: WorldSave = {
      ...world,
      updatedAt: Date.now(),
    };

    const saveResult = saveActiveWorld(updatedWorld);

    if (!saveResult.ok) {
      setMessage(saveResult.error);
      return false;
    }

    setWorld(updatedWorld);
    setMessage("World saved.");
    return true;
  }

  function saveAndReturnHome() {
    if (saveWorld()) {
      navigate("/");
    }
  }

  return (
    <main className="product-page living-world-page">
      <header className="world-header">
        <div>
          <p className="eyebrow">The Living World</p>
          <h1>{world.name}</h1>
        </div>

        <div className="world-header-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={saveWorld}
          >
            Save
          </button>

          <button
            className="button button-primary"
            type="button"
            onClick={saveAndReturnHome}
          >
            Save & Return Home
          </button>
        </div>
      </header>

      <section className="world-shell-layout">
        <div className="planet-placeholder" aria-label="Future planet view">
          <div className="placeholder-planet" />

          <p>Planetary visualization begins in Build 002.</p>
        </div>

        <aside className="world-identity-panel">
          <h2>World Identity</h2>

          <dl>
            <div>
              <dt>Name</dt>
              <dd>{world.name}</dd>
            </div>

            <div>
              <dt>Age</dt>
              <dd>{world.ageYears.toLocaleString()} years</dd>
            </div>

            <div>
              <dt>Seed</dt>
              <dd>{world.seed}</dd>
            </div>

            <div>
              <dt>Created</dt>
              <dd>{new Date(world.createdAt).toLocaleString()}</dd>
            </div>
          </dl>

          {message && (
            <p className="status-message" role="status">
              {message}
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
