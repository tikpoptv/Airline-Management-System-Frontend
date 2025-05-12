import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, Map as LeafletMap, DivIcon, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './GlobeMap.css';

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
  zoomLevel?: number;
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
  // แปลงจากองศาเป็นเรเดียน
  const lat1 = startPos[0] * Math.PI / 180;
  const lon1 = startPos[1] * Math.PI / 180;
  const lat2 = endPos[0] * Math.PI / 180;
  const lon2 = endPos[1] * Math.PI / 180;

  // คำนวณระยะทางระหว่างจุด
  const d = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
    )
  );

  if (d === 0) {
    return startPos;
  }

  // คำนวณจุดระหว่างทาง
  const a = Math.sin((1 - progress) * d) / Math.sin(d);
  const b = Math.sin(progress * d) / Math.sin(d);

  const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
  const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);

  // แปลงกลับเป็นองศา
  return [lat * 180 / Math.PI, lon * 180 / Math.PI];
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
  
  // กำหนดระดับซูมตามระยะทาง
  if (distance < 500) return 6;
  if (distance < 1000) return 5;
  if (distance < 2000) return 4;
  if (distance < 5000) return 3;
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

const GlobeMap: React.FC<GlobeMapProps> = ({ fromAirport, toAirport, onLocationClick, zoomLevel }) => {
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
    return new DivIcon({
      className: 'globe-map-plane-icon',
      html: `<div style="transform: rotate(${heading}deg)" class="${focused ? 'focused' : ''}">${focused ? '🛩️' : '✈️'}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // คำนวณจุดศูนย์กลางและระดับซูมที่เหมาะสม
  const startPos: [number, number] = [fromAirport.lat, fromAirport.lon];
  const endPos: [number, number] = [toAirport.lat, toAirport.lon];
  const center: LatLngExpression = [
    (fromAirport.lat + toAirport.lat) / 2,
    (fromAirport.lon + toAirport.lon) / 2
  ];
  
  // ใช้ค่า zoomLevel ที่รับมาถ้ามี มิฉะนั้นคำนวณ zoom จากระยะทาง
  const zoom = zoomLevel !== undefined ? zoomLevel : calculateZoomLevel(startPos, endPos);

  // อัพเดทตำแหน่งเครื่องบินแบบอนิเมชัน
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

  // เส้นทางเครื่องบิน
  const flightPath: LatLngExpression[] = [
    [fromAirport.lat, fromAirport.lon], 
    [toAirport.lat, toAirport.lon]
  ];
  
  // คำนวณองศาการหันของเครื่องบิน
  const currentPos: [number, number] = [
    flightPosition.currentLocation.lat,
    flightPosition.currentLocation.lon
  ];
  const destination: [number, number] = [toAirport.lat, toAirport.lon];
  const heading = calculateHeading(currentPos, destination);

  // จัดการเมื่อคลิกที่เครื่องบิน
  const handlePlaneClick = () => {
    if (mapRef.current) {
      mapRef.current.setView([flightPosition.currentLocation.lat, flightPosition.currentLocation.lon], 5);
    }
  };

  // สร้าง Airport markers
  const createAirportMarker = (airport: Airport, isDestination: boolean = false) => {
    return (
      <Marker
        position={[airport.lat, airport.lon]}
        icon={new DivIcon({
          className: 'globe-map-airport-icon',
          html: `<div class="${isDestination ? 'globe-map-to-airport' : 'globe-map-from-airport'}">${isDestination ? '🔴' : '🔵'}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })}
      >
        <Popup>
          <div className="globe-map-popup">
            <h3>{airport.iata_code} - {airport.name}</h3>
            {airport.city && <p>{airport.city}, {airport.country}</p>}
            <p>Coordinates: {airport.lat.toFixed(4)}, {airport.lon.toFixed(4)}</p>
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <div className="globe-map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        className="globe-map"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onLocationClick && <MapEvents onLocationClick={onLocationClick} />}
        
        {/* เส้นทางบิน */}
        <Polyline 
          positions={flightPath} 
          color="#3b82f6" 
          weight={3} 
          opacity={0.7} 
        />
        
        {/* สนามบินต้นทาง */}
        {createAirportMarker(fromAirport)}
        
        {/* สนามบินปลายทาง */}
        {createAirportMarker(toAirport, true)}
        
        {/* เครื่องบินที่กำลังบิน */}
        <Marker 
          position={[flightPosition.currentLocation.lat, flightPosition.currentLocation.lon]}
          icon={createPlaneIcon(heading, true)}
          eventHandlers={{ click: handlePlaneClick }}
        >
          <Popup>
            <div className="globe-map-popup">
              <h3>Flight in progress</h3>
              <p>From: {fromAirport.iata_code} {fromAirport.city && `(${fromAirport.city})`}</p>
              <p>To: {toAirport.iata_code} {toAirport.city && `(${toAirport.city})`}</p>
              <p>Progress: {Math.round(flightPosition.progress * 100)}%</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      <div className="globe-map-controls">
        <div className="globe-map-flight-info">
          <h4>{fromAirport.iata_code} ✈️ {toAirport.iata_code}</h4>
          <p>Progress: {Math.round(flightPosition.progress * 100)}%</p>
        </div>
      </div>
    </div>
  );
};

export default GlobeMap; 