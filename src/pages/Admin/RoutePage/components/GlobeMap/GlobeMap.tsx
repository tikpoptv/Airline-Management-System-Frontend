import React from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import './GlobeMap.css';

// Mapbox token should be stored in a secure environment variable
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJqYW5lIn0.8TZ2N2Z2N2Z2N2Z2N2Z2Nw';

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

const toRadians = (degrees: number): number => degrees * Math.PI / 180;

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

const GlobeMap: React.FC<GlobeMapProps> = ({ fromAirport, toAirport, onLocationClick }) => {
  // Calculate distance between airports for dynamic zoom
  const distance = haversineDistance(
    { lat: fromAirport.lat, lon: fromAirport.lon },
    { lat: toAirport.lat, lon: toAirport.lon }
  );

  // Calculate zoom level based on distance
  const getZoomLevel = (distanceMeters: number) => {
    const distanceKm = distanceMeters / 1000;
    if (distanceKm < 1000) return 5;
    if (distanceKm < 2000) return 4;
    if (distanceKm < 3000) return 3.5;
    if (distanceKm < 5000) return 3;
    return 2;
  };
  
  const INITIAL_VIEW_STATE = {
    longitude: (fromAirport.lon + toAirport.lon) / 2,
    latitude: (fromAirport.lat + toAirport.lat) / 2,
    zoom: getZoomLevel(distance),
    pitch: 45,
    bearing: 0,
  };

  const handleClick = (info: { coordinate?: number[] }) => {
    if (onLocationClick && info.coordinate && info.coordinate.length >= 2) {
      onLocationClick(info.coordinate[1], info.coordinate[0]);
    }
  };

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onClick={handleClick}
      layers={[
        new ScatterplotLayer({
          id: 'airports',
          data: [fromAirport, toAirport],
          getPosition: (d: Airport) => [d.lon, d.lat, 0],
          getRadius: 10000,
          getFillColor: [255, 140, 0],
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 6,
          radiusMinPixels: 1,
          radiusMaxPixels: 100,
          lineWidthMinPixels: 1
        }),
        new ArcLayer({
          id: 'arc',
          data: [{
            sourcePosition: [fromAirport.lon, fromAirport.lat],
            targetPosition: [toAirport.lon, toAirport.lat]
          }],
          getHeight: 0.25,
          getWidth: 2,
          getSourceColor: [0, 128, 200],
          getTargetColor: [0, 128, 200],
          pickable: true,
          opacity: 0.4,
          widthMinPixels: 2,
          widthMaxPixels: 2
        })
      ]}
    >
      <StaticMap
        mapStyle="mapbox://styles/mapbox/dark-v10"
        mapboxApiAccessToken={MAPBOX_TOKEN}
      />
    </DeckGL>
  );
};

export default GlobeMap;
