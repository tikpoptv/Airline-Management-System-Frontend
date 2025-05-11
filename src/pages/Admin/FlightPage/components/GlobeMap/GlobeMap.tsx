import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer, TextLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import { GL } from '@luma.gl/constants';
import './GlobeMap.css';
import { FlyToInterpolator } from '@deck.gl/core';

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
  if (d === 0 || isNaN(d) || Math.sin(d) === 0) { // Added Math.sin(d) === 0 for robustness
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

  // Calculate next point for bearing (infinitesimally small step forward)
  const epsilon = 0.0001; // Small fraction for next step
  let nextFraction = fraction + epsilon;
  if (nextFraction > 1) nextFraction = 1; // Cap at destination

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
  
  // Calculate bearing from current point to next point
  const deltaLonBearing = nextLonRad - currentLonRad;
  const yBearing = Math.sin(deltaLonBearing) * Math.cos(nextLatRad);
  const xBearing = Math.cos(currentLatRad) * Math.sin(nextLatRad) -
                 Math.sin(currentLatRad) * Math.cos(nextLatRad) * Math.cos(deltaLonBearing);
  let bearingRad = Math.atan2(yBearing, xBearing);

  // Handle case where current and next point are virtually identical (e.g., at the very end)
  if (isNaN(bearingRad)) {
    // Fallback: bearing towards the destination if at start, or maintain previous if possible
    // For simplicity, if at the start, calculate bearing to end. If at end, can be 0 or last known.
    if (fraction < epsilon) { // At the start
        const initialDeltaLon = lon2Rad - lon1Rad;
        const yInitialBearing = Math.sin(initialDeltaLon) * Math.cos(lat2Rad);
        const xInitialBearing = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                               Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(initialDeltaLon);
        bearingRad = Math.atan2(yInitialBearing, xInitialBearing);
    } else { // At or near the end, or other NaN cases
        bearingRad = 0; // Or maintain last valid bearing if implemented
    }
  }

  return { lat: toDegrees(currentLatRad), lon: toDegrees(currentLonRad), bearingRad };
};

const ARC_LAYER_GET_HEIGHT_RATIO = 0.08;
const VISUAL_ALTITUDE_MULTIPLIER = 0.8;

const GlobeMap: React.FC<GlobeMapProps> = ({ fromAirport, toAirport, onLocationClick }) => {
  console.log('GlobeMap rendering with:', { fromAirport, toAirport });
  
  // Calculate the distance between airports
  const distance = haversineDistance(
    { lat: fromAirport.lat, lon: fromAirport.lon },
    { lat: toAirport.lat, lon: toAirport.lon }
  );
  
  // Convert distance to kilometers for easier calculations
  const distanceKm = distance / 1000;
  console.log('Distance between airports:', distanceKm.toFixed(0), 'km');
  
  // Calculate zoom level directly based on distance
  // Define specific zoom levels for different distance ranges
  let zoom;
  if (distanceKm < 2000) {
    // Short flights (< 2000 km): higher zoom level (5.0 to 3.5)
    zoom = 5.0 - (distanceKm / 2000) * 1.5;
  } else if (distanceKm < 10000) {
    // Medium flights (2000-10000 km): medium zoom level (3.5 to 2.5)
    zoom = 3.5 - ((distanceKm - 2000) / 8000) * 1.0;
  } else {
    // Long flights (> 10000 km): lower zoom level (2.5 to 2.0) 
    // Slightly increase min zoom to ensure better visibility
    zoom = 2.2 - Math.min((distanceKm - 10000) / 10000, 1) * 0.2;
  }
  
  console.log('Calculated zoom level:', zoom.toFixed(2));
  
  // Calculate bearing between airports
  const deltaLon = toAirport.lon - fromAirport.lon;
  const y = Math.sin(deltaLon) * Math.cos(toRadians(toAirport.lat));
  const x = Math.cos(toRadians(fromAirport.lat)) * Math.sin(toRadians(toAirport.lat)) -
           Math.sin(toRadians(fromAirport.lat)) * Math.cos(toRadians(toAirport.lat)) * Math.cos(deltaLon);
  const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
  
  // Calculate center point that will place the route in the middle of the view
  const lat1Rad = toRadians(fromAirport.lat);
  const lon1Rad = toRadians(fromAirport.lon);
  const lat2Rad = toRadians(toAirport.lat);
  const lon2Rad = toRadians(toAirport.lon);
  
  // Instead of using exact midpoint at 0.5, we may need to adjust based on route
  // For trans-oceanic or very long routes, we want to see more of the route
  const midpointFraction = 0.5; // Default to exact midpoint
  
  // For some routes, we need to adjust the center point to get better view
  // Based on geographic location pattern analysis
  const isNorthToSouthRoute = Math.abs(fromAirport.lat - toAirport.lat) > 
                             Math.abs(fromAirport.lon - toAirport.lon);
  
  const isTransOceanic = distanceKm > 5000;
  const isEastWestLongRoute = !isNorthToSouthRoute && isTransOceanic;

  // Get adjusted midpoint that places the route in center of view
  const { lat: greatCircleMidLat, lon: greatCircleMidLon } = getPointAndBearingOnGreatCircle(
    lat1Rad, lon1Rad, lat2Rad, lon2Rad, midpointFraction
  );
  
  // For very long east-west routes, we may need to adjust the view bearing
  let viewBearing = bearing;
  // If route crosses date line, adjust bearing for better view
  const lonDiff = Math.abs(fromAirport.lon - toAirport.lon);
  if (lonDiff > 180) {
    // For routes crossing date line, align view with route direction 
    viewBearing = (bearing + 180) % 360; 
  } else if (isEastWestLongRoute) {
    // For long east-west routes, align view more with route
    viewBearing = bearing;
  }
  
  // Use calculated centerpoint 
  const centerLat = greatCircleMidLat;
  let centerLon = greatCircleMidLon;
  
  // Handle international date line crossing for center longitude
  if (lonDiff > 180) {
    if (fromAirport.lon < 0 && toAirport.lon > 0) {
      centerLon = (fromAirport.lon + 360 + toAirport.lon) / 2;
      if (centerLon > 180) centerLon -= 360;
    } else if (fromAirport.lon > 0 && toAirport.lon < 0) {
      centerLon = (fromAirport.lon + toAirport.lon + 360) / 2;
      if (centerLon > 180) centerLon -= 360;
    }
  }
  
  console.log('Route analysis:', {
    distance: distanceKm.toFixed(0) + ' km',
    isNorthToSouthRoute,
    isTransOceanic,
    viewBearing: viewBearing.toFixed(1),
    centerPoint: { lat: centerLat.toFixed(2), lon: centerLon.toFixed(2) }
  });
  
  // Adjust pitch based on distance and route type
  const maxPitch = 45; // Reduced for better overview
  const minPitch = 30; // Lower minimum for flatter view when needed
  
  // Calculate appropriate pitch based on route characteristics
  let pitch;
  if (isNorthToSouthRoute) {
    // For north-south routes, use higher pitch to see curve better
    pitch = maxPitch;
  } else {
    // For east-west routes, use pitch based on distance
    pitch = minPitch + ((15000 - Math.min(distanceKm, 15000)) / 15000) * (maxPitch - minPitch);
  }
  
  const INITIAL_VIEW_STATE = {
    longitude: centerLon,
    latitude: centerLat,
    zoom: zoom,
    pitch: pitch,
    bearing: viewBearing,
    transitionDuration: 1000,
    transitionInterpolator: new FlyToInterpolator()
  };
  
  console.log('GlobeMap view state:', INITIAL_VIEW_STATE, 'Distance:', distance / 1000, 'km', 'Zoom:', zoom);

  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
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
  }, [fromAirport, toAirport]);

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
    // Check if points are same or very close using the original d calculation logic if needed
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

  const airportLayer = new ScatterplotLayer<Airport>({
    id: 'airport-layer',
    data: [fromAirport, toAirport],
    getPosition: (d: Airport) => [d.lon, d.lat],
    getFillColor: [255, 140, 0],
    getRadius: 120000,
    pickable: true,
    radiusUnits: 'meters',
  });

  const arcLayer = new ArcLayer<{ from: Airport; to: Airport }>({
    id: 'arc-layer',
    data: [{ from: fromAirport, to: toAirport }],
    getSourcePosition: (d) => [d.from.lon, d.from.lat],
    getTargetPosition: (d) => [d.to.lon, d.to.lat],
    getSourceColor: [0, 128, 255, 230],
    getTargetColor: [0, 128, 255, 230],
    getWidth: 5,
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
    getSize: 50,
    getColor: [255, 0, 0, 255],
    getAngle: (d: AirplaneData) => d.angle || 0,
    billboard: true,
    sizeUnits: 'pixels',
    characterSet: 'auto',
    parameters: {
      [GL.DEPTH_TEST]: false,
    },
  });

  // DeckGL event type is complex and specific type definition is not our main concern right now
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (event: any) => {
    if (onLocationClick && event && event.coordinate) {
      const lat = Array.isArray(event.coordinate) ? event.coordinate[1] : (event.lngLat?.lat ?? 0);
      const lng = Array.isArray(event.coordinate) ? event.coordinate[0] : (event.lngLat?.lng ?? 0);
      onLocationClick(lat, lng);
    }
  };

  return (
    <div className="globe-map-container">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[airportLayer, arcLayer, airplaneTextLayer]}
        width="100%"
        height="100%"
        onClick={handleClick}
        getTooltip={({ object, layer }) => {
          if (object && layer && layer.id === 'airport-layer') {
            const airport = object as Airport;
            return `${airport.iata_code} - ${airport.name}`;
          }
          return null;
        }}
      >
        <StaticMap
          mapStyle="mapbox://styles/mapbox/light-v10"
          mapboxApiAccessToken="pk.eyJ1IjoiZGV2LW5vcmRpZSIsImEiOiJjbGRtYzJndDEwMDM3M3JvZG56anFsbzl2In0.JMeq3FeAkMoxd0PY2SuGmg"
        />
      </DeckGL>
    </div>
  );
};

export default GlobeMap; 