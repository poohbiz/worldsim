import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App";
import "./styles/global.css";
import "./styles/product-shell.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find the root element.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
