import { Navigate, Route, Routes } from "react-router";
import { HomePage } from "./pages/HomePage";
import { FeaturesPage } from "./pages/FeaturesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}