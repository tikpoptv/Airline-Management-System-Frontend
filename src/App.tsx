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
import RoutePage from "./pages/Admin/RoutePage/RoutePage";
import RouteDetailPage from "./pages/Admin/RoutePage/RouteDetailPage";

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
            <Route index element={<div>Welcome to Admin Dashboard</div>} />
            <Route path="flights" element={<FlightPage />} />
            <Route path="aircrafts" element={<AircraftPage />} />
            <Route path="aircrafts/:id" element={<AircraftDetailPage />} />
            <Route path="crew" element={<CrewPage />} />
            <Route path="crew/:id" element={<CrewDetailPage/>} />
            <Route path="aircraft/create" element={<CreateAircraftPage />} />
            <Route path="pathways/routes" element={<RoutePage />} />
            <Route path="pathways/routes/detail/:id" element={<RouteDetailPage />} />
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
