import api from './api';

const authAPI = api;

export const register = async (userData) => {
  try {
    const response = await authAPI.post('/auth/register', userData);

    if (response.data.success && response.data.data) {
      const data = response.data.data;
      if (!data.needVerify && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(data.user || {}));
      }
    }
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error.response?.data || { message: error.message || 'Đăng ký thất bại' };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await authAPI.post('/auth/verify-otp', { email, otp });
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(data.user || {}));
      }
    }
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error.response?.data || { message: error.message || 'Xác thực OTP thất bại' };
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await authAPI.post('/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error.response?.data || { message: error.message || 'Gửi lại mã thất bại' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await authAPI.post('/auth/login', credentials);

    if (response.data.success) {
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User logged in:', accessToken, user);
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    const backend = error.response?.data;
    if (backend) {
      throw backend;
    }
    throw { message: error.message || 'Đăng nhập thất bại' };
  }
};

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

export const forgotPassword = async (email) => {
  try {
    const response = await authAPI.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    const data = error.response?.data;
    throw data || { message: error.message || 'Gửi mã OTP thất bại' };
  }
};

export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  try {
    const response = await authAPI.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    const data = error.response?.data;
    throw data || { message: error.message || 'Đặt lại mật khẩu thất bại' };
  }
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await authAPI.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    const data = error.response?.data;
    throw data || { message: error.message || 'Đổi mật khẩu thất bại' };
  }
};

export const getMe = async () => {
  try {
    const response = await authAPI.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get me error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy thông tin user' };
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const authApi = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  isAuthenticated,
  getCurrentUser,
  getAccessToken,
};
