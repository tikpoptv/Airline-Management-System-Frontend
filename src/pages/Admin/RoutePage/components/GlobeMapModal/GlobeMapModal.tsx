import React, { useState, useEffect } from 'react';
import GlobeMap, { Airport } from '../GlobeMap/GlobeMap';
import './GlobeMapModal.css';

interface GlobeMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAirport: Airport | null;
  toAirport: Airport | null;
  onCalculateDistance?: (distance: number, duration: number, isManual: boolean) => void;
  onProceed?: () => void;
  isRoutePlanning?: boolean;
  // Values entered by the user previously
  manualDistance?: string;
  manualDuration?: {
    hours: string;
    minutes: string;
    seconds: string;
  } | string; // Added string format to support multiple data formats
}

const GlobeMapModal: React.FC<GlobeMapModalProps> = ({
  isOpen,
  onClose,
  fromAirport,
  toAirport,
  onCalculateDistance,
  onProceed,
  isRoutePlanning = false,
  manualDistance,
  manualDuration
}) => {
  console.log('GlobeMapModal props:', { isOpen, fromAirport, toAirport, manualDistance, manualDuration });
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedDuration, setCalculatedDuration] = useState<number | null>(null);
  
  // Calculate distance automatically when modal opens
  useEffect(() => {
    if (isOpen && fromAirport && toAirport) {
      calculateDistanceAutomatically();
    }
  }, [isOpen, fromAirport, toAirport]);

  if (!isOpen || !fromAirport || !toAirport) {
    console.log('GlobeMapModal not showing due to:', { 
      isOpen, 
      fromAirport: !!fromAirport, 
      toAirport: !!toAirport 
    });
    return null;
  }

  // Convert user time input to minutes
  const getManualDurationInMinutes = (): number => {
    if (!manualDuration) return 0;
    
    // If it's an object
    if (typeof manualDuration === 'object') {
      const hours = parseInt(manualDuration.hours || '0', 10) || 0;
      const minutes = parseInt(manualDuration.minutes || '0', 10) || 0;
      const seconds = parseInt(manualDuration.seconds || '0', 10) || 0;
      
      return hours * 60 + minutes + Math.ceil(seconds / 60);
    }
    
    // If it's a string (could be in "HH:MM:SS" format or pure minutes)
    if (typeof manualDuration === 'string') {
      // If it's in "HH:MM:SS" format
      if (manualDuration.includes(':')) {
        const parts = manualDuration.split(':');
        const hours = parseInt(parts[0] || '0', 10) || 0;
        const minutes = parseInt(parts[1] || '0', 10) || 0;
        const seconds = parseInt(parts[2] || '0', 10) || 0;
        
        return hours * 60 + minutes + Math.ceil(seconds / 60);
      }
      
      // If it's pure minutes
      return parseInt(manualDuration, 10) || 0;
    }
    
    return 0;
  };

  // Format time in a readable format
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    }
    
    return `${hours} hr ${mins > 0 ? `${mins} min` : ''}`;
  };

  // Calculate great circle distance between the two airports
  const calculateDistanceAutomatically = () => {
    if (fromAirport && toAirport) {
      const R = 6371; // Earth radius in km
      const lat1 = fromAirport.lat * Math.PI / 180;
      const lat2 = toAirport.lat * Math.PI / 180;
      const dLat = (toAirport.lat - fromAirport.lat) * Math.PI / 180;
      const dLon = (toAirport.lon - fromAirport.lon) * Math.PI / 180;
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = Math.round(R * c * 100) / 100; // Round to 2 decimal places
      
      // Calculate approximate time (assuming average speed of 800 km/h)
      const avgSpeed = 800; // km/h
      const durationHours = distance / avgSpeed;
      const durationMinutes = Math.round(durationHours * 60);
      
      setCalculatedDistance(distance);
      setCalculatedDuration(durationMinutes);
    }
  };

  const handleUseCalculated = () => {
    if (calculatedDistance && calculatedDuration && onCalculateDistance && onProceed) {
      onCalculateDistance(calculatedDistance, calculatedDuration, false);
      onProceed();
    }
  };

  const handleUseManual = () => {
    if (manualDistance && onCalculateDistance && onProceed) {
      const distance = parseFloat(manualDistance);
      const durationMinutes = getManualDurationInMinutes();
      
      if (!isNaN(distance)) {
        onCalculateDistance(distance, durationMinutes, true);
        onProceed();
      }
    }
  };

  // Convert user time format to a readable format
  const getFormattedManualDuration = (): string => {
    if (!manualDuration) return '-';
    
    // If it's an object
    if (typeof manualDuration === 'object') {
      const hours = parseInt(manualDuration.hours || '0', 10) || 0;
      const minutes = parseInt(manualDuration.minutes || '0', 10) || 0;
      const seconds = parseInt(manualDuration.seconds || '0', 10) || 0;
      
      let result = '';
      if (hours > 0) result += `${hours} hr `;
      if (minutes > 0) result += `${minutes} min `;
      if (seconds > 0) result += `${seconds} sec`;
      
      return result.trim() || '0 min';
    }
    
    // If it's a string (could be in "HH:MM:SS" format or pure minutes)
    if (typeof manualDuration === 'string') {
      // If it's in "HH:MM:SS" format
      if (manualDuration.includes(':')) {
        const parts = manualDuration.split(':');
        const hours = parseInt(parts[0] || '0', 10) || 0;
        const minutes = parseInt(parts[1] || '0', 10) || 0;
        const seconds = parseInt(parts[2] || '0', 10) || 0;
        
        let result = '';
        if (hours > 0) result += `${hours} hr `;
        if (minutes > 0) result += `${minutes} min `;
        if (seconds > 0) result += `${seconds} sec`;
        
        return result.trim() || '0 min';
      }
      
      // If it's pure minutes
      const mins = parseInt(manualDuration, 10) || 0;
      return formatDuration(mins);
    }
    
    return '-';
  };

  // Check if manual data exists
  const hasManualData = (): boolean => {
    return !!manualDistance && (
      (typeof manualDuration === 'object' && Object.values(manualDuration).some(v => v && v !== '0')) ||
      (typeof manualDuration === 'string' && manualDuration !== '' && manualDuration !== '0')
    );
  };

  return (
    <div className="globe-map-modal-overlay">
      <div className="globe-map-modal">
        <div className="globe-map-modal-header">
          <h2>{isRoutePlanning ? 'Check Flight Route' : 'Flight Route Visualization'}</h2>
          <button className="globe-map-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="globe-map-modal-body">
          <GlobeMap 
            fromAirport={fromAirport} 
            toAirport={toAirport} 
          />
          
          <div className="globe-map-modal-info">
            <div className="globe-map-modal-airports">
              <div className="globe-map-modal-airport">
                <div className="globe-map-modal-airport-code">{fromAirport.iata_code}</div>
                <div className="globe-map-modal-airport-name">{fromAirport.name}</div>
                {fromAirport.city && fromAirport.country && (
                  <div className="globe-map-modal-airport-location">
                    {fromAirport.city}, {fromAirport.country}
                  </div>
                )}
              </div>
              
              <div className="globe-map-modal-flight-icon">✈️</div>
              
              <div className="globe-map-modal-airport">
                <div className="globe-map-modal-airport-code">{toAirport.iata_code}</div>
                <div className="globe-map-modal-airport-name">{toAirport.name}</div>
                {toAirport.city && toAirport.country && (
                  <div className="globe-map-modal-airport-location">
                    {toAirport.city}, {toAirport.country}
                  </div>
                )}
              </div>
            </div>

            <div className="route-options">
              <div className="route-option">
                <h3>Automatically Calculated Data</h3>
                {calculatedDistance !== null && calculatedDuration !== null ? (
                  <div className="route-details">
                    <div className="globe-map-calculated-distance">
                      <div>Distance: <strong>{calculatedDistance} kilometers</strong></div>
                      <div>Estimated Time: <strong>{formatDuration(calculatedDuration)}</strong></div>
                    </div>
                    <button 
                      className="route-option-button"
                      onClick={handleUseCalculated}
                    >
                      Use Calculated Values
                    </button>
                  </div>
                ) : (
                  <div className="route-placeholder">Calculating...</div>
                )}
              </div>

              <div className="route-option">
                <h3>Previously Entered Data</h3>
                {hasManualData() ? (
                  <div className="route-details">
                    <div className="globe-map-manual-values">
                      <div>Distance: <strong>{manualDistance} kilometers</strong></div>
                      <div>Estimated Time: <strong>{getFormattedManualDuration()}</strong></div>
                    </div>
                    <button 
                      className="route-option-button"
                      onClick={handleUseManual}
                    >
                      Use Manual Values
                    </button>
                  </div>
                ) : (
                  <div className="route-placeholder">No previously entered data found</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="globe-map-modal-actions">
          <button className="globe-map-modal-button btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobeMapModal; 