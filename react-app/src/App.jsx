import { Routes, Route, Navigate } from "react-router-dom";
import IconSprite from "./components/IconSprite";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import Connexion from "./pages/admin/Connexion";
import Domaines from "./pages/admin/Domaines";
import { RequireAuth } from "./pages/admin/AdminLayout";

function App() {
  return (
    <>
      <IconSprite />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />

        {/* Back office — non référencé depuis le site public. */}
        <Route path="/admin/connexion" element={<Connexion />} />
        <Route
          path="/admin/domaines"
          element={
            <RequireAuth>
              <Domaines />
            </RequireAuth>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/domaines" replace />} />
      </Routes>
    </>
  );
}

export default App;
