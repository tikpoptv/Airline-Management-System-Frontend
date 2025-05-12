import { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getMaintenanceStats } from '../../../../services/maintenance/maintenanceService';
import MaintenanceModal from './MaintenanceModal';
import styles from './MaintenanceChart.module.css';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

interface MaintenanceData {
  name: string;
  value: number;
  status: string;
}

interface MaintenanceLog {
  log_id: number;
  aircraft_id: number;
  date_of_maintenance: string;
  details: string;
  maintenance_location: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assigned_to: number | null;
}

const MaintenanceChart = () => {
  const [data, setData] = useState<MaintenanceData[]>([]);
  const [todayMaintenance, setTodayMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getMaintenanceStats();
        const stats = response.maintenance_stats;
        
        setData([
          { name: 'Scheduled', value: stats.scheduled, status: 'Pending' },
          { name: 'In Progress', value: stats.in_progress, status: 'In Progress' },
          { name: 'Completed', value: stats.completed, status: 'Completed' },
          { name: 'Delayed', value: stats.delayed, status: 'Cancelled' }
        ]);

        setTodayMaintenance(response.today_maintenance);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch maintenance stats'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className={styles.error}>เกิดข้อผิดพลาด: {error.message}</div>;
  if (!data.length) return null;

  return (
    <>
      <div className={`${styles.container} ${styles.clickable}`} onClick={handleClick}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className={styles.legendText}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className={styles.stats}>
          {data.map((item, index) => (
            <div key={item.name} className={styles.statItem}>
              <div className={styles.statHeader}>
                <div 
                  className={styles.dot} 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className={styles.label}>{item.name}</span>
              </div>
              <span className={styles.value}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maintenanceLogs={todayMaintenance}
      />
    </>
  );
};

export default MaintenanceChart; 