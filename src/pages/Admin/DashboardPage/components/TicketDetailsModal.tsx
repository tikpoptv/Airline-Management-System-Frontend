import React, { useState } from 'react';
import styles from './TicketDetailsModal.module.css';
import { IoMdClose } from 'react-icons/io';
import { BsTicket } from 'react-icons/bs';
import { FaUser, FaMoneyBillWave } from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { usePaymentDashboard } from '../../../../hooks/usePaymentDashboard';
import { PaymentData } from '../../../../services/paymentService';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

interface TicketDetailsModalProps {
  onClose: () => void;
  type: 'booking' | 'payment' | 'passenger';
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ onClose, type }) => {
  const { payments, stats } = usePaymentDashboard();
  const [chartView, setChartView] = useState<'bar' | 'pie' | 'line'>('bar');

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Booked':
        return styles.booked;
      case 'Cancelled':
        return styles.cancelled;
      case 'Used':
        return styles.used;
      case 'Pending':
        return styles.pending;
      case 'Checked-in':
        return styles.checkedIn;
      case 'Completed':
        return styles.completed;
      case 'Failed':
        return styles.failed;
      case 'Refunded':
        return styles.refunded;
      default:
        return '';
    }
  };

  const renderTitle = () => {
    switch (type) {
      case 'booking':
        return 'รายละเอียดการจองตั๋ว';
      case 'payment':
        return 'รายละเอียดการชำระเงิน';
      case 'passenger':
        return 'รายละเอียดผู้โดยสาร';
      default:
        return 'รายละเอียด';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // สร้างข้อมูลสำหรับกราฟรายได้
  const generateRevenueData = () => {
    // สร้างข้อมูลจำแนกตามวิธีการชำระเงิน
    return {
      byMethod: stats.revenueByMethod,
      byStatus: [
        { name: 'Completed', value: stats.completedPayments },
        { name: 'Pending', value: stats.pendingPayments },
        { name: 'Failed', value: stats.failedPayments },
        { name: 'Refunded', value: stats.refundedPayments }
      ],
      daily: stats.dailyRevenue
    };
  };

  // ข้อมูลสำหรับกราฟการจอง
  const generateBookingData = () => {
    const byStatus = [
      { name: 'Completed', value: stats.completedPayments },
      { name: 'Pending', value: stats.pendingPayments },
      { name: 'Failed', value: stats.failedPayments },
      { name: 'Refunded', value: stats.refundedPayments }
    ];

    return {
      byStatus,
      daily: stats.dailyRevenue.map(item => ({
        date: item.date,
        bookings: Math.round(item.revenue / 3500) // ประมาณจำนวนการจองจากรายได้
      }))
    };
  };

  // ข้อมูลสำหรับกราฟผู้โดยสาร
  const generatePassengerData = () => {
    // เนื่องจากไม่มีข้อมูลผู้โดยสารโดยตรง เราจะสร้างข้อมูลจากการชำระเงิน
    return {
      total: stats.completedPayments,
      daily: stats.dailyRevenue.map(item => ({
        date: item.date,
        passengers: Math.round(item.revenue / 3500) // ประมาณจำนวนผู้โดยสารจากรายได้
      }))
    };
  };

  // เลือกชนิดของกราฟ
  const renderChart = () => {
    switch (type) {
      case 'booking':
        return renderBookingChart();
      case 'payment':
        return renderRevenueChart();
      case 'passenger':
        return renderPassengerChart();
      default:
        return null;
    }
  };

  // แสดงข้อมูลการจอง
  const renderBookingChart = () => {
    const data = generateBookingData();
    
    if (chartView === 'pie') {
      return (
        <div className={styles.chartContainer}>
          <h3>สถานะการจอง</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.byStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} การจอง`, 'จำนวน']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartView === 'line') {
      return (
        <div className={styles.chartContainer}>
          <h3>จำนวนการจองรายวัน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.daily}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} การจอง`, 'จำนวน']} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return (
      <div className={styles.chartContainer}>
        <h3>สถานะการจอง</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.byStatus}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} การจอง`, 'จำนวน']} />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {data.byStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // แสดงข้อมูลผู้โดยสาร
  const renderPassengerChart = () => {
    const data = generatePassengerData();
    
    if (chartView === 'line') {
      return (
        <div className={styles.chartContainer}>
          <h3>จำนวนผู้โดยสารรายวัน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.daily}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} คน`, 'จำนวนผู้โดยสาร']} />
              <Legend />
              <Line type="monotone" dataKey="passengers" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return (
      <div className={styles.chartContainer}>
        <h3>ผู้โดยสารทั้งหมด: {data.total} คน</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.daily}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} คน`, 'จำนวนผู้โดยสาร']} />
            <Legend />
            <Bar dataKey="passengers" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // แสดงข้อมูลรายได้
  const renderRevenueChart = () => {
    const data = generateRevenueData();
    
    if (chartView === 'pie') {
      return (
        <div className={styles.chartContainer}>
          <h3>รายได้ตามวิธีการชำระเงิน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byMethod}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
                nameKey="method"
                label={({ method, percent }) => `${method}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.byMethod.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'รายได้']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartView === 'line') {
      return (
        <div className={styles.chartContainer}>
          <h3>รายได้รายวัน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.daily}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'รายได้']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return (
      <div className={styles.chartContainer}>
        <h3>รายได้ตามวิธีการชำระเงิน</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.byMethod}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" />
            <YAxis />
            <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'รายได้']} />
            <Legend />
            <Bar dataKey="amount" fill="#f59e0b">
              {data.byMethod.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const getChartTitle = () => {
    switch (type) {
      case 'booking':
        return 'การจองตั๋ว';
      case 'payment':
        return 'รายได้';
      case 'passenger':
        return 'ผู้โดยสาร';
      default:
        return '';
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'booking':
        return <BsTicket />;
      case 'payment':
        return <FaMoneyBillWave />;
      case 'passenger':
        return <FaUser />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            {getChartIcon()}
            <h2>{renderTitle()}</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <IoMdClose />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.chartTypeSelector}>
            <button 
              className={chartView === 'bar' ? styles.active : ''}
              onClick={() => setChartView('bar')}
            >
              แผนภูมิแท่ง
            </button>
            <button 
              className={chartView === 'pie' ? styles.active : ''}
              onClick={() => setChartView('pie')}
            >
              แผนภูมิวงกลม
            </button>
            <button 
              className={chartView === 'line' ? styles.active : ''}
              onClick={() => setChartView('line')}
            >
              แผนภูมิเส้น
            </button>
          </div>
          
          {renderChart()}
          
          <div className={styles.tableContainer}>
            <h3>ตาราง{getChartTitle()}</h3>
            
            {type === 'payment' && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>วิธีการชำระเงิน</th>
                    <th>จำนวนเงิน (บาท)</th>
                    <th>วันที่ชำระเงิน</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 10).map((payment: PaymentData) => (
                    <tr key={payment.payment_id}>
                      <td>{payment.payment_id}</td>
                      <td>{payment.payment_method}</td>
                      <td className={styles.amountCell}>฿{payment.amount.toLocaleString()}</td>
                      <td>{formatDate(payment.payment_date)}</td>
                      <td>
                        <span className={getStatusClass(payment.payment_status)}>
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {type === 'booking' && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>เลขที่นั่ง</th>
                    <th>สถานะการชำระเงิน</th>
                    <th>จำนวนเงิน (บาท)</th>
                    <th>วันที่จอง</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 10).map((payment: PaymentData) => (
                    <tr key={payment.ticket_id}>
                      <td>{payment.ticket_id}</td>
                      <td>{payment.ticket?.seat_number || '-'}</td>
                      <td>
                        <span className={getStatusClass(payment.payment_status)}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className={styles.amountCell}>฿{payment.amount.toLocaleString()}</td>
                      <td>{formatDate(payment.payment_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {type === 'passenger' && (
              <div className={styles.noDataMessage}>
                ข้อมูลผู้โดยสารที่เชื่อมโยงกับการชำระเงิน
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal; 