import api from './api';

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
};
