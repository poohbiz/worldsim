import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="product-page">
      <section className="world-shell-card">
        <p className="eyebrow">Unknown location</p>
        <h1>This part of reality does not exist.</h1>

        <Link className="button button-primary" to="/">
          Return to WorldSim
        </Link>
      </section>
    </main>
  );
}
