import { useState, useEffect, useRef } from 'react';
// import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
// import { LatLngExpression, Map as LeafletMap, DivIcon } from 'leaflet';
// import 'leaflet/dist/leaflet.css';
import styles from './FlightMap.module.css';
import { Flight } from '../../../../types/flight_dashboard';

interface FlightMapProps {
  flights: Flight[];
}

interface FlightPosition {
  flight: Flight;
  progress: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

// คำนวณตำแหน่งระหว่างจุดสองจุด
const interpolatePosition = (start: [number, number], end: [number, number], progress: number): [number, number] => {
  return [
    start[0] + (end[0] - start[0]) * progress,
    start[1] + (end[1] - start[1]) * progress
  ];
};

// คำนวณองศาการหันของเครื่องบิน
const calculateHeading = (currentPos: [number, number], destination: [number, number]): number => {
  const lat1 = currentPos[0] * Math.PI / 180;
  const lon1 = currentPos[1] * Math.PI / 180;
  const lat2 = destination[0] * Math.PI / 180;
  const lon2 = destination[1] * Math.PI / 180;

  const dLon = lon2 - lon1;
  const x = Math.cos(lat2) * Math.sin(dLon);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let bearing = Math.atan2(x, y);

  bearing = (bearing * 180 / Math.PI + 180) % 360;

  return bearing;
};

// เพิ่มฟังก์ชันสำหรับสร้างสีที่แตกต่างกัน
const getFlightPathColor = (index: number): string => {
  const colors = [
    '#3b82f6', // น้ำเงิน
    '#ef4444', // แดง
    '#10b981', // เขียว
    '#f59e0b', // ส้ม
    '#8b5cf6', // ม่วง
    '#14b8a6', // เทอร์ควอยซ์
    '#f97316', // ส้มเข้ม
    '#06b6d4', // ฟ้า
    '#ec4899', // ชมพู
    '#84cc16'  // เขียวอ่อน
  ];
  return colors[index % colors.length];
};

const FlightMap = ({ flights }: FlightMapProps) => {
  const [autoTrack, setAutoTrack] = useState(true);
  const [showAllPaths, setShowAllPaths] = useState(true);
  const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState<FlightPosition | null>(null);
  const [flightPositions, setFlightPositions] = useState<FlightPosition[]>(
    flights.map(flight => ({
      flight,
      progress: 0,
      currentLocation: {
        latitude: flight.route.from_airport.latitude,
        longitude: flight.route.from_airport.longitude
      }
    }))
  );
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
      setFlightPositions(prevFlights => {
        return prevFlights.map(flightPos => {
          const newProgress = (flightPos.progress + 0.01) % 1;
          const startPos: [number, number] = [
            flightPos.flight.route.from_airport.latitude,
            flightPos.flight.route.from_airport.longitude
          ];
          const endPos: [number, number] = [
            flightPos.flight.route.to_airport.latitude,
            flightPos.flight.route.to_airport.longitude
          ];
          const [newLat, newLng] = interpolatePosition(startPos, endPos, newProgress);
          
          return {
            ...flightPos,
            progress: newProgress,
            currentLocation: {
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
    
    if (autoTrack && flightPositions.length > 0) {
      interval = setInterval(() => {
        setCurrentFlightIndex((prev) => (prev + 1) % flightPositions.length);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoTrack, flightPositions.length]);

  // ตั้งค่าเครื่องบินที่เลือกเริ่มต้น
  useEffect(() => {
    if (flightPositions.length > 0) {
      setSelectedFlight(flightPositions[currentFlightIndex]);
    }
  }, [flightPositions, currentFlightIndex]);

  useEffect(() => {
    if (autoTrack && flightPositions.length > 0) {
      const flight = flightPositions[currentFlightIndex];
      setSelectedFlight(flight);
      
      if (mapRef.current) {
        const currentPosition: LatLngExpression = [
          flight.currentLocation.latitude,
          flight.currentLocation.longitude,
        ];
        mapRef.current.setView(currentPosition, 4);
      }
    }
  }, [currentFlightIndex, autoTrack, flightPositions]);

  const handleFlightClick = (flightPos: FlightPosition) => {
    setSelectedFlight(flightPos);
    if (!autoTrack && mapRef.current) {
      const position: LatLngExpression = [
        flightPos.currentLocation.latitude,
        flightPos.currentLocation.longitude,
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
        
        {flightPositions.map((flightPos, index) => {
          const isTracked = autoTrack && flightPos === flightPositions[currentFlightIndex];
          const isSelected = selectedFlight === flightPos;
          const shouldShowPath = showAllPaths || isSelected || isTracked;
          
          const currentPos: [number, number] = [
            flightPos.currentLocation.latitude,
            flightPos.currentLocation.longitude,
          ];
          const destination: [number, number] = [
            flightPos.flight.route.to_airport.latitude,
            flightPos.flight.route.to_airport.longitude,
          ];
          const route: LatLngExpression[] = [
            [flightPos.flight.route.from_airport.latitude, flightPos.flight.route.from_airport.longitude],
            destination,
          ];

          const pathColor = getFlightPathColor(index);
          const heading = calculateHeading(currentPos, destination);

          return (
            <div key={flightPos.flight.flight_id}>
              {shouldShowPath && (
                <Polyline 
                  positions={route} 
                  color={isSelected || isTracked ? pathColor : pathColor}
                  weight={isSelected || isTracked ? 3 : 2}
                  opacity={isSelected || isTracked ? 0.8 : 0.5}
                />
              )}
              <Marker
                position={currentPos}
                icon={createRotatedPlaneIcon(heading, isTracked)}
                eventHandlers={{
                  click: () => handleFlightClick(flightPos),
                }}
              >
                <Popup>
                  <div>
                    <h4 style={{ color: pathColor }}>{flightPos.flight.flight_number}</h4>
                    <p>From: {flightPos.flight.route.from_airport.city}</p>
                    <p>To: {flightPos.flight.route.to_airport.city}</p>
                    <p>Status: {flightPos.flight.flight_status}</p>
                    <p>Progress: {Math.round(flightPos.progress * 100)}%</p>
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
        <button
          className={`${styles.button} ${showAllPaths ? styles.active : ''}`}
          onClick={() => setShowAllPaths(!showAllPaths)}
        >
          {showAllPaths ? (
            <>
              <span style={{ fontSize: '16px' }}>🗺️</span>
              <span>Hide All Paths</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '16px' }}>🗺️</span>
              <span>Show All Paths</span>
            </>
          )}
        </button>
      </div>

      {selectedFlight && (
        <div className={`${styles.flightOverlay} ${selectedFlight ? styles.visible : ''}`}>
          <h4 style={{ color: getFlightPathColor(flightPositions.indexOf(selectedFlight)) }}>
            {selectedFlight.flight.flight_number}
          </h4>
          <p>From: {selectedFlight.flight.route.from_airport.city}</p>
          <p>To: {selectedFlight.flight.route.to_airport.city}</p>
          <p>Status: {selectedFlight.flight.flight_status}</p>
          <p>Progress: {Math.round(selectedFlight.progress * 100)}%</p>
        </div>
      )}
    </div>
  );
};

export default FlightMap;