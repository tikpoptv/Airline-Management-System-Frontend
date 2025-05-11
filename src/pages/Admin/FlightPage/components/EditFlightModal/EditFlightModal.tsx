import React, { useState } from 'react';
import styles from './EditFlightModal.module.css';
import { Flight } from '../../types';
import { UpdateFlightBasicData, UpdateFlightAdvancedData, updateFlightBasic, updateFlightAdvanced } from '../../../../../services/flight/flightService';
import ConfirmationModal from './ConfirmationModal';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { message } from 'antd';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight;
  onUpdate: () => void;
}

const FLIGHT_STATUS_MAP = {
  Scheduled: 'Scheduled',
  Delayed: 'Delayed',
  Cancelled: 'Cancelled',
  Completed: 'Completed'
} as const;

const EditFlightModal: React.FC<Props> = ({
  isOpen,
  onClose,
  flight,
  onUpdate
}) => {
  // Basic data state
  const [basicData, setBasicData] = useState<UpdateFlightBasicData>({
    flight_status: flight.flight_status,
    cancellation_reason: flight.cancellation_reason || undefined
  });

  // Advanced data state
  const [advancedData, setAdvancedData] = useState<UpdateFlightAdvancedData>({
    flight_number: flight.flight_number,
    aircraft_id: flight.aircraft.aircraft_id,
    route_id: flight.route.route_id,
    departure_time: flight.departure_time || undefined,
    arrival_time: flight.arrival_time || undefined
  });

  // UI states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAdvancedEdit, setIsAdvancedEdit] = useState(false);

  if (!isOpen) return null;

  const handleBasicInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBasicData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdvancedInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdvancedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAdvancedData = () => {
    if (advancedData.departure_time && advancedData.arrival_time) {
      const departureTime = new Date(advancedData.departure_time).getTime();
      const arrivalTime = new Date(advancedData.arrival_time).getTime();
      if (arrivalTime <= departureTime) {
        return 'Arrival time must be after departure time';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate if advanced mode
    if (showAdvanced) {
      const validationError = validateAdvancedData();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsAdvancedEdit(showAdvanced);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    const messageKey = 'updatable';
    message.loading({ content: 'Saving changes...', key: messageKey });
    
    try {
      if (showAdvanced) {
        await updateFlightAdvanced(flight.flight_id, advancedData);
      }
      await updateFlightBasic(flight.flight_id, basicData);
      
      message.success({
        content: 'Flight details updated successfully',
        key: messageKey,
        duration: 3
      });
      
      onUpdate();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating flight data';
      setError(errorMessage);
      
      message.error({
        content: errorMessage,
        key: messageKey,
        duration: 4
      });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const formatDateTimeForInput = (dateTimeStr: string | undefined) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Invalid date format:', error);
      return '';
    }
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>×</button>
          
          <div className={styles.header}>
            <h2>Edit Flight</h2>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Saving changes...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Basic Flight Information */}
              <div className={styles.formGroup}>
                <label>Flight Status</label>
                <select
                  name="flight_status"
                  value={basicData.flight_status}
                  onChange={handleBasicInputChange}
                  className={`${styles.select} ${styles.statusSelect}`}
                >
                  {Object.entries(FLIGHT_STATUS_MAP).map(([value, label]) => (
                    <option 
                      key={value} 
                      value={value}
                      className={`${styles.statusOption} ${styles[value.toLowerCase()]}`}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {basicData.flight_status === 'Cancelled' && (
                <div className={styles.formGroup}>
                  <label>Cancellation Reason</label>
                  <input
                    type="text"
                    name="cancellation_reason"
                    value={basicData.cancellation_reason || ''}
                    onChange={handleBasicInputChange}
                    className={styles.input}
                    placeholder="Enter cancellation reason..."
                  />
                </div>
              )}

              {/* Advanced Toggle Button */}
              <button
                type="button"
                className={styles.advancedToggle}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </button>

              {/* Advanced Flight Information */}
              {showAdvanced && (
                <div className={styles.advancedSection}>
                  <div className={styles.formGroup}>
                    <label>Flight Number</label>
                    <input
                      type="text"
                      name="flight_number"
                      value={advancedData.flight_number}
                      onChange={handleAdvancedInputChange}
                      className={styles.input}
                      placeholder="TG..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Aircraft ID</label>
                    <input
                      type="number"
                      name="aircraft_id"
                      value={advancedData.aircraft_id}
                      onChange={handleAdvancedInputChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Route ID</label>
                    <input
                      type="number"
                      name="route_id"
                      value={advancedData.route_id}
                      onChange={handleAdvancedInputChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.dateTimeGroup}>
                    <div className={styles.formGroup}>
                      <label>Departure Time</label>
                      <input
                        type="datetime-local"
                        name="departure_time"
                        value={formatDateTimeForInput(advancedData.departure_time)}
                        onChange={handleAdvancedInputChange}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Arrival Time</label>
                      <input
                        type="datetime-local"
                        name="arrival_time"
                        value={formatDateTimeForInput(advancedData.arrival_time)}
                        onChange={handleAdvancedInputChange}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.buttonGroup}>
                <button type="button" className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        originalFlight={flight}
        updatedData={{
          ...basicData,
          ...(showAdvanced ? advancedData : {})
        }}
        isAdvancedEdit={isAdvancedEdit}
      />
    </>
  );
};

export default EditFlightModal; 