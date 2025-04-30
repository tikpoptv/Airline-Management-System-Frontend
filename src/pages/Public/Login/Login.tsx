import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api';
import { getToken, getUser } from '../../../services/auth/authService';
import { getRouteByRole } from '../../../utils/roleRoutes';
import styles from './Login.module.css';

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
  }, [navigate]);

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
    <div className={styles.loginContainer}>
      {alreadyLoggedIn && (
        <div className={styles.alreadyLoggedIn}>
          <h3 className={styles.warningTitle}>⚠️ คุณยังอยู่ในระบบ</h3>
          <p>ระบบจะนำคุณไปยังหน้า Dashboard โดยอัตโนมัติ</p>
        </div>
      )}

      <div className={styles.leftSection}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 className={styles.title}>
            Airline<br />
            Management<br />
            system
          </h1>
          <p className={styles.description}>
            Our company provides software services covering all aspects of airline management, from flight planning, aircraft management, crew, airports and maintenance.
          </p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Sign in</h2>
          {error && <p className={styles.error}>{error}</p>}
          
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input
                id="username"
                type="text"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Sign in
            </button>
          </form>

          <p className={styles.createAccount}>
            <a href="#" className={styles.createAccountLink}>Create an account ?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
