import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/auth/authService';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        Airline Name
      </div>

      <div className="navbar-right">
        {user && <span className="user-type">{user.role.toUpperCase()}</span>}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div>
    </nav>
  );
};

export default Navbar;