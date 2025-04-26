import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import EmploisDuTemps from "./EmploisDuTemps";
import PlanningExams from "./PlanningExams";
import Evenement from "./Evenement";
import EmploisPersonnalises from "./EmploisPersonnalises";
import FormationsInscrites from "./FormationsInscrites";
import ProjetsDeadlines from "./ProjetsDeadlines";
import Accueil from "./loginaccueil/components/accueil";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [openSidebarToggle, setOpenSidebarToggle] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem("userToken");
    if (token) {
      setIsAuthenticated(true);
    }

    // Vérifier si l'admin est authentifié
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const OpenSidebar = () => {
    setOpenSidebarToggle(!openSidebarToggle);
  };

  // Composant pour protéger les routes étudiants
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/accueil" />;
    }
    return children;
  };

  // Composant pour protéger les routes admin
  const AdminProtectedRoute = ({ children }) => {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin/login" />;
    }
    return children;
  };

  return (
    <div className="App">
      <Routes>
        {/* Route publique pour la page d'accueil */}
        <Route path="/accueil" element={<Accueil />} />

        {/* Routes pour l'administration */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/emplois/:id"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* Routes protégées pour l'application principale */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Emploisdutemps"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <EmploisDuTemps />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/PlanningExams"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <PlanningExams />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Evenement"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <Evenement />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/EmploisPersonnalises"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <EmploisPersonnalises />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/FormationsInscrites"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <FormationsInscrites />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ProjetsDeadlines"
          element={
            <ProtectedRoute>
              <div className="grid-container">
                <Header />
                <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
                <ProjetsDeadlines />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;