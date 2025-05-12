import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flight } from '../../../../types/flight_dashboard';
import styles from './FlightChart.module.css';

interface FlightChartProps {
  flights: Flight[];
}

const FlightChart = ({ flights }: FlightChartProps) => {
  // จัดกลุ่มเที่ยวบินตามช่วงเวลา
  const getFlightsByHour = () => {
    const flightsByHour = new Array(8).fill(0).map((_, index) => {
      const hour = index * 3;
      return {
        name: `${hour.toString().padStart(2, '0')}:00`,
        flights: 0
      };
    });

    flights.forEach(flight => {
      const hour = new Date(flight.departure_time).getHours();
      const index = Math.floor(hour / 3);
      if (index >= 0 && index < 8) {
        flightsByHour[index].flights++;
      }
    });

    return flightsByHour;
  };

  const data = getFlightsByHour();

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