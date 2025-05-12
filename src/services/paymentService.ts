import { api } from '../api';

export interface Ticket {
  ticket_id: number;
  seat_number: string;
  ticket_status: string;
  check_in_status: string;
  flight_id: number;
  passenger_id: number;
}

export interface PaymentData {
  payment_id: number;
  ticket_id: number;
  payment_method: string;
  amount: number;
  payment_date: string;
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  transaction_id: string | null;
  ticket?: Ticket;
}

/**
 * Fetch all payment records from the system
 * Endpoint: GET /api/payments
 * Access: admin, finance, maintenance
 */
export const getPayments = async (): Promise<PaymentData[]> => {
  return api.get('/api/payments');
};

/**
 * Filter payment data by status
 * @param payments All payment records
 * @param status Status to filter by (Pending, Completed, Failed, Refunded)
 * @returns Payment records with the specified status
 */
export const filterPaymentsByStatus = (payments: PaymentData[], status: string): PaymentData[] => {
  return payments.filter(payment => payment.payment_status === status);
};

/**
 * Filter payment data by date range
 * @param payments All payment records
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Payment records within the specified date range
 */
export const filterPaymentsByDate = (payments: PaymentData[], startDate: string, endDate: string): PaymentData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Set time to end of day

  return payments.filter(payment => {
    const paymentDate = new Date(payment.payment_date);
    return paymentDate >= start && paymentDate <= end;
  });
};

/**
 * Calculate daily revenue
 * @param payments All payment records
 * @param days Number of days to look back (default: 7 days)
 * @returns Daily revenue data
 */
export const calculateDailyRevenue = (payments: PaymentData[], days: number = 7): { date: string; revenue: number }[] => {
  const result: { [date: string]: number } = {};
  
  // Create dates for the past 'days' days
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = 0;
  }
  
  // Filter only Completed payments
  const completedPayments = payments.filter(payment => payment.payment_status === 'Completed');
  
  // Calculate daily revenue
  completedPayments.forEach(payment => {
    const dateStr = new Date(payment.payment_date).toISOString().split('T')[0];
    if (result[dateStr] !== undefined) {
      result[dateStr] += payment.amount;
    }
  });
  
  // Convert to array of { date, revenue }
  return Object.entries(result)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculate revenue by payment method
 * @param payments All payment records
 * @returns Revenue data by payment method
 */
export const calculateRevenueByPaymentMethod = (payments: PaymentData[]): { method: string; amount: number }[] => {
  const result: { [method: string]: number } = {};
  
  // Filter only Completed payments
  const completedPayments = payments.filter(payment => payment.payment_status === 'Completed');
  
  // Calculate revenue by payment method
  completedPayments.forEach(payment => {
    if (!result[payment.payment_method]) {
      result[payment.payment_method] = 0;
    }
    result[payment.payment_method] += payment.amount;
  });
  
  // Convert to array of { method, amount }
  return Object.entries(result)
    .map(([method, amount]) => ({ method, amount }));
};

/**
 * Calculate total revenue from all payments
 * @param payments All payment records
 * @returns Total revenue
 */
export const calculateTotalRevenue = (payments: PaymentData[]): number => {
  // Filter only Completed payments
  return payments
    .filter(payment => payment.payment_status === 'Completed')
    .reduce((total, payment) => total + payment.amount, 0);
}; 