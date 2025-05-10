import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPen, FaMapMarkerAlt, FaGlobeAsia, FaClock, FaPlane, FaCircle } from 'react-icons/fa';
import moment from 'moment-timezone';
import './AirportDetailPage.css';
import { getAirportById } from '../../../services/airportService';
import { countRoutesByAirportId } from '../../../services/route/routeService';
import { Airport } from '../../../types/airport';
import GlobeMap, { Airport as GlobeAirport } from '../RoutePage/components/GlobeMap/GlobeMap';

const AirportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [routeCount, setRouteCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapAirport, setMapAirport] = useState<GlobeAirport | null>(null);

  const getGMTOffset = (timezone: string) => {
    const offset = moment.tz(timezone).format('Z');
    return `GMT${offset}`;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10B981' : '#EF4444';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const airportData = await getAirportById(parseInt(id));
        if (!airportData) {
          throw new Error('Airport not found');
        }
        setAirport(airportData);

        // Set map airport data
        setMapAirport({
          iata_code: airportData.iata_code,
          name: airportData.name,
          lat: airportData.latitude,
          lon: airportData.longitude,
          city: airportData.city,
          country: airportData.country
        });

        // Fetch route count
        const count = await countRoutesByAirportId(parseInt(id));
        setRouteCount(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch airport details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/pathways/airport');
  };

  const handleEdit = () => {
    if (airport) {
      navigate(`/admin/pathways/airport/edit/${airport.airport_id}`);
    }
  };

  if (loading) return <div className="airport-detail-loading">Loading...</div>;
  if (error) return <div className="airport-detail-error">{error}</div>;
  if (!airport) return <div className="airport-detail-error">Airport not found</div>;

  return (
    <div className="airport-detail-page">
      {/* Header Section */}
      <div className="airport-detail-header">
        <div className="airport-detail-nav">
          <button className="airport-detail-back-btn" onClick={handleBack}>
            <FaArrowLeft /> Back to Airport List
          </button>
          <div className="airport-detail-breadcrumb">
            <span>Airports</span>
            <span className="airport-detail-breadcrumb-separator">/</span>
            <span>Details</span>
          </div>
        </div>
        
        <div className="airport-detail-title-section">
          <div className="airport-detail-title-container">
            <h1 className="airport-detail-title">
              {airport.name}
              <span className="airport-detail-iata">({airport.iata_code})</span>
            </h1>
            <div 
              className="airport-detail-status"
              style={{ 
                backgroundColor: `${getStatusColor(airport.status)}15`,
                color: getStatusColor(airport.status),
                border: `1px solid ${getStatusColor(airport.status)}30`
              }}
            >
              <FaCircle size={8} />
              <span>{getStatusText(airport.status)}</span>
            </div>
          </div>
          <button className="airport-detail-edit-btn" onClick={handleEdit}>
            <FaPen /> Edit Airport
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="airport-detail-content">
        {/* Map Card */}
        <div className="airport-detail-card map-card">
          <h2 className="airport-detail-card-title">Location Map</h2>
          <div className="airport-detail-map-container">
            {mapAirport && (
              <GlobeMap
                fromAirport={mapAirport}
                toAirport={mapAirport}
              />
            )}
          </div>
        </div>

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
              <div className="airport-detail-info-label">
                <FaMapMarkerAlt className="airport-detail-icon" /> City
              </div>
              <div className="airport-detail-info-value">{airport.city}</div>
            </div>

            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">
                <FaGlobeAsia className="airport-detail-icon" /> Country
              </div>
              <div className="airport-detail-info-value">{airport.country}</div>
            </div>

            <div className="airport-detail-info-item full-width">
              <div className="airport-detail-info-label">Airport Name</div>
              <div className="airport-detail-info-value">{airport.name}</div>
            </div>

            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">Latitude</div>
              <div className="airport-detail-info-value">{airport.latitude}°</div>
            </div>

            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">Longitude</div>
              <div className="airport-detail-info-value">{airport.longitude}°</div>
            </div>

            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">
                <FaClock className="airport-detail-icon" /> Time Zone
              </div>
              <div className="airport-detail-info-value">{airport.timezone}</div>
            </div>

            <div className="airport-detail-info-item">
              <div className="airport-detail-info-label">Status</div>
              <div 
                className="airport-detail-info-value status-value"
                style={{ color: getStatusColor(airport.status) }}
              >
                <FaCircle size={8} style={{ marginRight: '6px' }} />
                {getStatusText(airport.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="airport-detail-card">
          <h2 className="airport-detail-card-title">Statistics</h2>
          <div className="airport-detail-stats-grid">
            <div className="airport-detail-stat-item">
              <FaPlane className="airport-detail-stat-icon" />
              <div className="airport-detail-stat-value">{routeCount}</div>
              <div className="airport-detail-stat-label">Active Routes</div>
            </div>

            <div className="airport-detail-stat-item">
              <FaClock className="airport-detail-stat-icon" />
              <div className="airport-detail-stat-value">{getGMTOffset(airport.timezone)}</div>
              <div className="airport-detail-stat-label">Time Zone</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirportDetailPage; 