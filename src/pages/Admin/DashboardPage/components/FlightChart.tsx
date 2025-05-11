import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './FlightChart.module.css';

// Mock data
const data = [
  { name: '00:00', flights: 12 },
  { name: '03:00', flights: 8 },
  { name: '06:00', flights: 25 },
  { name: '09:00', flights: 35 },
  { name: '12:00', flights: 30 },
  { name: '15:00', flights: 28 },
  { name: '18:00', flights: 32 },
  { name: '21:00', flights: 20 },
];

const FlightChart = () => {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="flights" 
            stroke="#3b82f6" 
            fill="url(#colorGradient)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FlightChart; 