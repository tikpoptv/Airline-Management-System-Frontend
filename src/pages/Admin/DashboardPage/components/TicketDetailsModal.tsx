import React, { useState } from 'react';
import styles from './TicketDetailsModal.module.css';
import { IoMdClose } from 'react-icons/io';
import { BsTicket } from 'react-icons/bs';
import { FaUser, FaMoneyBillWave, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { 
//   BarChart, 
//   Bar, 
//   PieChart, 
//   Pie, 
//   LineChart, 
//   Line, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer,
//   Cell
// } from 'recharts';
import { usePaymentDashboard } from '../../../../hooks/usePaymentDashboard';
import { usePassengerDashboard } from '../../../../hooks/usePassengerDashboard';
import { PaymentData } from '../../../../services/paymentService';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface TicketDetailsModalProps {
  onClose: () => void;
  type: 'booking' | 'payment' | 'passenger';
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ onClose, type }) => {
  const { payments, stats: paymentStats } = usePaymentDashboard();
  const { 
    passengers, 
    stats: passengerStats, 
    loading: passengerLoading, 
    pagination,
    refetch: fetchPassengers 
  } = usePassengerDashboard();
  
  const [chartView, setChartView] = useState<'bar' | 'pie' | 'line'>('bar');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

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
        return 'Booking Details';
      case 'payment':
        return 'Payment Details';
      case 'passenger':
        return 'Passenger Details';
      default:
        return 'Details';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Create data for revenue charts
  const generateRevenueData = () => {
    // Data categorized by payment method
    return {
      byMethod: paymentStats.revenueByMethod,
      byStatus: [
        { name: 'Completed', value: paymentStats.completedPayments },
        { name: 'Pending', value: paymentStats.pendingPayments },
        { name: 'Failed', value: paymentStats.failedPayments },
        { name: 'Refunded', value: paymentStats.refundedPayments }
      ],
      daily: paymentStats.dailyRevenue
    };
  };

  // Data for booking charts
  const generateBookingData = () => {
    const byStatus = [
      { name: 'Completed', value: paymentStats.completedPayments },
      { name: 'Pending', value: paymentStats.pendingPayments },
      { name: 'Failed', value: paymentStats.failedPayments },
      { name: 'Refunded', value: paymentStats.refundedPayments }
    ];

    return {
      byStatus,
      daily: paymentStats.dailyRevenue.map(item => ({
        date: item.date,
        bookings: Math.round(item.revenue / 3500) // Estimate bookings from revenue
      }))
    };
  };

  // Data for passenger charts
  const generatePassengerData = () => {
    // Use real passenger data from API
    return {
      total: passengerStats.totalPassengers,
      byNationality: passengerStats.byNationality,
      bySpecialRequests: passengerStats.bySpecialRequests,
      daily: passengerStats.dailyData
    };
  };

  // Handle page change for passenger table
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.totalPages)) {
      return;
    }
    setCurrentPage(newPage);
    fetchPassengers(newPage, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchPassengers(1, newPageSize);
  };

  // Select chart type
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

  // Display booking data
  const renderBookingChart = () => {
    const data = generateBookingData();
    
    if (chartView === 'pie') {
      return (
        <div className={styles.chartContainer}>
          <h3>Booking Status</h3>
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
              <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartView === 'line') {
      return (
        <div className={styles.chartContainer}>
          <h3>Daily Bookings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.daily}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return (
      <div className={styles.chartContainer}>
        <h3>Booking Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.byStatus}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
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

  // Display passenger data
  const renderPassengerChart = () => {
    const data = generatePassengerData();
    
    if (passengerLoading) {
      return <div className={styles.loading}>Loading passenger data...</div>;
    }
    
    if (chartView === 'pie') {
      return (
        <div className={styles.chartContainer}>
          <h3>Passenger Nationalities</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.byNationality}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.byNationality.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} people`, 'Passenger Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartView === 'line') {
      return (
        <div className={styles.chartContainer}>
          <h3>Daily Passenger Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.daily}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} people`, 'Passenger Count']} />
              <Legend />
              <Line type="monotone" dataKey="passengers" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return (
      <div className={styles.chartContainer}>
        <h3>Passenger Special Requests</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.bySpecialRequests}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} people`, 'Passenger Count']} />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d">
              {data.bySpecialRequests.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Display revenue data
  const renderRevenueChart = () => {
    const data = generateRevenueData();
    
    if (chartView === 'pie') {
      return (
        <div className={styles.chartContainer}>
          <h3>Revenue by Payment Method</h3>
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
              <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (chartView === 'line') {
      return (
        <div className={styles.chartContainer}>
          <h3>Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.daily}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    return (
      <div className={styles.chartContainer}>
        <h3>Revenue by Payment Method</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.byMethod}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" />
            <YAxis />
            <Tooltip formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']} />
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
        return 'Bookings';
      case 'payment':
        return 'Revenue';
      case 'passenger':
        return 'Passengers';
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

  // Render pagination for passenger table
  const renderPagination = () => {
    if (!pagination || type !== 'passenger') return null;
    
    return (
      <div className={styles.paginationContainer}>
        <div className={styles.pageSizeSelector}>
          <span>Show:</span>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className={styles.pagination}>
          <button 
            className={styles.pageButton} 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          
          <span className={styles.pageInfo}>
            Page {currentPage} of {pagination.totalPages}
            {pagination.total && <span className={styles.totalRecords}> (Total: {pagination.total})</span>}
          </span>
          
          <button 
            className={styles.pageButton} 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
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
              Bar Chart
            </button>
            <button 
              className={chartView === 'pie' ? styles.active : ''}
              onClick={() => setChartView('pie')}
            >
              Pie Chart
            </button>
            <button 
              className={chartView === 'line' ? styles.active : ''}
              onClick={() => setChartView('line')}
            >
              Line Chart
            </button>
          </div>
          
          {renderChart()}
          
          <div className={styles.tableContainer}>
            {type !== 'passenger' && <h3>{getChartTitle()} Table</h3>}
            
            {type === 'payment' && (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Payment Method</th>
                    <th>Amount (THB)</th>
                    <th>Payment Date</th>
                    <th>Status</th>
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
                    <th>Seat Number</th>
                    <th>Payment Status</th>
                    <th>Amount (THB)</th>
                    <th>Booking Date</th>
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
              <>
                {passengerLoading ? (
                  <div className={styles.loading}>Loading passenger data...</div>
                ) : (
                  <>
                    <div className={styles.tableHeader}>
                      <h3>{getChartTitle()} Table</h3>
                      {renderPagination()}
                    </div>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Passenger Name</th>
                          <th>Passport Number</th>
                          <th>Nationality</th>
                          <th>Special Requests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map(passenger => (
                          <tr key={passenger.passenger_id}>
                            <td>{passenger.passenger_id}</td>
                            <td>{passenger.name}</td>
                            <td>{passenger.passport_number}</td>
                            <td>{passenger.nationality}</td>
                            <td>{passenger.special_requests || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal; 