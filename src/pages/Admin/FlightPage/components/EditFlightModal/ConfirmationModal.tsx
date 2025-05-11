import React from 'react';
import styles from './ConfirmationModal.module.css';
import { Flight } from '../../types';
import { UpdateFlightBasicData, UpdateFlightAdvancedData } from '../../../../../services/flight/flightService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalFlight: Flight;
  updatedData: (UpdateFlightBasicData & Partial<UpdateFlightAdvancedData>) | (UpdateFlightAdvancedData & UpdateFlightBasicData);
  isAdvancedEdit: boolean;
}

type CompareValue = string | number | null | undefined;

interface CompareField {
  label: string;
  oldValue: CompareValue;
  newValue: CompareValue;
}

const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  originalFlight,
  updatedData,
  isAdvancedEdit
}) => {
  if (!isOpen) return null;

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangedFields = (): CompareField[] => {
    const changedFields: CompareField[] = [];

    // Check basic fields
    if (updatedData.flight_status !== originalFlight.flight_status) {
      changedFields.push({
        label: 'Status',
        oldValue: originalFlight.flight_status,
        newValue: updatedData.flight_status
      });
    }

    if (updatedData.cancellation_reason !== originalFlight.cancellation_reason) {
      changedFields.push({
        label: 'Cancellation Reason',
        oldValue: originalFlight.cancellation_reason,
        newValue: updatedData.cancellation_reason
      });
    }

    // Check advanced fields if in advanced mode
    if (isAdvancedEdit) {
      const advancedData = updatedData as UpdateFlightAdvancedData;

      if (advancedData.flight_number !== originalFlight.flight_number) {
        changedFields.push({
          label: 'Flight Number',
          oldValue: originalFlight.flight_number,
          newValue: advancedData.flight_number
        });
      }

      if (advancedData.aircraft_id !== originalFlight.aircraft.aircraft_id) {
        changedFields.push({
          label: 'Aircraft ID',
          oldValue: originalFlight.aircraft.aircraft_id,
          newValue: advancedData.aircraft_id
        });
      }

      if (advancedData.route_id !== originalFlight.route.route_id) {
        changedFields.push({
          label: 'Route ID',
          oldValue: originalFlight.route.route_id,
          newValue: advancedData.route_id
        });
      }

      if (advancedData.departure_time !== originalFlight.departure_time) {
        changedFields.push({
          label: 'Departure Time',
          oldValue: formatDateTime(originalFlight.departure_time),
          newValue: formatDateTime(advancedData.departure_time)
        });
      }

      if (advancedData.arrival_time !== originalFlight.arrival_time) {
        changedFields.push({
          label: 'Arrival Time',
          oldValue: formatDateTime(originalFlight.arrival_time),
          newValue: formatDateTime(advancedData.arrival_time)
        });
      }
    }

    return changedFields;
  };

  const changedFields = getChangedFields();

  if (changedFields.length === 0) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>No Changes Detected</h3>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          <p className={styles.noChangesMessage}>No changes have been made to the flight details.</p>
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Confirm Changes</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.compareTable}>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Current Value</th>
                <th>New Value</th>
              </tr>
            </thead>
            <tbody>
              {changedFields.map((field, index) => (
                <tr key={index} className={styles.changedRow}>
                  <td className={styles.labelCell}>{field.label}</td>
                  <td className={styles.valueCell}>{field.oldValue}</td>
                  <td className={styles.valueCell}>{field.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 