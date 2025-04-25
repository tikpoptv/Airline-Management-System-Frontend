import { useState } from 'react';
import Navbar from '../../components/Navbar';
import CrewPage from './CrewPage/CrewPage';
import AircraftPage from './AircraftPage/AircraftPage';
import AdminLayout from '../../layouts/AdminLayout';
import { Tab } from '../../components/SidebarTab'; 
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>('Dashboard');
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <div className="logout">
        <button className="logout-button" onClick={() => navigate('/')}>
          Logout
        </button>
      </div>
      <div className="Admin">
        {/* Pass the setSelectedTab function to Navbar */}
        <Navbar setSelectedTab={setSelectedTab} />
        <div className="main-layout">
          <main className="content">
            {/* Render the corresponding page based on selectedTab */}
            {selectedTab === 'Crew' && <CrewPage />}
            {selectedTab === 'Dashboard' && <div>Dashboard Page</div>}
            {selectedTab === 'Aircraft' && <AircraftPage />}
            {selectedTab === 'Flight' && <div>Flight Page</div>}
            {selectedTab === 'Maintenance' && <div>Maintenance Page</div>}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;