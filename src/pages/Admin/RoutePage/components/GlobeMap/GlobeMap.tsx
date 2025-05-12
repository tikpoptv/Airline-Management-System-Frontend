import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, Map as LeafletMap, DivIcon, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './GlobeMap.module.css';

export interface Airport {
  iata_code: string;
  name: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

interface GlobeMapProps {
  fromAirport: Airport;
  toAirport: Airport;
  onLocationClick?: (lat: number, lon: number) => void;
}

interface FlightPosition {
  id: string;
  fromAirport: Airport;
  toAirport: Airport;
  progress: number;
  currentLocation: {
    lat: number;
    lon: number;
  };
}

// คำนวณตำแหน่งระหว่างจุดสองจุด
const interpolatePosition = (
  startPos: [number, number], 
  endPos: [number, number], 
  progress: number
): [number, number] => {
  // คำนวณแบบเส้นตรง (Linear interpolation)
  const lat = startPos[0] + (endPos[0] - startPos[0]) * progress;
  const lon = startPos[1] + (endPos[1] - startPos[1]) * progress;
  
  return [lat, lon];
};

// คำนวณองศาการหันของเครื่องบิน
const calculateHeading = (startPos: [number, number], endPos: [number, number]): number => {
  const latDiff = endPos[0] - startPos[0];
  const lngDiff = endPos[1] - startPos[1];
  let angle = Math.atan2(lngDiff, latDiff) * 180 / Math.PI;
  
  // ปรับให้อยู่ในช่วง 0-360 องศา
  if (angle < 0) {
    angle += 360;
  }
  
  return angle;
};

// คำนวณระดับซูมที่เหมาะสมตามระยะทาง
const calculateZoomLevel = (startPos: [number, number], endPos: [number, number]): number => {
  const R = 6371; // รัศมีโลกในหน่วยกิโลเมตร
  const lat1 = startPos[0] * Math.PI / 180;
  const lon1 = startPos[1] * Math.PI / 180;
  const lat2 = endPos[0] * Math.PI / 180;
  const lon2 = endPos[1] * Math.PI / 180;
  
  // คำนวณระยะทางด้วย Haversine formula
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // ระยะทางในหน่วยกิโลเมตร
  
  // กำหนดระดับซูมตามระยะทาง - ปรับให้เหมาะสมยิ่งขึ้น
  if (distance < 200) return 8;
  if (distance < 400) return 7;
  if (distance < 800) return 6;
  if (distance < 1600) return 5;
  if (distance < 3000) return 4;
  if (distance < 6000) return 3;
  return 2;
};

// สร้าง Component เพื่อจัดการกับการคลิกบนแผนที่
interface MapEventsProps {
  onLocationClick: (lat: number, lon: number) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ onLocationClick }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: LeafletMouseEvent) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationClick]);
  
  return null;
};

const GlobeMap: React.FC<GlobeMapProps> = ({ fromAirport, toAirport, onLocationClick }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [flightPosition, setFlightPosition] = useState<FlightPosition>({
    id: 'flight-1',
    fromAirport,
    toAirport,
    progress: 0,
    currentLocation: {
      lat: fromAirport.lat,
      lon: fromAirport.lon
    }
  });
  const mapRef = useRef<LeafletMap | null>(null);

  // สร้างไอคอนเครื่องบิน
  const createPlaneIcon = (heading: number, focused: boolean = false): DivIcon => {
    // ปรับทิศทางการหันหน้าของเครื่องบิน
    return new DivIcon({
      className: styles.planeIcon,
      html: `
        <div style="transform: rotate(${heading}deg)" class="${focused ? styles.focused : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
            <path d="M21,16l-2,0l-8-5V3.5C11,2.67,10.33,2,9.5,2S8,2.67,8,3.5V11l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1L13,22v-1.5L11,19v-3.5L21,18V16z" 
              fill="#ef4444" stroke="#ffffff" stroke-width="0.2" />
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // คำนวณจุดศูนย์กลางและระดับซูมที่เหมาะสม
  const startPos: [number, number] = [fromAirport.lat, fromAirport.lon];
  const endPos: [number, number] = [toAirport.lat, toAirport.lon];
  
  // ปรับจุดศูนย์กลางให้อยู่ตรงกลางระหว่างสองจุด แต่คำนึงถึงสัดส่วนของระยะทางด้วย
  const center: LatLngExpression = [
    (fromAirport.lat + toAirport.lat) / 2,
    (fromAirport.lon + toAirport.lon) / 2
  ];
  const zoom = calculateZoomLevel(startPos, endPos);

  // เส้นทางเครื่องบิน
  const flightPath: LatLngExpression[] = [
    [fromAirport.lat, fromAirport.lon], 
    [toAirport.lat, toAirport.lon]
  ];
  
  // คำนวณองศาการหันของเครื่องบิน
  const fixedHeading = calculateHeading(
    [fromAirport.lat, fromAirport.lon],
    [toAirport.lat, toAirport.lon]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        const newProgress = prev + 0.005;
        return newProgress > 1 ? 0 : newProgress;
      });
      
      setFlightPosition(prev => {
        const [newLat, newLon] = interpolatePosition(
          [fromAirport.lat, fromAirport.lon],
          [toAirport.lat, toAirport.lon],
          animationProgress
        );
        
        return {
          ...prev,
          progress: animationProgress,
          currentLocation: {
            lat: newLat,
            lon: newLon
          }
        };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [fromAirport, toAirport, animationProgress]);

  // จัดการเมื่อคลิกที่เครื่องบิน
  const handlePlaneClick = () => {
    if (mapRef.current) {
      mapRef.current.setView([flightPosition.currentLocation.lat, flightPosition.currentLocation.lon], 5);
    }
  };

  // สร้าง Airport markers
  const createAirportMarker = (airport: Airport, isDestination: boolean = false) => {
    const markerClassName = isDestination ? styles.toAirport : styles.fromAirport;
    const markerColor = isDestination ? '#ef4444' : '#3b82f6';
    
    return (
      <Marker
        position={[airport.lat, airport.lon]}
        icon={new DivIcon({
          className: styles.airportIcon,
          html: `
            <div class="${markerClassName}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                  fill="${markerColor}" stroke="#ffffff" stroke-width="0.5" />
              </svg>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        })}
      >
        <Popup>
          <div className={styles.popup}>
            <h3>{airport.iata_code} - {airport.name}</h3>
            {airport.city && airport.country && <p>{airport.city}, {airport.country}</p>}
            <p>Coordinates: {airport.lat.toFixed(4)}, {airport.lon.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center}
        zoom={zoom}
        className={styles.map}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Gradient Flight Path */}
        <Polyline 
          positions={flightPath} 
          weight={3.5}
          opacity={0.9}
          dashArray="6, 12"
          color={"#3b82f6"}
          pathOptions={{
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
        
        {/* Path Shadow */}
        <Polyline 
          positions={flightPath} 
          weight={5}
          opacity={0.3}
          color={"#3b82f6"}
          dashArray=""
          pathOptions={{
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />

        {/* Direction Arrow */}
        <Marker
          position={[
            fromAirport.lat + (toAirport.lat - fromAirport.lat) * 0.5,
            fromAirport.lon + (toAirport.lon - fromAirport.lon) * 0.5
          ]}
          icon={new DivIcon({
            className: styles.directionIcon,
            html: `
              <div style="transform: rotate(${fixedHeading}deg)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="20" height="20">
                  <path d="M8 5v14l11-7z" stroke="#ffffff" stroke-width="0.3" />
                </svg>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        />
        
        {/* Airports */}
        {createAirportMarker(fromAirport, false)}
        {createAirportMarker(toAirport, true)}
        
        {/* Plane */}
        <Marker
          position={[flightPosition.currentLocation.lat, flightPosition.currentLocation.lon]}
          icon={createPlaneIcon(fixedHeading, true)}
          eventHandlers={{
            click: handlePlaneClick
          }}
        >
          <Popup>
            <div className={styles.popup}>
              <h3>Flight Information</h3>
              <p>From: {fromAirport.iata_code} {fromAirport.city && `(${fromAirport.city})`}</p>
              <p>To: {toAirport.iata_code} {toAirport.city && `(${toAirport.city})`}</p>
              <p>Progress: {Math.round(flightPosition.progress * 100)}%</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Click handler component */}
        {onLocationClick && <MapEvents onLocationClick={onLocationClick} />}
      </MapContainer>
    </div>
  );
};

export default GlobeMap; 