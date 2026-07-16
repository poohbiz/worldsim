import { Route, Routes } from "react-router";
import HomePage from "../pages/HomePage";
import LivingWorldPage from "../pages/LivingWorldPage";
import NotFoundPage from "../pages/NotFoundPage";
import WorldBuilderPage from "../pages/WorldBuilderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<WorldBuilderPage />} />
      <Route path="/world/:worldId" element={<LivingWorldPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
