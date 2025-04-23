import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Admin from './assets/page/Admin/Admin'
import Login from './assets/page/Admin/Login/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App