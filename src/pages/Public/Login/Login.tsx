import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api';
import { getToken, getUser } from '../../../services/authService';
import { getRouteByRole } from '../../../utils/roleRoutes';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      setAlreadyLoggedIn(true);
      const redirectPath = getRouteByRole(user.role);
      setTimeout(() => navigate(redirectPath), 3000);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setError('');
      const redirectPath = getRouteByRole(data.user.role);
      navigate(redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      {alreadyLoggedIn && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          padding: '1.5rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 0 12px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'orange' }}>⚠️ คุณยังอยู่ในระบบ</h3>
          <p>ระบบจะนำคุณไปยังหน้า Dashboard โดยอัตโนมัติ</p>
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
