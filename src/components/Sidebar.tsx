import { getUser } from '../services/auth/authService';
import './Navbar.css';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const user = getUser();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Left side can be empty or have page title later */}
      </div>

      <div className="navbar-right">
        {user && <span className="user-name">{user.name}</span>}
        <FaUserCircle className="user-icon" />
      </div>
    </nav>
  );
};

export default Navbar;