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
 * ดึงรายการการชำระเงินทั้งหมดจากระบบ
 * Endpoint: GET /api/payments
 * Access: admin, finance, maintenance
 */
export const getPayments = async (): Promise<PaymentData[]> => {
  return api.get('/api/payments');
};

/**
 * กรองข้อมูลการชำระเงินตามสถานะ
 * @param payments รายการการชำระเงินทั้งหมด
 * @param status สถานะที่ต้องการกรอง (Pending, Completed, Failed, Refunded)
 * @returns รายการการชำระเงินที่มีสถานะตามที่ระบุ
 */
export const filterPaymentsByStatus = (payments: PaymentData[], status: string): PaymentData[] => {
  return payments.filter(payment => payment.payment_status === status);
};

/**
 * กรองข้อมูลการชำระเงินตามช่วงวันที่
 * @param payments รายการการชำระเงินทั้งหมด
 * @param startDate วันที่เริ่มต้น (YYYY-MM-DD)
 * @param endDate วันที่สิ้นสุด (YYYY-MM-DD)
 * @returns รายการการชำระเงินที่อยู่ในช่วงวันที่ที่ระบุ
 */
export const filterPaymentsByDate = (payments: PaymentData[], startDate: string, endDate: string): PaymentData[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // ตั้งเวลาเป็นสิ้นสุดของวัน

  return payments.filter(payment => {
    const paymentDate = new Date(payment.payment_date);
    return paymentDate >= start && paymentDate <= end;
  });
};

/**
 * คำนวณรายได้รายวัน
 * @param payments รายการการชำระเงินทั้งหมด
 * @param days จำนวนวันย้อนหลังที่ต้องการ (default: 7 วัน)
 * @returns ข้อมูลรายได้รายวัน
 */
export const calculateDailyRevenue = (payments: PaymentData[], days: number = 7): { date: string; revenue: number }[] => {
  const result: { [date: string]: number } = {};
  
  // สร้างวันที่ย้อนหลัง days วัน
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = 0;
  }
  
  // กรองเฉพาะรายการที่มีสถานะ Completed
  const completedPayments = payments.filter(payment => payment.payment_status === 'Completed');
  
  // คำนวณรายได้รายวัน
  completedPayments.forEach(payment => {
    const dateStr = new Date(payment.payment_date).toISOString().split('T')[0];
    if (result[dateStr] !== undefined) {
      result[dateStr] += payment.amount;
    }
  });
  
  // แปลงเป็น array ของ { date, revenue }
  return Object.entries(result)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * คำนวณรายได้แยกตามวิธีการชำระเงิน
 * @param payments รายการการชำระเงินทั้งหมด
 * @returns ข้อมูลรายได้แยกตามวิธีการชำระเงิน
 */
export const calculateRevenueByPaymentMethod = (payments: PaymentData[]): { method: string; amount: number }[] => {
  const result: { [method: string]: number } = {};
  
  // กรองเฉพาะรายการที่มีสถานะ Completed
  const completedPayments = payments.filter(payment => payment.payment_status === 'Completed');
  
  // คำนวณรายได้ตามวิธีการชำระเงิน
  completedPayments.forEach(payment => {
    if (!result[payment.payment_method]) {
      result[payment.payment_method] = 0;
    }
    result[payment.payment_method] += payment.amount;
  });
  
  // แปลงเป็น array ของ { method, amount }
  return Object.entries(result)
    .map(([method, amount]) => ({ method, amount }));
};

/**
 * คำนวณยอดรายได้รวมทั้งหมด
 * @param payments รายการการชำระเงินทั้งหมด
 * @returns ยอดรายได้รวม
 */
export const calculateTotalRevenue = (payments: PaymentData[]): number => {
  // กรองเฉพาะรายการที่มีสถานะ Completed
  return payments
    .filter(payment => payment.payment_status === 'Completed')
    .reduce((total, payment) => total + payment.amount, 0);
}; 