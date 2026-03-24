import api from './api';

const authAPI = api;

// Đăng ký tài khoản
export const register = async (userData) => {
  try {
    const response = await authAPI.post('/auth/register', userData);

    if (response.data.success) {
      const { user, accessToken, refreshToken } = response.data.data;

      // Lưu tokens và user vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error.response?.data || { message: error.message || 'Đăng ký thất bại' };
  }
};

// Đăng nhập
export const login = async (credentials) => {
  try {
    const response = await authAPI.post('/auth/login', credentials);

    if (response.data.success) {
      const { user, accessToken, refreshToken } = response.data.data;

      // Lưu tokens và user vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User logged in:', accessToken, user);
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    // Giữ lại message từ backend nếu có
    const backend = error.response?.data;
    if (backend) {
      throw backend;
    }
    throw { message: error.message || 'Đăng nhập thất bại' };
  }
};

// Đăng xuất
export const logout = async () => {
  try {
    const response = await authAPI.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Lấy thông tin user hiện tại
export const getMe = async () => {
  try {
    const response = await authAPI.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get me error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy thông tin user' };
  }
};

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Lấy user từ localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Lấy access token
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// API object nếu bạn thích dùng kiểu authApi.login(...)
export const authApi = {
  register,
  login,
  logout,
  getMe,
  isAuthenticated,
  getCurrentUser,
  getAccessToken,
};
