import { FaSun, FaCloud, FaCloudRain, FaCloudBolt } from 'react-icons/fa6';
import styles from './WeatherWidget.module.css';

// Mock data
const airports = [
  {
    code: 'BKK',
    name: 'Suvarnabhumi',
    temp: 32,
    condition: 'sunny',
    humidity: 65,
    wind: 12
  },
  {
    code: 'CNX',
    name: 'Chiang Mai',
    temp: 28,
    condition: 'cloudy',
    humidity: 72,
    wind: 8
  },
  {
    code: 'HKT',
    name: 'Phuket',
    temp: 30,
    condition: 'rain',
    humidity: 80,
    wind: 15
  }
];

const WeatherWidget = () => {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <FaSun className={`${styles.icon} ${styles.sunny}`} />;
      case 'cloudy':
        return <FaCloud className={`${styles.icon} ${styles.cloudy}`} />;
      case 'rain':
        return <FaCloudRain className={`${styles.icon} ${styles.rain}`} />;
      case 'storm':
        return <FaCloudBolt className={`${styles.icon} ${styles.storm}`} />;
      default:
        return <FaSun className={styles.icon} />;
    }
  };

  return (
    <div className={styles.container}>
      {airports.map((airport) => (
        <div key={airport.code} className={styles.weatherCard}>
          <div className={styles.header}>
            <div>
              <h3>{airport.code}</h3>
              <span className={styles.name}>{airport.name}</span>
            </div>
            {getWeatherIcon(airport.condition)}
          </div>
          
          <div className={styles.details}>
            <div className={styles.temp}>
              {airport.temp}°C
            </div>
            <div className={styles.conditions}>
              <span>Humidity: {airport.humidity}%</span>
              <span>Wind: {airport.wind} km/h</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherWidget; 