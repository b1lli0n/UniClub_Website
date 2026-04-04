import api from './api';

/**
 * Lấy danh sách thông báo có phân trang và filter
 * @param {Object} params - { page, limit, status, search }
 */
export async function getNotifications(params = {}) {
  try {
    const { data } = await api.get('/notifications', {
      params
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
}

/**
 * Lấy số lượng thông báo chưa đọc (Dựa trên tổng số từ danh sách thông báo)
 */
export async function getUnreadCount() {
  try {
    // Gọi danh sách thông báo unread với limit 1 để lấy field total từ Backend
    const response = await getNotifications({ status: 'unread', limit: 1 });
    // Trả về total (tổng số record thỏa điều kiện filter)
    return response?.total || response?.data?.total || 0;
  } catch (error) {
    console.warn("getUnreadCount failed, calculating locally...");
    return 0;
  }
}

/**
 * Lấy chi tiết thông báo và đánh dấu đã đọc
 * @param {string} id - Notification ID
 */
export async function getNotificationDetail(id) {
  try {
    const { data } = await api.get(`/notifications/${id}/detail`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get notification detail');
  }
}

/**
 * Đánh dấu một thông báo đã đọc
 * @param {string} id - Notification ID
 */
export async function markAsRead(id) {
  try {
    const { data } = await api.patch(`/notifications/${id}/read`, {});
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark as read');
  }
}

/**
 * Đánh dấu tất cả hoặc một số thông báo đã đọc
 * @param {Array} ids - Mảng notification IDs (optional, nếu không truyền sẽ mark all)
 */
export async function markAllAsRead(ids = null) {
  try {
    const body = ids ? { ids } : {};
    const { data } = await api.patch('/notifications/read', body);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to mark all as read');
  }
}

/**
 * Xóa thông báo
 * @param {string} id - Notification ID
 */
export async function deleteNotification(id) {
  try {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
}

/**
 * Tạo và gửi thông báo tới người dùng
 * @param {Object} body - { title, content, displayName, receiverIds, receiverEmails }
 */
export async function createNotification(body) {
  try {
    const { data } = await api.post('/notifications', body);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create notification');
  }
}

/**
 * Tìm kiếm người dùng để gửi thông báo
 * @param {string} query - Search query (email hoặc tên)
 */
export async function searchUsers(query) {
  try {
    const { data } = await api.get('/notifications/search-users', {
      params: { q: query }
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search users');
  }
}



const notificationAPI = api;

/**
 * Notification API module
 * Provides methods to fetch notification history and mark notifications as read.
 */

/**
 * Fetch notification history for the current user
 * GET /api/clubs/:clubId/notifications
 * @param {string} clubId - Club ID (may be used by backend for filtering)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {boolean} params.unread - Filter unread only (true/false)
 * @returns {Promise<{items: Array, page: number, limit: number, total: number}>}
 */
export const fetchNotifications = async (clubId, params = {}) => {
    try {
        const response = await notificationAPI.get(`/clubs/${clubId}/notifications`, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        throw error.response?.data || { message: error.message || 'Không tải được thông báo' };
    }
};

/**
 * Mark a notification as read
 * PATCH /api/clubs/:clubId/notifications/:notificationId/read
 * @param {string} clubId - Club ID
 * @param {string} notificationId - User notification ID (_id field from notification item)
 * @returns {Promise<Object>} Updated notification object
 */
export const markNotificationAsRead = async (clubId, notificationId) => {
    try {
        const response = await notificationAPI.patch(
            `/clubs/${clubId}/notifications/${notificationId}/read`,
            {}
        );
        return response.data;
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error.response?.data || { message: error.message || 'Không thể đánh dấu đã đọc' };
    }
};

/**
 * Named exports for convenience
 */
export default {
  fetchNotifications,
  markNotificationAsRead,
  getNotifications,
  getUnreadCount,
  getNotificationDetail,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  searchUsers
};
