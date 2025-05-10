import React, { useState, useCallback } from 'react';
import ReactMapGL, { Marker, ViewportProps, MapEvent } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { CircularProgress } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import './AirportGlobeMap.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoiamVkc2FkYXBvcm4iLCJhIjoiY2xzOWdqcWp2MDNvMjJrbXVnOWYwc2wzNyJ9.uMuDq7UhTkwNZO5-QKOEng";

interface AirportGlobeMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lon: number) => void;
}

const AirportGlobeMap: React.FC<AirportGlobeMapProps> = ({
  latitude,
  longitude,
  onLocationChange
}) => {
  const [viewport, setViewport] = useState<ViewportProps>({
    latitude,
    longitude,
    zoom: 10,
    bearing: 0,
    pitch: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapClick = useCallback((event: MapEvent) => {
    const [lng, lat] = event.lngLat as [number, number];
    onLocationChange(lat, lng);
    setViewport(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  }, [onLocationChange]);

  const handleViewportChange = useCallback((newViewport: ViewportProps) => {
    setViewport(prev => ({
      ...prev,
      ...newViewport
    }));
  }, []);

  if (error) {
    return (
      <div className="airport-globe-map-error">
        <FaMapMarkerAlt />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="airport-globe-map-container">
      <div className="airport-globe-map">
        {isLoading && (
          <div className="airport-globe-map-loading">
            <CircularProgress />
          </div>
        )}
        <ReactMapGL
          {...viewport}
          onViewportChange={handleViewportChange}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onLoad={() => setIsLoading(false)}
          onError={() => setError("Failed to load map")}
        >
          <Marker 
            latitude={latitude} 
            longitude={longitude}
            offsetLeft={-12}
            offsetTop={-24}
          >
            <div className="airport-marker">
              <FaMapMarkerAlt size={24} />
            </div>
          </Marker>
        </ReactMapGL>
      </div>
      <div className="airport-globe-map-info">
        <div className="airport-globe-map-coordinates">
          <FaMapMarkerAlt />
          <span>
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
        </div>
        <div className="airport-globe-map-hint">
          คลิกที่ใดก็ได้บนแผนที่เพื่ออัปเดตพิกัด
        </div>
      </div>
    </div>
  );
};

export default AirportGlobeMap; 