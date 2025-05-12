import { useState, useEffect, useMemo } from 'react';
import { 
  getPayments, 
  filterPaymentsByStatus, 
  calculateDailyRevenue, 
  calculateRevenueByPaymentMethod, 
  calculateTotalRevenue,
  PaymentData
} from '../services/paymentService';

interface PaymentStats {
  totalBookings: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRevenue: number;
  dailyRevenue: { date: string; revenue: number }[];
  revenueByMethod: { method: string; amount: number }[];
}

export const usePaymentDashboard = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // สถิติที่คำนวณจากข้อมูลการชำระเงิน
  const stats = useMemo<PaymentStats>(() => {
    if (!payments.length) {
      return {
        totalBookings: 0,
        completedPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        totalRevenue: 0,
        dailyRevenue: [],
        revenueByMethod: []
      };
    }

    // กรองข้อมูลตามสถานะ
    const completed = filterPaymentsByStatus(payments, 'Completed');
    const pending = filterPaymentsByStatus(payments, 'Pending');
    const failed = filterPaymentsByStatus(payments, 'Failed');
    const refunded = filterPaymentsByStatus(payments, 'Refunded');

    // คำนวณสถิติต่างๆ
    const totalRevenue = calculateTotalRevenue(payments);
    const dailyRevenue = calculateDailyRevenue(payments, 7);
    const revenueByMethod = calculateRevenueByPaymentMethod(payments);

    return {
      totalBookings: payments.length,
      completedPayments: completed.length,
      pendingPayments: pending.length,
      failedPayments: failed.length,
      refundedPayments: refunded.length,
      totalRevenue,
      dailyRevenue,
      revenueByMethod
    };
  }, [payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, stats, loading, error, refetch: fetchPayments };
}; 