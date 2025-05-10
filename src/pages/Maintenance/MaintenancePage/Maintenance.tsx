import { Outlet, NavLink } from 'react-router-dom';
import './Maintenance.css';
import { FaWrench } from 'react-icons/fa';
import { MdAirplaneTicket } from "react-icons/md";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import Navbar from '../../../components/Sidebar';



function Maintenance() {
  return (
    <div className="Maintenance-container">
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
         <div className='sidebar-logo'> <MdAirplaneTicket /></div>
          <div className="airline-name">Airline name</div>
        </div>

        <NavLink to="/maintenance" end className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
          <TbLayoutDashboardFilled className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        

        <NavLink to="/maintenance/maintenance" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
          <FaWrench className="sidebar-icon" />
          <span>Maintenance</span>
        </NavLink>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default Maintenance;