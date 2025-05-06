import React from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
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
}

const GlobeMap: React.FC<GlobeMapProps> = ({ fromAirport, toAirport }) => {
  const INITIAL_VIEW_STATE = {
    longitude: (fromAirport.lon + toAirport.lon) / 2,
    latitude: (fromAirport.lat + toAirport.lat) / 2 + 5,
    zoom: 2.5,
    pitch: 0,
    bearing: 0,
  };

  const airportLayer = new ScatterplotLayer<Airport>({
    id: 'airport-layer',
    data: [fromAirport, toAirport],
    getPosition: (d: Airport) => [d.lon, d.lat],
    getFillColor: [255, 215, 0],
    getRadius: 100000,
    pickable: true,
  });

  const arcLayer = new ArcLayer<{ from: Airport; to: Airport }>({
    id: 'arc-layer',
    data: [{ from: fromAirport, to: toAirport }],
    getSourcePosition: (d: { from: Airport; to: Airport }) => [d.from.lon, d.from.lat],
    getTargetPosition: (d: { from: Airport; to: Airport }) => [d.to.lon, d.to.lat],
    getSourceColor: [0, 198, 255],
    getTargetColor: [0, 114, 255],
    getWidth: 3,
    greatCircle: true,
  });

  return (
    <div className="globe-map-container">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[airportLayer, arcLayer]}
        width="100%"
        height="500px"
        getTooltip={({ object, layer }) => {
          if (object && layer && layer.id === 'airport-layer') {
            const airport = object as Airport;
            return `${airport.iata_code} - ${airport.name}`;
          }
          return null;
        }}
      >
        <StaticMap
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          width="100%"
          height="100%"
        />
      </DeckGL>
    </div>
  );
};

export default GlobeMap;
