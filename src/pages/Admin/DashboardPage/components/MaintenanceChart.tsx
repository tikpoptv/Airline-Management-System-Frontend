import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from './MaintenanceChart.module.css';

const data = [
  { name: 'Scheduled', value: 8 },
  { name: 'In Progress', value: 4 },
  { name: 'Completed', value: 12 },
  { name: 'Delayed', value: 2 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const MaintenanceChart = () => {
  return (
    <div className={styles.container}>
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
  );
};

export default MaintenanceChart; 