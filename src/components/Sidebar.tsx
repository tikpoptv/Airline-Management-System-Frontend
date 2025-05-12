import { useNavigate } from 'react-router-dom';
// import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { getUser, logout } from '../services/auth/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
      </div>

      <div className="navbar-right">
        <div className="admin-profile">
          <FaUser className="admin-icon" />
          <span>{user?.role.toUpperCase()}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>LOGOUT</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar; 