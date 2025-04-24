import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Admin from './pages/Admin/Admin'
import Login from './pages/Admin/Login/Login'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound/NotFound' 

function App() {
  return (
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
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
