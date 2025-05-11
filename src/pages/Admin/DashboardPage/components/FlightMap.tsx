import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import { LatLngExpression, Map as LeafletMap, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './FlightMap.module.css';
import { Flight } from '../../../../types/flight_dashboard';

// คำนวณตำแหน่งระหว่างจุดสองจุด
const interpolatePosition = (start: [number, number], end: [number, number], progress: number): [number, number] => {
  return [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress
  ];
};

// คำนวณองศาการหันของเครื่องบิน (แก้ไขใหม่)
const calculateHeading = (currentPos: [number, number], destination: [number, number]): number => {
  // แปลงเป็นเรเดียน
  const lat1 = currentPos[0] * Math.PI / 180;
  const lon1 = currentPos[1] * Math.PI / 180;
  const lat2 = destination[0] * Math.PI / 180;
  const lon2 = destination[1] * Math.PI / 180;

  // คำนวณ bearing
  const dLon = lon2 - lon1;
  const x = Math.cos(lat2) * Math.sin(dLon);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let bearing = Math.atan2(x, y);

  // แปลงกลับเป็นองศา และปรับให้หันหน้าไปทางที่ถูกต้อง
  bearing = (bearing * 180 / Math.PI + 180) % 360;

  return bearing;
};

// ข้อมูลตัวอย่างสำหรับทดสอบ
const sampleFlights: Flight[] = [
  {
    id: 'TG930',
    flightNumber: 'TG930',
    departure: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'Bangkok'
    },
    arrival: {
      latitude: 51.4700,
      longitude: -0.4543,
      city: 'London'
    },
    currentLocation: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'En Route'
    },
    status: 'In Flight',
    progress: 0
  },
  {
    id: 'TG676',
    flightNumber: 'TG676',
    departure: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'Bangkok'
    },
    arrival: {
      latitude: -33.9399,
      longitude: 151.1753,
      city: 'Sydney'
    },
    currentLocation: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'En Route'
    },
    status: 'In Flight',
    progress: 0
  },
  {
    id: 'TG692',
    flightNumber: 'TG692',
    departure: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'Bangkok'
    },
    arrival: {
      latitude: 40.6413,
      longitude: -73.7781,
      city: 'New York'
    },
    currentLocation: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'En Route'
    },
    status: 'In Flight',
    progress: 0
  },
  {
    id: 'TG465',
    flightNumber: 'TG465',
    departure: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'Bangkok'
    },
    arrival: {
      latitude: -33.9625,
      longitude: -54.6873,
      city: 'São Paulo'
    },
    currentLocation: {
      latitude: 13.6900,
      longitude: 100.7501,
      city: 'En Route'
    },
    status: 'In Flight',
    progress: 0
  }
];

const FlightMap = () => {
  const [autoTrack, setAutoTrack] = useState(true); // ตั้งค่าเริ่มต้นเป็น true
  const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flights, setFlights] = useState(sampleFlights);
  const mapRef = useRef<LeafletMap | null>(null);

  // สร้างไอคอนเครื่องบินที่หมุนได้
  const createRotatedPlaneIcon = (heading: number, isTracked: boolean): DivIcon => {
    return new DivIcon({
      className: styles.planeIcon,
      html: `<div style="transform: rotate(${heading}deg)" class="${isTracked ? styles.focused : ''}">${isTracked ? '🛩️' : '✈️'}</div>`,
      iconSize: [20, 20],
    });
  };

  // อัพเดทตำแหน่งเครื่องบินทุก 1 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(prevFlights => {
        return prevFlights.map(flight => {
          const newProgress = (flight.progress + 0.01) % 1;
          const startPos: [number, number] = [flight.departure.latitude, flight.departure.longitude];
          const endPos: [number, number] = [flight.arrival.latitude, flight.arrival.longitude];
          const [newLat, newLng] = interpolatePosition(startPos, endPos, newProgress);
          
          return {
            ...flight,
            progress: newProgress,
            currentLocation: {
              ...flight.currentLocation,
              latitude: newLat,
              longitude: newLng
            }
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // สลับเครื่องบินที่จะติดตามทุก 5 วินาที
  useEffect(() => {
    let interval: number;
    
    if (autoTrack) {
      interval = setInterval(() => {
        setCurrentFlightIndex((prev) => (prev + 1) % flights.length);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoTrack, flights.length]);

  // ตั้งค่าเครื่องบินที่เลือกเริ่มต้น
  useEffect(() => {
    if (flights.length > 0) {
      setSelectedFlight(flights[currentFlightIndex]);
    }
  }, [flights, currentFlightIndex]);

  useEffect(() => {
    if (autoTrack) {
      const flight = flights[currentFlightIndex];
      setSelectedFlight(flight);
      
      if (mapRef.current) {
        const currentPosition: LatLngExpression = [
          flight.currentLocation.latitude,
          flight.currentLocation.longitude,
        ];
        mapRef.current.setView(currentPosition, 4);
      }
    }
  }, [currentFlightIndex, autoTrack, flights]);

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    if (!autoTrack && mapRef.current) {
      const position: LatLngExpression = [
        flight.currentLocation.latitude,
        flight.currentLocation.longitude,
      ];
      mapRef.current.setView(position, 4);
    }
  };

  const toggleAutoTrack = () => {
    setAutoTrack(!autoTrack);
    if (!autoTrack) {
      setCurrentFlightIndex(0);
    } else {
      setSelectedFlight(null);
    }
  };

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className={styles.map}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {flights.map((flight) => {
          const isTracked = autoTrack && flight === flights[currentFlightIndex];
          const currentPos: [number, number] = [
            flight.currentLocation.latitude,
            flight.currentLocation.longitude,
          ];
          const destination: [number, number] = [
            flight.arrival.latitude,
            flight.arrival.longitude,
          ];
          const route: LatLngExpression[] = [
            [flight.departure.latitude, flight.departure.longitude],
            destination,
          ];

          // คำนวณองศาจากตำแหน่งปัจจุบันไปยังจุดหมาย
          const heading = calculateHeading(currentPos, destination);

          return (
            <div key={flight.id}>
              <Polyline 
                positions={route} 
                color="#3b82f6" 
                weight={2} 
                opacity={0.7} 
              />
              <Marker
                position={currentPos}
                icon={createRotatedPlaneIcon(heading, isTracked)}
                eventHandlers={{
                  click: () => handleFlightClick(flight),
                }}
              >
                <Popup>
                  <div>
                    <h4>{flight.flightNumber}</h4>
                    <p>From: {flight.departure.city}</p>
                    <p>To: {flight.arrival.city}</p>
                    <p>Status: {flight.status}</p>
                    <p>Progress: {Math.round(flight.progress * 100)}%</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      <div className={styles.controls}>
        <button
          className={`${styles.button} ${autoTrack ? styles.active : ''}`}
          onClick={toggleAutoTrack}
        >
          {autoTrack ? (
            <>
              <span style={{ fontSize: '16px' }}>🔄</span>
              <span>Auto Tracking</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>▶️</span>
              <span>Start Tracking</span>
            </>
          )}
        </button>
      </div>

      {selectedFlight && (
        <div className={`${styles.flightOverlay} ${selectedFlight ? styles.visible : ''}`}>
          <h4>{selectedFlight.flightNumber}</h4>
          <p>From: {selectedFlight.departure.city}</p>
          <p>To: {selectedFlight.arrival.city}</p>
          <p>Status: {selectedFlight.status}</p>
          <p>Progress: {Math.round(selectedFlight.progress * 100)}%</p>
        </div>
      )}
    </div>
  );
};

export default FlightMap;