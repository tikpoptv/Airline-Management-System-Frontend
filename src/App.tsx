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
            <Route path="aircrafts" element={<AircraftPage />} />
            <Route path="aircrafts/:id" element={<AircraftDetailPage />} />
            <Route path="crew" element={<CrewPage />} />
            <Route path="crew/:id" element={<AircraftDetailPage />} />
            <Route path="aircraft/create" element={<CreateAircraftPage />} />
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
