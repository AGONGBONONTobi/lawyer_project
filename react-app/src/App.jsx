import { Routes, Route, Navigate } from "react-router-dom";
import IconSprite from "./components/IconSprite";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Nationalite from "./pages/Nationalite";
import Diagnostic from "./pages/Diagnostic";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import Agenda from "./pages/admin/Agenda";
import Connexion from "./pages/admin/Connexion";
import Domaines from "./pages/admin/Domaines";
import PagesLegales from "./pages/admin/PagesLegales";
import { RequireAuth } from "./pages/admin/AdminLayout";

function App() {
  return (
    <>
      <IconSprite />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nationalite" element={<Nationalite />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />

        {/* Back office — non référencé depuis le site public. */}
        <Route path="/admin/agenda" element={<RequireAuth><Agenda /></RequireAuth>} />
        <Route path="/admin/connexion" element={<Connexion />} />
        <Route
          path="/admin/domaines"
          element={
            <RequireAuth>
              <Domaines />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/pages-legales"
          element={
            <RequireAuth>
              <PagesLegales />
            </RequireAuth>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/domaines" replace />} />
      </Routes>
    </>
  );
}

export default App;
