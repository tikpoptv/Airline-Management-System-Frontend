import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Public/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin/Admin";
import AircraftPage from "./pages/Admin/AircraftPage/AircraftPage";
import AircraftDetailPage from "./pages/Admin/AircraftPage/AircraftDetailPage";
import NotFound from "./pages/NotFound/NotFound";
import ApiStatusChecker from "./components/ApiStatusChecker";
import Maintenance from "./pages/Maintenance/Maintenance";
import CrewPage from "./pages/Admin/CrewPage/CrewPage";
import CrewDetailPage from "./pages/Admin/CrewPage/CrewDetailPage";
import CreateAircraftPage from './pages/Admin/AircraftPage/CreateAircraftPage';
import FlightPage from "./pages/Admin/FlightPage/FlightPage";
import Dashboard from './pages/Maintenance/Dashboard';
import MaintenancePage from './pages/Maintenance/MaintenancePage';
import MaintenanceDetail from './pages/Maintenance/MaintenanceDetail';
import CreateMaintenance from './pages/Maintenance/CreateMaintenance';

import { MaintenanceProvider } from './pages/Maintenance/context/MaintenanceContext';

function App() {
  return (
    <>
      <ApiStatusChecker />
      <MaintenanceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            >
              <Route index element={<div>Welcome to Admin Dashboard</div>} />
              <Route path="flights" element={<FlightPage />} />
              <Route path="aircrafts" element={<AircraftPage />} />
              <Route path="aircrafts/:id" element={<AircraftDetailPage />} />
              <Route path="crew" element={<CrewPage />} />
              <Route path="crew/:id" element={<CrewDetailPage />} />
              <Route path="aircraft/create" element={<CreateAircraftPage />} />
            </Route>

            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRole="admin">
                  <Maintenance />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="maintenance/create" element={<CreateMaintenance />} />
              <Route path=":id" element={<MaintenanceDetail />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </MaintenanceProvider>
    </>
  );
}

export default App;