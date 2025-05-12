import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronRight, FaPlane, FaClock } from 'react-icons/fa';
import styles from './AddFlightPage.module.css';
import { flightService } from '../../../../services/flight/flightService';
import { Toast, ToastType } from '../../../../components/Toast/Toast';

interface FormData {
  flight_number: string;
  aircraft_id: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  flight_status: string;
}

interface FormErrors {
  [key: string]: string;
}

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flightData: FormData;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, flightData }) => {
  if (!isOpen) return null;

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <FaPlane className={styles.modalHeaderIcon} />
          <h2>Confirm Flight Details</h2>
        </div>
        
        <div className={styles.modalBody}>
          <p>Please review the flight information before saving:</p>
          
          <div className={styles.confirmDetails}>
            <div className={styles.confirmDetailItem}>
              <span className={styles.confirmLabel}>Flight Number:</span>
              <span className={styles.confirmValue}>{flightData.flight_number}</span>
            </div>
            
            <div className={styles.confirmDetailItem}>
              <span className={styles.confirmLabel}>Status:</span>
              <span className={`${styles.confirmValue} ${styles[flightData.flight_status.toLowerCase()]}`}>
                {flightData.flight_status}
              </span>
            </div>

            <div className={styles.confirmDetailItem}>
              <span className={styles.confirmLabel}>Route ID:</span>
              <span className={styles.confirmValue}>{flightData.route_id}</span>
            </div>

            <div className={styles.confirmDetailItem}>
              <span className={styles.confirmLabel}>Aircraft ID:</span>
              <span className={styles.confirmValue}>{flightData.aircraft_id}</span>
            </div>

            <div className={styles.confirmDetailItem}>
              <span className={styles.confirmLabel}>Departure Time:</span>
              <span className={styles.confirmValue}>
                {formatDateTime(flightData.departure_time)}
              </span>
            </div>

            <div className={styles.confirmDetailItem}>
              <span className={styles.confirmLabel}>Arrival Time:</span>
              <span className={styles.confirmValue}>
                {formatDateTime(flightData.arrival_time)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            type="button" 
            className={styles.modalCancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button"
            className={styles.modalConfirmButton}
            onClick={onConfirm}
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AddFlightPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    flight_number: '',
    aircraft_id: '',
    route_id: '',
    departure_time: '',
    arrival_time: '',
    flight_status: 'Scheduled'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.flight_number.trim()) {
      newErrors.flight_number = 'Flight number is required';
    } else if (!/^[A-Z]{2}\d{3,4}$/.test(formData.flight_number)) {
      newErrors.flight_number = 'Invalid flight number format (e.g., TG101)';
    }

    if (!formData.aircraft_id.trim()) {
      newErrors.aircraft_id = 'Aircraft ID is required';
    }

    if (!formData.route_id.trim()) {
      newErrors.route_id = 'Route ID is required';
    }

    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required';
    }

    if (!formData.arrival_time) {
      newErrors.arrival_time = 'Arrival time is required';
    } else if (new Date(formData.arrival_time) <= new Date(formData.departure_time)) {
      newErrors.arrival_time = 'Arrival time must be after departure time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatDateTimeForAPI = (dateTime: string): string => {
    // Convert to ISO 8601 UTC format
    const date = new Date(dateTime);
    return date.toISOString();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      await flightService.createFlight({
        ...formData,
        aircraft_id: parseInt(formData.aircraft_id),
        route_id: parseInt(formData.route_id),
        departure_time: formatDateTimeForAPI(formData.departure_time),
        arrival_time: formatDateTimeForAPI(formData.arrival_time)
      });
      setToast({ message: 'Flight created successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/admin/flights');
      }, 2000);
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to create flight', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/flights');
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link to="/admin">Dashboard</Link>
        <FaChevronRight className={styles.breadcrumbSeparator} />
        <Link to="/admin/flights">Flights</Link>
        <FaChevronRight className={styles.breadcrumbSeparator} />
        <span>Add New Flight</span>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FaPlane className={styles.headerIcon} />
            <h1>Add New Flight</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2>Flight Information</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Flight Number
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="flight_number"
                  value={formData.flight_number}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.flight_number ? styles.inputError : ''}`}
                  placeholder="e.g., TG101"
                />
                {errors.flight_number && (
                  <span className={styles.errorText}>{errors.flight_number}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Status
                  <span className={styles.required}>*</span>
                </label>
                <select
                  name="flight_status"
                  value={formData.flight_status}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Route & Aircraft</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Route ID
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="route_id"
                  value={formData.route_id}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.route_id ? styles.inputError : ''}`}
                  placeholder="Enter route ID"
                />
                {errors.route_id && (
                  <span className={styles.errorText}>{errors.route_id}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Aircraft ID
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="aircraft_id"
                  value={formData.aircraft_id}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.aircraft_id ? styles.inputError : ''}`}
                  placeholder="Enter aircraft ID"
                />
                {errors.aircraft_id && (
                  <span className={styles.errorText}>{errors.aircraft_id}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Schedule</h2>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Departure Time
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.timeInputWrapper}>
                  <FaClock className={styles.timeIcon} />
                  <input
                    type="datetime-local"
                    name="departure_time"
                    value={formData.departure_time}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.departure_time ? styles.inputError : ''}`}
                  />
                </div>
                {errors.departure_time && (
                  <span className={styles.errorText}>{errors.departure_time}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Arrival Time
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.timeInputWrapper}>
                  <FaClock className={styles.timeIcon} />
                  <input
                    type="datetime-local"
                    name="arrival_time"
                    value={formData.arrival_time}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.arrival_time ? styles.inputError : ''}`}
                  />
                </div>
                {errors.arrival_time && (
                  <span className={styles.errorText}>{errors.arrival_time}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Flight...' : 'Create Flight'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedSubmit}
        flightData={formData}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AddFlightPage; 