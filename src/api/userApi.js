import api from './api';

// Alias instance theo đúng format bạn muốn (userAPI)
const userAPI = api;

/**
 * Lấy thông tin profile của user hiện tại
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const getProfile = async () => {
  try {
    const response = await userAPI.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error.response?.data || {
      message:
        error?.message ||
        'Không thể tải thông tin profile',
    };
  }
};

/**
 * Cập nhật thông tin profile
 * @param {object} profileData - Dữ liệu profile cần cập nhật (fullName, phone, gender, dob, avatar)
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await userAPI.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error.response?.data || {
      message:
        error?.message ||
        'Không thể cập nhật thông tin profile',
    };
  }
};


// Lấy danh sách tất cả users
export const getAllUsers = async () => {
  try {
    console.log('Fetching users from: /users/getAllUsers');
    const response = await userAPI.get('/users/getAllUsers');
    console.log('Users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Lấy danh sách CLB user đã tham gia
 * @param {string} userId
 * @returns {Promise<{success: boolean, data?: object, message?: string}>}
 */
export const getUserClubs = async (userId) => {
  try {
    const response = await userAPI.get(`/users/${userId}/clubs`);
    return response.data;
  } catch (error) {
    console.error('Get user clubs error:', error);
    throw error.response?.data || {
      message: error?.message || 'Không thể tải danh sách câu lạc bộ',
    };
  }
};

