import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/users';

// Tạo instance axios
const userAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm token vào mỗi request
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy danh sách tất cả users
export const getAllUsers = async () => {
  try {
    console.log('Fetching users from: ' + API_BASE_URL + '/getAllUsers');
    const response = await userAPI.get('/getAllUsers');
    console.log('Users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error.response?.data || error.message;
  }
};

export default userAPI;
