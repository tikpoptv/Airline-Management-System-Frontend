import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer, TextLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import { GL } from '@luma.gl/constants';
import './GlobeMap.css';

// Fallback to default token if environment variable is not set
const MAPBOX_TOKEN = "pk.eyJ1IjoiamVkc2FkYXBvcm4iLCJhIjoiY2xzOWdqcWp2MDNvMjJrbXVnOWYwc2wzNyJ9.uMuDq7UhTkwNZO5-QKOEng";

interface AirportProps {
  iata_code: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
}

interface GlobeMapProps {
  fromAirport: AirportProps;
  toAirport: AirportProps;
  route_id: number;
  onLocationClick?: (lat: number, lon: number) => void;
}

interface AirplaneData {
  position: [number, number, number]; // lon, lat, altitude
  text: string;
  angle?: number;
}

const toRadians = (degrees: number): number => degrees * Math.PI / 180;
const toDegrees = (radians: number): number => radians * 180 / Math.PI;

// Helper function for Haversine distance
const haversineDistance = (coords1: {lat: number, lon: number}, coords2: {lat: number, lon: number}): number => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = toRadians(coords1.lat);
  const lon1 = toRadians(coords1.lon);
  const lat2 = toRadians(coords2.lat);
  const lon2 = toRadians(coords2.lon);
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Function to get a point on the great circle path and its *instantaneous* bearing
const getPointAndBearingOnGreatCircle = (
  lat1Rad: number, lon1Rad: number, 
  lat2Rad: number, lon2Rad: number, 
  fraction: number
): { lat: number, lon: number, bearingRad: number } => {
  const d = Math.acos(Math.sin(lat1Rad) * Math.sin(lat2Rad) +
                     Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lon2Rad - lon1Rad));

  // Calculate current point
  let currentLatRad, currentLonRad;
  if (d === 0 || isNaN(d) || Math.sin(d) === 0) {
    currentLatRad = fraction > 0.5 ? lat2Rad : lat1Rad;
    currentLonRad = fraction > 0.5 ? lon2Rad : lon1Rad;
  } else {
    const A = Math.sin((1 - fraction) * d) / Math.sin(d);
    const B = Math.sin(fraction * d) / Math.sin(d);
    const x = A * Math.cos(lat1Rad) * Math.cos(lon1Rad) + B * Math.cos(lat2Rad) * Math.cos(lon2Rad);
    const y = A * Math.cos(lat1Rad) * Math.sin(lon1Rad) + B * Math.cos(lat2Rad) * Math.sin(lon2Rad);
    const z = A * Math.sin(lat1Rad) + B * Math.sin(lat2Rad);
    currentLatRad = Math.atan2(z, Math.sqrt(x * x + y * y));
    currentLonRad = Math.atan2(y, x);
  }

  // Calculate next point for bearing
  const epsilon = 0.0001;
  let nextFraction = fraction + epsilon;
  if (nextFraction > 1) nextFraction = 1;

  let nextLatRad, nextLonRad;
  if (d === 0 || isNaN(d) || Math.sin(d) === 0) {
    nextLatRad = lat2Rad;
    nextLonRad = lon2Rad;
  } else {
    const A_next = Math.sin((1 - nextFraction) * d) / Math.sin(d);
    const B_next = Math.sin(nextFraction * d) / Math.sin(d);
    const x_next = A_next * Math.cos(lat1Rad) * Math.cos(lon1Rad) + B_next * Math.cos(lat2Rad) * Math.cos(lon2Rad);
    const y_next = A_next * Math.cos(lat1Rad) * Math.sin(lon1Rad) + B_next * Math.cos(lat2Rad) * Math.sin(lon2Rad);
    const z_next = A_next * Math.sin(lat1Rad) + B_next * Math.sin(lat2Rad);
    nextLatRad = Math.atan2(z_next, Math.sqrt(x_next * x_next + y_next * y_next));
    nextLonRad = Math.atan2(y_next, x_next);
  }
  
  // Calculate bearing
  const deltaLonBearing = nextLonRad - currentLonRad;
  const yBearing = Math.sin(deltaLonBearing) * Math.cos(nextLatRad);
  const xBearing = Math.cos(currentLatRad) * Math.sin(nextLatRad) -
                 Math.sin(currentLatRad) * Math.cos(nextLatRad) * Math.cos(deltaLonBearing);
  let bearingRad = Math.atan2(yBearing, xBearing);

  if (isNaN(bearingRad)) {
    if (fraction < epsilon) {
        const initialDeltaLon = lon2Rad - lon1Rad;
        const yInitialBearing = Math.sin(initialDeltaLon) * Math.cos(lat2Rad);
        const xInitialBearing = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                               Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(initialDeltaLon);
        bearingRad = Math.atan2(yInitialBearing, xInitialBearing);
    } else {
      bearingRad = 0;
    }
  }

  return { lat: toDegrees(currentLatRad), lon: toDegrees(currentLonRad), bearingRad };
};

const ARC_LAYER_GET_HEIGHT_RATIO = 0.08;
const VISUAL_ALTITUDE_MULTIPLIER = 0.6;

const GlobeMap: React.FC<GlobeMapProps> = ({ fromAirport, toAirport, route_id, onLocationClick }) => {
  const INITIAL_VIEW_STATE = {
    longitude: (fromAirport.lon + toAirport.lon) / 2,
    latitude: (fromAirport.lat + toAirport.lat) / 2,
    zoom: 2.5,
    pitch: 45, 
    bearing: 0
  };

  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    console.log('Current Route ID:', route_id);
    console.log('From Airport:', fromAirport);
    console.log('To Airport:', toAirport);
    setAnimationProgress(0);
    let frameId: number;
    const animate = () => {
      setAnimationProgress(currentProgress => {
        const nextProgress = currentProgress + 0.001;
        return nextProgress >= 1 ? 0 : nextProgress;
      });
      frameId = requestAnimationFrame(animate);
    };
    if (fromAirport && toAirport) {
      frameId = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [route_id, fromAirport, toAirport]);

  const animatedAirplaneData = useMemo((): AirplaneData[] => {
    if (!fromAirport || !toAirport) return [];
    const f = animationProgress;

    // Calculate ground distance for altitude scaling
    const groundDistanceMeters = haversineDistance(
      { lat: fromAirport.lat, lon: fromAirport.lon },
      { lat: toAirport.lat, lon: toAirport.lon }
    );
    const peakArcAltitude = ARC_LAYER_GET_HEIGHT_RATIO * groundDistanceMeters;

    const lat1Rad = toRadians(fromAirport.lat);
    const lon1Rad = toRadians(fromAirport.lon);
    const lat2Rad = toRadians(toAirport.lat);
    const lon2Rad = toRadians(toAirport.lon);

    const { lat: currentLat, lon: currentLon, bearingRad: currentBearingRad } = getPointAndBearingOnGreatCircle(
      lat1Rad, lon1Rad, lat2Rad, lon2Rad, f
    );

    let currentAltitude = 0;
    const deltaLonForD = lon2Rad - lon1Rad;
    const dForAltitude = Math.acos(Math.sin(lat1Rad) * Math.sin(lat2Rad) +
                           Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonForD));
    if (dForAltitude !== 0 && !isNaN(dForAltitude) && Math.sin(dForAltitude) !== 0) {
        currentAltitude = peakArcAltitude * (4 * f * (1 - f)) * VISUAL_ALTITUDE_MULTIPLIER;
    }
    
    const angle = 90 - toDegrees(currentBearingRad);

    return [{
      position: [currentLon, currentLat, currentAltitude],
      text: '✈',
      angle: angle
    }];
  }, [fromAirport, toAirport, animationProgress]);

  const airportLayer = new ScatterplotLayer<AirportProps>({
    id: 'airport-layer',
    data: [fromAirport, toAirport],
    getPosition: (d: AirportProps) => [d.lon, d.lat],
    getFillColor: [255, 215, 0],
    getRadius: 100000,
    pickable: true,
  });

  const arcLayer = new ArcLayer<{ from: AirportProps; to: AirportProps }>({
    id: 'arc-layer',
    data: [{ from: fromAirport, to: toAirport }],
    getSourcePosition: (d) => [d.from.lon, d.from.lat],
    getTargetPosition: (d) => [d.to.lon, d.to.lat],
    getSourceColor: [0, 170, 220, 200],
    getTargetColor: [0, 170, 220, 200],
    getWidth: 4,
    getHeight: ARC_LAYER_GET_HEIGHT_RATIO,
    getTilt: 0,
    greatCircle: true,
    pickable: false,
  });

  const airplaneTextLayer = new TextLayer({
    id: 'airplane-text-layer',
    data: animatedAirplaneData,
    getPosition: (d: AirplaneData) => d.position,
    getText: (d: AirplaneData) => d.text,
    getSize: 45,
    getColor: [220, 20, 60, 255],
    getAngle: (d: AirplaneData) => d.angle || 0,
    billboard: true,
    sizeUnits: 'pixels',
    characterSet: 'auto',
    parameters: {
      [GL.DEPTH_TEST]: false,
    },
  });

  const handleClick = (event: any) => {
    if (onLocationClick) {
      const { lat, lng } = event.coordinate || event.lngLat;
      onLocationClick(lat, lng);
    }
  };

  return (
    <div className="globe-map-container">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[airportLayer, arcLayer, airplaneTextLayer]}
        onClick={handleClick}
        getTooltip={({ object, layer }) => {
          if (object && layer && layer.id === 'airport-layer') {
            const airport = object as AirportProps;
            return `${airport.iata_code} - ${airport.name}`;
          }
          return null;
        }}
      >
        <StaticMap
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        />
      </DeckGL>
      <div className="globe-map-info">
        <div className="globe-map-route">
          <span className="route-point">{fromAirport.iata_code}</span>
          <span className="route-arrow">→</span>
          <span className="route-point">{toAirport.iata_code}</span>
        </div>
      </div>
    </div>
  );
};

export default GlobeMap; 