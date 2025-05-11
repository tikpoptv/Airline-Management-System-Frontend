import { ReactNode } from 'react';
import styles from './StatCard.module.css';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  trend?: number;
  status?: 'active' | 'warning' | 'error';
}

const StatCard = ({ icon, title, value, trend, status }: StatCardProps) => {
  return (
    <div className={`${styles.card} ${status ? styles[status] : ''}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {trend !== undefined && (
            <div className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
              {trend >= 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 