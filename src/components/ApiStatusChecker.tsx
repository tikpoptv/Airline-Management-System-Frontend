import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

const ApiStatusChecker = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_BASE_URL) {
      setError('Environment variable VITE_API_URL is not set.');
      return;
    }
    fetch(API_BASE_URL)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        const isBackendReachable =
          res.ok || (data && data.message === 'Not Found');

        if (!isBackendReachable) {
          throw new Error('Unexpected backend response');
        }
      })
      .catch(() => {
        setError(
          'We are currently unable to establish a connection with the server. Please verify your API configuration or ensure the backend system is operational.'
        );
      });
  }, []);

  if (!error) return null;

  return (
    <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2.5rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h3 style={{
            color: '#d32f2f',
            fontSize: '1.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span>🚫</span> <span>System Unavailable</span>
          </h3>
          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: '#333',
            marginBottom: '0.5rem'
          }}>
            We are currently unable to establish a connection with the server.<br />
            Please verify your API configuration or ensure the backend system is operational.
          </p>
        </div>
      </div>
      
  );
};

export default ApiStatusChecker;
