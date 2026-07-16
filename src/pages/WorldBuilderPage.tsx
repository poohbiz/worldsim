import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { createWorld } from "../world/model/createWorld";
import { validateWorldName } from "../world/model/validateWorld";
import {
  loadActiveWorld,
  saveActiveWorld,
} from "../world/persistence/worldStorage";

export default function WorldBuilderPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsReplacementConfirmation, setNeedsReplacementConfirmation] =
    useState(false);

  const [initialLoad] = useState(loadActiveWorld);

  const existingWorld = initialLoad.ok ? initialLoad.world : null;

  function createAndOpenWorld() {
    const world = createWorld(name);
    const saveResult = saveActiveWorld(world);

    if (!saveResult.ok) {
      setError(saveResult.error);
      return;
    }

    navigate(`/world/${world.id}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nameError = validateWorldName(name);

    if (nameError) {
      setError(nameError);
      return;
    }

    setError(null);

    if (existingWorld) {
      setNeedsReplacementConfirmation(true);
      return;
    }

    createAndOpenWorld();
  }

  return (
    <main className="product-page builder-page">
      <section className="builder-card">
        <p className="eyebrow">Genesis</p>
        <h1>Create New World</h1>

        <p>
          Build 001 establishes your world’s permanent identity. Planetary
          conditions arrive in Build 002.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="world-name">World name</label>

          <input
            id="world-name"
            type="text"
            value={name}
            maxLength={40}
            autoFocus
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
              setNeedsReplacementConfirmation(false);
            }}
            placeholder="Aurelia"
          />

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {!needsReplacementConfirmation && (
            <button className="button button-primary" type="submit">
              Create World
            </button>
          )}
        </form>

        {needsReplacementConfirmation && existingWorld && (
          <div className="confirmation-panel" role="alert">
            <strong>Replace {existingWorld.name}?</strong>

            <p>
              Build 001 supports one active world. Creating this world will
              replace the current saved world.
            </p>

            <div className="confirmation-actions">
              <button
                className="button button-danger"
                type="button"
                onClick={createAndOpenWorld}
              >
                Replace World
              </button>

              <button
                className="button button-secondary"
                type="button"
                onClick={() => setNeedsReplacementConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <Link className="text-link" to="/">
          Return Home
        </Link>
      </section>
    </main>
  );
}
