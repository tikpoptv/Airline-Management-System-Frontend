import { api } from '../../api';

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'crew' | 'maintenance';
}

interface CreateUserResponse {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    console.log('[DEBUG] Sending create user request with data:', {
      ...data,
      password: '***' // ไม่แสดง password ใน log
    });
    
    const response = await api.post('/api/users', data);
    console.log('[DEBUG] Raw API response:', response);
    
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from server');
    }

    // ตรวจสอบว่า response มี properties ที่จำเป็นครบถ้วน
    const { user_id, username, email, role } = response;
    if (!user_id || !username || !email || !role) {
      console.error('[DEBUG] Invalid response structure:', response);
      throw new Error('Missing required fields in server response');
    }

    const userResponse: CreateUserResponse = { user_id, username, email, role };
    console.log('[DEBUG] Parsed user response:', userResponse);
    
    return userResponse;
  } catch (error) {
    console.error('[DEBUG] Error in createUser:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create user');
  }
}; 