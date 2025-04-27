import { Outlet, NavLink } from 'react-router-dom';
import './Admin.css';
import AdminLayout from '../../layouts/AdminLayout';
import Navbar from '../../components/Navbar';
import { FaPlane, FaPlaneDeparture, FaRoute, FaUser, FaWrench } from 'react-icons/fa';
import { TbLayoutDashboardFilled } from "react-icons/tb";

function Admin() {
  return (
    <AdminLayout>
      <div className="Admin">
        <Navbar />
        <div className="main-layout">
          <aside className="sidebar">
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
              <TbLayoutDashboardFilled className="sidebar-icon" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/admin/aircrafts" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
              <FaPlane className="sidebar-icon" />
              <span>Aircraft</span>
            </NavLink>

            <NavLink to="/admin/flights" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
              <FaPlaneDeparture className="sidebar-icon" />
              <span>Flight</span>
            </NavLink>

            <NavLink to="/admin/pathways" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
              <FaRoute className="sidebar-icon" />
              <span>Pathway</span>
            </NavLink>

            <NavLink to="/admin/crew" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
              <FaUser className="sidebar-icon" />
              <span>Crew</span>
            </NavLink>

            <NavLink to="/admin/maintenance" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
              <FaWrench className="sidebar-icon" />
              <span>Maintenance</span>
            </NavLink>
          </aside>

          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Admin;
