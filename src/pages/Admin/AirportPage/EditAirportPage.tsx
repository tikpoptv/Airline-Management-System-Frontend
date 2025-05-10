import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Snackbar,
  Alert,
  AlertTitle
} from '@mui/material';
import { getAirportById, updateAirport } from '../../../services/airportService';
import { Airport } from '../../../types/airport';
import GlobeMap, { Airport as GlobeAirport } from '../RoutePage/components/GlobeMap/GlobeMap';
import './EditAirportPage.css';

interface EditAirportFormData {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'active' | 'inactive';
}

const EditAirportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditAirportFormData>({
    name: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
    timezone: '',
    status: 'active'
  });

  // สร้าง state สำหรับ GlobeMap
  const [mapAirport, setMapAirport] = useState<GlobeAirport | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAirport = async () => {
      try {
        if (!id) throw new Error('No airport id');
        const data = await getAirportById(Number(id));
        if (!data) throw new Error('Airport not found');
        setAirport(data);
        setFormData({
          name: data.name,
          city: data.city,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          status: ('status' in data && typeof (data as { status?: string }).status === 'string') ? (data as { status: string }).status as 'active' | 'inactive' : 'active'
        });

        // Set map airport data
        setMapAirport({
          iata_code: data.iata_code,
          name: data.name,
          lat: data.latitude,
          lon: data.longitude,
          city: data.city,
          country: data.country
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchAirport();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value
    }));

    // Update map when coordinates change
    if ((name === 'latitude' || name === 'longitude') && mapAirport) {
      setMapAirport(prev => prev ? {
        ...prev,
        lat: name === 'latitude' ? parseFloat(value) : prev.lat,
        lon: name === 'longitude' ? parseFloat(value) : prev.lon
      } : null);
    }
  };

  const handleMapClick = (lat: number, lon: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon
    }));
    
    if (mapAirport) {
      setMapAirport(prev => prev ? {
        ...prev,
        lat: lat,
        lon: lon
      } : null);
    }
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (!airport || !id) return;
      await updateAirport(parseInt(id), formData);
      setShowConfirmDialog(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => {
          navigate('/admin/pathways/airport');
        }, 100);
      }, 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update airport';
      setErrorMessage(errorMsg);
      setShowConfirmDialog(false);
      setShowError(true);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  if (loading) return <div className="airport-detail-loading">Loading...</div>;
  if (error) return <div className="airport-detail-error">{error}</div>;
  if (!airport) return <div className="airport-detail-error">Airport not found</div>;

  return (
    <div className="airport-detail-page">
      {/* Header Section */}
      <div className="airport-detail-header">
        <div className="airport-detail-nav">
          <button className="airport-detail-back-btn" onClick={() => navigate('/admin/pathways/airport')}>
            <FaArrowLeft /> Back to Airport List
          </button>
          <div className="airport-detail-breadcrumb">
            <span>Airports</span>
            <span className="airport-detail-breadcrumb-separator">/</span>
            <span>Edit</span>
          </div>
        </div>
        <div className="airport-detail-title-section">
          <h1 className="airport-detail-title">
            <span className="airport-detail-name">{formData.name}</span>
            <span className="airport-detail-iata">({airport.iata_code})</span>
          </h1>
          <div className="airport-detail-actions">
            <button className="edit-btn-cancel" onClick={() => navigate(`/admin/pathways/airport/detail/${id}`)}>
              <FaTimes /> Cancel
            </button>
            <button className="edit-btn-save" onClick={handleSave}>
              <FaSave /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="airport-detail-content">
        {/* Basic Information Card */}
        <div className="airport-detail-card">
          <h2 className="airport-detail-card-title">Airport Information</h2>
          <div className="airport-detail-info-grid">
            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">Airport ID</div>
              <div className="airport-detail-info-value">{airport.airport_id}</div>
            </div>
            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">IATA Code</div>
              <div className="airport-detail-info-value highlight">{airport.iata_code}</div>
            </div>
            <div className="airport-detail-info-item">
              <label className="edit-label">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
            <div className="airport-detail-info-item">
              <label className="edit-label">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
            <div className="airport-detail-info-item full-width">
              <label className="edit-label">Airport Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
          </div>
        </div>

        {/* Location Card with Map */}
        <div className="airport-detail-card">
          <h2 className="airport-detail-card-title">Location</h2>
          <div className="airport-detail-map-section">
            {mapAirport && (
              <GlobeMap
                fromAirport={mapAirport}
                toAirport={mapAirport}
                onLocationClick={handleMapClick}
              />
            )}
            <div className="airport-detail-info-grid">
              <div className="airport-detail-info-item">
                <label className="edit-label">Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="edit-input"
                  step="any"
                />
              </div>
              <div className="airport-detail-info-item">
                <label className="edit-label">Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="edit-input"
                  step="any"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="airport-detail-card">
          <h2 className="airport-detail-card-title">Additional Information</h2>
          <div className="airport-detail-info-grid">
            <div className="airport-detail-info-item">
              <label className="edit-label">Time Zone</label>
              <input
                type="text"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
            <div className="airport-detail-info-item">
              <label className="edit-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="edit-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <div className="confirm-dialog-content">
            <p>Are you sure you want to save the following changes?</p>
            <div className="changes-list">
              {airport && (
                <>
                  {airport.name !== formData.name && (
                    <div className="change-item">
                      <span>Airport Name:</span>
                      <div className="change-details">
                        <div className="old-value">{airport.name}</div>
                        <div className="arrow">→</div>
                        <div className="new-value">{formData.name}</div>
                      </div>
                    </div>
                  )}
                  {airport.city !== formData.city && (
                    <div className="change-item">
                      <span>City:</span>
                      <div className="change-details">
                        <div className="old-value">{airport.city}</div>
                        <div className="arrow">→</div>
                        <div className="new-value">{formData.city}</div>
                      </div>
                    </div>
                  )}
                  {airport.country !== formData.country && (
                    <div className="change-item">
                      <span>Country:</span>
                      <div className="change-details">
                        <div className="old-value">{airport.country}</div>
                        <div className="arrow">→</div>
                        <div className="new-value">{formData.country}</div>
                      </div>
                    </div>
                  )}
                  {airport.latitude !== formData.latitude && (
                    <div className="change-item">
                      <span>Latitude:</span>
                      <div className="change-details">
                        <div className="old-value">{airport.latitude.toFixed(4)}°N</div>
                        <div className="arrow">→</div>
                        <div className="new-value">{formData.latitude.toFixed(4)}°N</div>
                      </div>
                    </div>
                  )}
                  {airport.longitude !== formData.longitude && (
                    <div className="change-item">
                      <span>Longitude:</span>
                      <div className="change-details">
                        <div className="old-value">{airport.longitude.toFixed(4)}°E</div>
                        <div className="arrow">→</div>
                        <div className="new-value">{formData.longitude.toFixed(4)}°E</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleCloseSuccess}
        sx={{
          zIndex: 9999,
          '& .MuiSnackbarContent-root': {
            width: '100%',
            minWidth: '400px'
          }
        }}
      >
        <Alert 
          severity="success"
          variant="filled"
          onClose={handleCloseSuccess}
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-message': {
              fontSize: '16px',
              fontWeight: 500
            },
            '& .MuiAlert-icon': {
              fontSize: '24px'
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Success!</AlertTitle>
          Changes saved successfully. Redirecting to airport list...
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={showError}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleCloseError}
        sx={{
          zIndex: 9999,
          '& .MuiSnackbarContent-root': {
            width: '100%',
            minWidth: '400px'
          }
        }}
      >
        <Alert 
          severity="error"
          variant="filled"
          onClose={handleCloseError}
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-message': {
              fontSize: '16px',
              fontWeight: 500
            },
            '& .MuiAlert-icon': {
              fontSize: '24px'
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Error!</AlertTitle>
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditAirportPage; 