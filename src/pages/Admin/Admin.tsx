import { useState } from 'react'
import './Admin.css'
import CrewPage from './CrewPage/CrewPage'
import AircraftPage from './AircraftPage/AircraftPage'
import Navbar from '../../components/Navbar'
import AdminLayout from '../../layouts/AdminLayout';

function Admin() {
  const [selectedTab, setSelectedTab] = useState('Dashboard')

  return (
    <AdminLayout>
      <div className="Admin">
        <Navbar />
        <div className="main-layout">
          <aside className="sidebar">
            {['Dashboard', 'Aircraft', 'Flight', 'Crew', 'Maintenance'].map((tab) => (
              <div
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`sidebar-item ${selectedTab === tab ? 'active' : ''}`}
              >
                {tab}
              </div>
            ))}
          </aside>
          <main className="content">
            {selectedTab === 'Crew' && <CrewPage />}
            {selectedTab === 'Dashboard' && <div>Dashboard Page</div>}
            {selectedTab === 'Aircraft' && <AircraftPage />}
            {selectedTab === 'Flight' && <div>Flight Page</div>}
            {selectedTab === 'Maintenance' && <div>Maintenance Page</div>}
          </main>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Admin
