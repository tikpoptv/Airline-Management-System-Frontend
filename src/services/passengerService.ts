import { api } from '../api';

export interface Passenger {
  passenger_id: number;
  name: string;
  passport_number: string;
  nationality: string;
  flight_id: number;
  special_requests: string | null;
  user_id: number;
}

export interface PassengersResponse {
  passengers: Passenger[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * ดึงข้อมูลผู้โดยสารทั้งหมดแบบแบ่งหน้า
 * @param page หมายเลขหน้าที่ต้องการดู (เริ่มต้นที่ 1)
 * @param pageSize จำนวนรายการต่อหน้า (เริ่มต้นที่ 10, สูงสุด 100)
 * @returns ข้อมูลผู้โดยสารและข้อมูลการแบ่งหน้า
 */
export const getPassengers = async (page: number = 1, pageSize: number = 10): Promise<PassengersResponse> => {
  return api.get(`/api/passengers?page=${page}&page_size=${pageSize}`);
};

/**
 * ดึงข้อมูลผู้โดยสารตาม ID
 * @param id ID ของผู้โดยสาร
 * @returns ข้อมูลผู้โดยสาร
 */
export const getPassengerById = async (id: number): Promise<Passenger> => {
  return api.get(`/api/passengers/${id}`);
};

/**
 * ดึงข้อมูลผู้โดยสารตามเที่ยวบิน
 * @param flightId ID ของเที่ยวบิน
 * @returns รายการผู้โดยสารในเที่ยวบิน
 */
export const getPassengersByFlight = async (flightId: number): Promise<Passenger[]> => {
  return api.get(`/api/flights/${flightId}/passengers`);
};

/**
 * จัดกลุ่มผู้โดยสารตามสัญชาติ
 * @param passengers รายการผู้โดยสาร
 * @returns ข้อมูลจำนวนผู้โดยสารตามสัญชาติ
 */
export const groupPassengersByNationality = (passengers: Passenger[]): { name: string; value: number }[] => {
  const nationalityCounts: Record<string, number> = {};
  
  passengers.forEach(passenger => {
    const nationality = passenger.nationality || 'Unknown';
    nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
  });
  
  return Object.entries(nationalityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * จัดกลุ่มผู้โดยสารตามความต้องการพิเศษ
 * @param passengers รายการผู้โดยสาร
 * @returns ข้อมูลจำนวนผู้โดยสารตามความต้องการพิเศษ
 */
export const groupPassengersBySpecialRequests = (passengers: Passenger[]): { name: string; value: number }[] => {
  const specialRequestCounts: Record<string, number> = {
    'None': 0
  };
  
  passengers.forEach(passenger => {
    if (!passenger.special_requests) {
      specialRequestCounts['None']++;
    } else {
      specialRequestCounts[passenger.special_requests] = 
        (specialRequestCounts[passenger.special_requests] || 0) + 1;
    }
  });
  
  return Object.entries(specialRequestCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}; 