import { useEffect, useState } from 'react';
import { getMultipleCitiesWeather } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiDayCloudyGusts } from 'react-icons/wi';
import styles from './WeatherUpdates.module.css';

// Weather icons mapping
const getWeatherIcon = (code: number) => {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  switch (true) {
    case code === 0: // Clear sky
      return <WiDaySunny className={styles.weatherIcon} style={{ color: '#f59e0b' }} />;
    case code >= 1 && code <= 3: // Partly cloudy
      return <WiCloudy className={styles.weatherIcon} style={{ color: '#60a5fa' }} />;
    case code >= 51 && code <= 67: // Rain
      return <WiRain className={styles.weatherIcon} style={{ color: '#3b82f6' }} />;
    case code >= 95 && code <= 99: // Thunderstorm
      return <WiThunderstorm className={styles.weatherIcon} style={{ color: '#6366f1' }} />;
    default: // Other conditions
      return <WiDayCloudyGusts className={styles.weatherIcon} style={{ color: '#93c5fd' }} />;
  }
};

const WeatherUpdates = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await getMultipleCitiesWeather(['BKK', 'CNX', 'HKT']);
        setWeatherData(data);
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลสภาพอากาศได้');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className={styles.loading}>กำลังโหลดข้อมูลสภาพอากาศ...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.weatherList}>
      {weatherData.map((weather) => (
        <div key={weather.city} className={styles.weatherItem}>
          <div className={styles.cityInfo}>
            <h3 className={styles.cityName}>{weather.city}</h3>
            <span className={styles.location}>{weather.location}</span>
          </div>
          
          <div className={styles.weatherMain}>
            <div className={styles.temperatureContainer}>
              <span className={styles.value}>{weather.temperature}°C</span>
              <div className={styles.iconContainer}>
                {getWeatherIcon(weather.weatherCode)}
              </div>
            </div>
            <div className={styles.weatherDetails}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>ความชื้น</span>
                <span className={styles.detailValue}>{weather.humidity}%</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>ความเร็วลม</span>
                <span className={styles.detailValue}>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherUpdates; 