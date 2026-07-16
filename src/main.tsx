import React from "react";
import ReactDOM from "react-dom/client";
import PrototypeApp from "./legacy/prototype/PrototypeApp";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find the root element.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <PrototypeApp />
  </React.StrictMode>,
);
