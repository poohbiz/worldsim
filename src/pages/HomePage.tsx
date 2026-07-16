import { useState } from "react";
import { Link } from "react-router";
import { loadActiveWorld } from "../world/persistence/worldStorage";

export default function HomePage() {
  const [loadResult] = useState(loadActiveWorld);

  const activeWorld = loadResult.ok ? loadResult.world : null;

  return (
    <main className="product-page home-page">
      <section className="home-card">
        <p className="eyebrow">Living-world simulation</p>

        <h1>WorldSim</h1>

        <p className="hero-copy">
          Build a world from above. Watch it become something of its own.
        </p>
        <div className="primary-actions">
          {activeWorld && (
            <Link
              className="button button-primary"
              to={`/world/${activeWorld.id}`}
            >
              Continue {activeWorld.name}
            </Link>
          )}

          <Link className="button button-secondary" to="/create">
            Create New World
          </Link>
        </div>

        {!loadResult.ok && (
          <p className="error-message" role="alert">
            {loadResult.error}
          </p>
        )}

        {activeWorld && (
          <div className="world-summary">
            <span>Active world</span>
            <strong>{activeWorld.name}</strong>
            <span>Age: {activeWorld.ageYears.toLocaleString()} years</span>
          </div>
        )}
      </section>
    </main>
  );
}
