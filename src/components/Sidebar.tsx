import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/auth/authService';
import { FaUserCircle } from 'react-icons/fa';

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
        <div className="logout">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        </div>
        {user && <span className="user-type">{user.role.toUpperCase()}</span>}
        <FaUserCircle className="user-icon" />
      </div>
    </nav>
  );
};

export default Sidebar;
