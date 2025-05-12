// import axios from 'axios';

export interface WeatherData {
  city: string;
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

interface CityCoordinates {
  lat: number;
  lon: number;
  name: string;
  location: string;
}

const CITIES: Record<string, CityCoordinates> = {
  BKK: { lat: 13.6900, lon: 100.7501, name: 'Bangkok', location: 'Suvarnabhumi Airport' },
  CNX: { lat: 18.7669, lon: 98.9628, name: 'Chiang Mai', location: 'Chiang Mai International Airport' },
  HKT: { lat: 8.1132, lon: 98.3167, name: 'Phuket', location: 'Phuket International Airport' },
};

export const getMultipleCitiesWeather = async (cityCodes: string[]): Promise<WeatherData[]> => {
  try {
    const weatherPromises = cityCodes.map(async (code) => {
      const city = CITIES[code];
      if (!city) throw new Error(`Invalid city code: ${code}`);

      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
      );

      const current = response.data.current;
      
      return {
        city: city.name,
        location: city.location,
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code
      };
    });

    return await Promise.all(weatherPromises);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}; 