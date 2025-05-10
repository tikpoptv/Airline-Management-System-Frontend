import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { getAirportById } from '../../../services/airportService';
import { Airport } from '../../../types/airport';
import AirportGlobeMap from './components/AirportGlobeMap/AirportGlobeMap';
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
            <button className="edit-btn-save">
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
            <AirportGlobeMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lon) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lon
                }));
              }}
            />
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
    </div>
  );
};

export default EditAirportPage; 