// src/services/adminApi.js
import axios from 'axios'

// Base URL của backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin'

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor để thêm token (nếu có authentication)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor để xử lý response errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server trả về error response
      console.error('API Error:', error.response.data)
      return Promise.reject(error.response.data)
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network Error:', error.request)
      return Promise.reject({ message: 'Không thể kết nối đến server' })
    } else {
      // Lỗi khác
      console.error('Error:', error.message)
      return Promise.reject({ message: error.message })
    }
  }
)

// ==================== CLUB APIS ====================

/**
 * Lấy danh sách yêu cầu tạo CLB (pending)
 */
export const getClubCreationRequests = async (params = {}) => {
  const { page = 1, limit = 5, sortBy = 'createdAt', sortOrder = 'desc' } = params
  return axiosInstance.get('/clubs/creation-requests', {
    params: { page, limit, sortBy, sortOrder }
  })
}

/**
 * Lấy chi tiết yêu cầu tạo CLB
 */
export const getClubCreationRequestDetail = async (id) => {
  return axiosInstance.get(`/clubs/creation-requests/${id}`)
}

/**
 * Lấy danh sách tất cả CLB
 */
export const getClubs = async (params = {}) => {
  const { page = 1, limit = 10, status, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  // Interceptor returns response.data automatically
  return axiosInstance.get('/clubs/', {
    params: { page, limit, status, category, search, sortBy, sortOrder }
  });
};

/**
 * Lấy chi tiết CLB
 */
export const getClubDetail = async (id) => {
  return axiosInstance.get(`/clubs/${id}`)
}

/**
 * Lấy danh sách thành viên trong CLB
 */
export const getClubMembers = async (clubId, params = {}) => {
  const { page = 1, limit = 10, status, role, sortBy = 'joined_at', sortOrder = 'desc' } = params
  return axiosInstance.get(`/clubs/${clubId}/members`, {
    params: { page, limit, status, role, sortBy, sortOrder }
  })
}

/**
 * Cập nhật trạng thái CLB (Approve/Reject/Activate/Deactivate)
 */
export const updateClubStatus = async (clubId, status) => {
  console.log('API Calls - updateClubStatus:', { clubId, status, type: typeof status })
  return axiosInstance.put(`/clubs/${clubId}/status`, { status })
}

/**
 * Gán quyền quản lý cho thành viên
 */
export const assignManagementRole = async (clubId, userId, role) => {
  return axiosInstance.put(`/clubs/${clubId}/members/${userId}/assign-role`, { role })
}

export default axiosInstance