import React, { useState, useEffect } from 'react';
import GlobeMap, { Airport } from '../GlobeMap/GlobeMap';
import styles from './GlobeMapModal.module.css';

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
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedDuration, setCalculatedDuration] = useState<number | null>(null);
  
  // Calculate distance automatically when modal opens
  useEffect(() => {
    if (isOpen && fromAirport && toAirport) {
      calculateDistanceAutomatically();
    }
  }, [isOpen, fromAirport, toAirport]);

  if (!isOpen || !fromAirport || !toAirport) {
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

  // ปรับ GlobeMap สำหรับใช้ใน GlobeMapModal
  const convertToGlobeMapFormat = (airport: Airport): Airport => {
    return {
      iata_code: airport.iata_code,
      name: airport.name,
      lat: airport.lat,
      lon: airport.lon,
      city: airport.city,
      country: airport.country
    };
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{isRoutePlanning ? 'Check Flight Route' : 'Flight Route Visualization'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.mapContainer}>
            <GlobeMap 
              fromAirport={convertToGlobeMapFormat(fromAirport)} 
              toAirport={convertToGlobeMapFormat(toAirport)} 
            />
          </div>
          
          <div className={styles.info}>
            <div className={styles.airports}>
              <div className={styles.airport}>
                <div className={styles.airportCode}>{fromAirport.iata_code}</div>
                <div className={styles.airportName}>{fromAirport.name}</div>
                {fromAirport.city && fromAirport.country && (
                  <div className={styles.airportLocation}>
                    {fromAirport.city}, {fromAirport.country}
                  </div>
                )}
              </div>
              
              <div className={styles.flightIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              
              <div className={styles.airport}>
                <div className={styles.airportCode}>{toAirport.iata_code}</div>
                <div className={styles.airportName}>{toAirport.name}</div>
                {toAirport.city && toAirport.country && (
                  <div className={styles.airportLocation}>
                    {toAirport.city}, {toAirport.country}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.routeOptions}>
              <div className={styles.routeOption}>
                <h3>Automatically Calculated Data</h3>
                {calculatedDistance !== null && calculatedDuration !== null ? (
                  <div className={styles.routeDetails}>
                    <div className={styles.calculatedValues}>
                      <div>Distance: <strong>{calculatedDistance} kilometers</strong></div>
                      <div>Estimated Time: <strong>{formatDuration(calculatedDuration)}</strong></div>
                    </div>
                    <button 
                      className={styles.optionButton}
                      onClick={handleUseCalculated}
                    >
                      Use Calculated Values
                    </button>
                  </div>
                ) : (
                  <div className={styles.placeholder}>Calculating...</div>
                )}
              </div>

              <div className={styles.routeOption}>
                <h3>Previously Entered Data</h3>
                {hasManualData() ? (
                  <div className={styles.routeDetails}>
                    <div className={styles.manualValues}>
                      <div>Distance: <strong>{manualDistance} kilometers</strong></div>
                      <div>Estimated Time: <strong>{getFormattedManualDuration()}</strong></div>
                    </div>
                    <button 
                      className={styles.optionButton}
                      onClick={handleUseManual}
                    >
                      Use Manual Values
                    </button>
                  </div>
                ) : (
                  <div className={styles.placeholder}>No previously entered data found</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobeMapModal; 