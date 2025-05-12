import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRouteById } from '../../../services/route/routeService';
import { Route } from '../../../types/route';
import GlobeMap, { Airport as MapAirport } from './components/GlobeMap/GlobeMap';
import './RouteDetailPage.css';

/* ---------- Local types ---------- */
interface ErrorState {
  message: string;
  code?: number;
}

const RouteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  /* ---------- fetch data ---------- */
  useEffect(() => {
    // IIFE with void to ensure `useEffect` callback returns `void`
    void (async () => {
      if (!id) {
        setError({ message: 'Route ID not found', code: 400 });
        setLoading(false);
        return;
      }

      try {
        const routeId = parseInt(id, 10);
        if (Number.isNaN(routeId)) {
          throw new Error('Invalid Route ID');
        }

        const routeData = await getRouteById(routeId);

        if (routeData) {
          setRoute(routeData);
        } else {
          setError({ message: 'Route data not found', code: 404 });
        }
      } catch (err) {
        setError({
          message:
            err instanceof Error
              ? err.message
              : 'Could not load route data',
          code: 500
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- helpers ---------- */
  const handleBack = (): void => {
    navigate('/admin/pathways/routes');
  };

  const formatDuration = (duration: string): string => {
    const [h, m] = duration.split(':');
    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    let result = '';
    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return result.trim() || '0 minutes';
  };

  const formatDistance = (d: number): string =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(d);

  /* ---------- render states ---------- */
  if (loading) {
    return (
      <div className="route-detail-loading">
        <div className="route-detail-loading__spinner" />
        <div className="route-detail-loading__text">
          Loading route details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="route-detail-error">
        <div className="route-detail-error__icon">⚠️</div>
        <div className="route-detail-error__message">{error.message}</div>
        <button className="route-detail-error__button" onClick={handleBack}>
          Back to Routes List
        </button>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="route-detail-error">
        <div className="route-detail-error__icon">🔍</div>
        <div className="route-detail-error__message">
          Route data not found
        </div>
        <button className="route-detail-error__button" onClick={handleBack}>
          Back to Routes List
        </button>
      </div>
    );
  }

  /* ---------- adapt data for GlobeMap ---------- */
  const fromAirportMapped: MapAirport = {
    iata_code: route.from_airport.iata_code,
    name: route.from_airport.name,
    lat: route.from_airport.latitude,
    lon: route.from_airport.longitude,
    city: route.from_airport.city,
    country: route.from_airport.country
  };
  const toAirportMapped: MapAirport = {
    iata_code: route.to_airport.iata_code,
    name: route.to_airport.name,
    lat: route.to_airport.latitude,
    lon: route.to_airport.longitude,
    city: route.to_airport.city,
    country: route.to_airport.country
  };

  /* ---------- main render ---------- */
  return (
    <div className="route-detail">
      {/* ===== Header ===== */}
      <div className="route-detail__header">
        <div className="route-detail__breadcrumb">
          <button className="route-detail__back-btn" onClick={handleBack}>
            ←
          </button>
          <span>Routes</span>
          <span className="route-detail__breadcrumb-separator">/</span>
          <span>Details</span>
        </div>

        <div className="route-detail__title">
          <h1>Route #{route.route_id}</h1>
          <div
            className={`route-detail__status route-detail__status--${route.status.toLowerCase()}`}
          >
            {route.status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="route-detail__container">
        {/* --- Map --- */}
        <div className="route-detail__map">
          <GlobeMap
            fromAirport={fromAirportMapped}
            toAirport={toAirportMapped}
          />
        </div>

        {/* --- Info panel --- */}
        <div className="route-detail__info-container">
          <div className="route-detail__airports">
            {/* From */}
            <div className="route-detail__airport route-detail__airport--from">
              <div className="route-detail__airport-code">
                {route.from_airport.iata_code}
              </div>
              <div className="route-detail__airport-details">
                <div className="route-detail__airport-name">
                  {route.from_airport.name}
                </div>
                <div className="route-detail__airport-location">
                  <span>{route.from_airport.city}</span>
                  <span className="route-detail__airport-separator">•</span>
                  <span>{route.from_airport.country}</span>
                </div>
                <div className="route-detail__airport-timezone">
                  Timezone: {route.from_airport.timezone}
                </div>
                <div className="route-detail__airport-coordinates">
                  Coordinates: {route.from_airport.latitude.toFixed(4)}, {route.from_airport.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Flight info (floating) */}
            <div className="route-detail__flight-info route-detail__flight-info--floating">
              <div className="route-detail__flight-icon">✈️</div>
              <div className="route-detail__duration">
                <div className="route-detail__info-label">Duration</div>
                <div className="route-detail__info-value">
                  {formatDuration(route.estimated_duration)}
                </div>
              </div>
              <div className="route-detail__distance">
                <div className="route-detail__info-label">Distance</div>
                <div className="route-detail__info-value">
                  {formatDistance(route.distance)} km
                </div>
              </div>
            </div>

            {/* To */}
            <div className="route-detail__airport route-detail__airport--to">
              <div className="route-detail__airport-code">
                {route.to_airport.iata_code}
              </div>
              <div className="route-detail__airport-details">
                <div className="route-detail__airport-name">
                  {route.to_airport.name}
                </div>
                <div className="route-detail__airport-location">
                  <span>{route.to_airport.city}</span>
                  <span className="route-detail__airport-separator">•</span>
                  <span>{route.to_airport.country}</span>
                </div>
                <div className="route-detail__airport-timezone">
                  Timezone: {route.to_airport.timezone}
                </div>
                <div className="route-detail__airport-coordinates">
                  Coordinates: {route.to_airport.latitude.toFixed(4)}, {route.to_airport.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailPage;
