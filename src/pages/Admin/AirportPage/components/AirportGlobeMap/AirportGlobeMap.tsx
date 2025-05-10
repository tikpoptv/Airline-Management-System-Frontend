import React, { useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'mapbox-gl/dist/mapbox-gl.css';
import './AirportGlobeMap.css';

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
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom: 10
  });

  const onClick = (event: any) => {
    const { lat, lng } = event.lngLat;
    onLocationChange(lat, lng);
    setViewState(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  return (
    <div className="airport-globe-map-container">
      <div className="airport-globe-map">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={onClick}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken="pk.eyJ1IjoiamVkc2FkYXBvcm4iLCJhIjoiY2xzOWdqcWp2MDNvMjJrbXVnOWYwc2wzNyJ9.uMuDq7UhTkwNZO5-QKOEng"
        >
          <Marker
            latitude={latitude}
            longitude={longitude}
            anchor="center"
          >
            <div className="airport-marker">
              <FaMapMarkerAlt size={24} />
            </div>
          </Marker>
        </Map>
      </div>
      <div className="airport-globe-map-info">
        <div className="airport-globe-map-coordinates">
          <FaMapMarkerAlt />
          <span>
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
        </div>
        <div className="airport-globe-map-hint">
          Click anywhere on the map to update coordinates
        </div>
      </div>
    </div>
  );
};

export default AirportGlobeMap; 