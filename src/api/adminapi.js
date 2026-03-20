// src/services/adminApi.js
import axios from 'axios'

// Base URL của backend
const API_BASE_URL = import.meta.env.VITE_API_URL_ADMIN || 'http://localhost:5000/api/admin'

// Tạo axios instance với config mặc định
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('user')
}

// Interceptor để thêm token (nếu có authentication)
axiosInstance.interceptors.request.use(
  (config) => {
    // Prefer unified token key, keep legacy fallback for old sessions.
    const token = localStorage.getItem('accessToken') || localStorage.getItem('adminToken')
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
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          clearAuthStorage()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        const refreshResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`, {
          refreshToken,
        })

        if (refreshResponse.data?.success) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('adminToken', accessToken)

          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken)
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        clearAuthStorage()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

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
  const statusMap = {
    pending: 0,
    active: 1,
    paused: 2,
    rejected: 3
  }

  const normalizedStatus = Number.isInteger(status)
    ? status
    : statusMap[String(status).toLowerCase()]

  if (![0, 1, 2, 3].includes(normalizedStatus)) {
    throw new Error('Trạng thái CLB không hợp lệ. Cho phép: 0 (pending), 1 (active), 2 (paused), 3 (rejected)')
  }

  return axiosInstance.put(`/clubs/${clubId}/status`, { status: normalizedStatus })
}

/**
 * Gán quyền quản lý cho thành viên
 */
export const assignManagementRole = async (clubId, userId, role) => {
  return axiosInstance.put(`/clubs/${clubId}/members/${userId}/assign-role`, { role })
}

export default axiosInstance