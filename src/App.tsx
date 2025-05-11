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
import CreateAircraftPage from './pages/Admin/AircraftPage/CreateAircraftPage';
import FlightPage from "./pages/Admin/FlightPage/FlightPage";
import FlightDetailPage from "./pages/Admin/FlightPage/FlightDetailPage";
import RoutePage from "./pages/Admin/RoutePage/RoutePage";
import RouteDetailPage from "./pages/Admin/RoutePage/RouteDetailPage";
import AddRoutePage from "./pages/Admin/RoutePage/AddRoutePage";
import EditRoutePage from "./pages/Admin/RoutePage/EditRoutePage";
import AirportPage from "./pages/Admin/AirportPage/AirportPage";
import AirportDetailPage from "./pages/Admin/AirportPage/AirportDetailPage";
import EditAirportPage from './pages/Admin/AirportPage/EditAirportPage';
import AddAirportPage from './pages/Admin/AirportPage/AddAirportPage';
import MaintenancePage from "./pages/Admin/MaintenancePage/MaintenancePage";
import MaintenanceDetail from "./pages/Admin/MaintenancePage/MaintenanceDetail";
import EditMaintenance from "./pages/Admin/MaintenancePage/EditMaintenance";
import CreateMaintenance from "./pages/Admin/MaintenancePage/CreateMaintenance";
import CrewDetailPage from './pages/Admin/CrewPage/CrewDetailPage';
import EditCrewPage from './pages/Admin/CrewPage/EditCrewPage';
import CreateCrewPage from "./pages/Admin/CrewPage/CreateCrewPage";
import AddFlightPage from "./pages/Admin/FlightPage/AddFlightPage/AddFlightPage";
import DashboardPage from "./pages/Admin/DashboardPage/DashboardPage";

function App() {
  return (
    <>
      <ApiStatusChecker />
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
            {/* Nested Pages inside /admin */}
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="flights" element={<FlightPage />} />
            <Route path="flights/new" element={<AddFlightPage />} />
            <Route path="flights/:id" element={<FlightDetailPage />} />
            <Route path="aircrafts" element={<AircraftPage />} />
            <Route path="aircrafts/:id" element={<AircraftDetailPage />} />
            <Route path="crew" element={<CrewPage />} />
            <Route path="crew/:id" element={<CrewDetailPage />} />
            <Route path="crew/edit/:id" element={<EditCrewPage />} />
            <Route path="crew/create" element={<CreateCrewPage />} />
            <Route path="aircraft/create" element={<CreateAircraftPage />} />
            <Route path="pathways/routes" element={<RoutePage />} />
            <Route path="pathways/routes/detail/:id" element={<RouteDetailPage />} />
            <Route path="pathways/routes/add" element={<AddRoutePage />} />
            <Route path="pathways/routes/edit/:id" element={<EditRoutePage />} />
            <Route path="pathways/airport" element={<AirportPage />} />
            <Route path="pathways/airport/detail/:id" element={<AirportDetailPage />} />
            <Route path="pathways/airport/edit/:id" element={<EditAirportPage />} />
            <Route path="pathways/airport/add" element={<AddAirportPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="maintenance/add" element={<CreateMaintenance />} />
            <Route path="maintenance/:id" element={<MaintenanceDetail />} />
            <Route path="maintenance/edit/:id" element={<EditMaintenance />} />
          </Route>

          <Route
            path="/Maintenance"
            element={
              <ProtectedRoute allowedRole="admin">
                <Maintenance />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Helloworld Maintenance</div>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
