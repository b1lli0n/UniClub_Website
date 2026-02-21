import api from './api';

/**
 * Lấy lịch sử điểm thành tích (achievement points) theo club và tháng.
 * GET /api/points/history?clubId=xxx&month=yyyy-MM
 * Headers: Authorization Bearer + Content-Type application/json (tự gắn bởi api instance)
 *
 * @param {string} clubId - ID câu lạc bộ
 * @param {string} month - Tháng dạng yyyy-MM (vd: "2024-10")
 * @returns {Promise<{ success: boolean, data: object }>} response.data từ BE
 */
export const getPointsHistory = async (clubId, month) => {
  try {
    const response = await api.get('/points/history', {
      params: { clubId, month },
    });
    return response.data;
  } catch (error) {
    console.error('Get points history error:', error);
    throw (
      error.response?.data || {
        message: error.message || 'Không thể tải lịch sử điểm thành tích',
      }
    );
  }
};

/**
 * Lấy bảng xếp hạng (leaderboard) theo câu lạc bộ và tháng.
 * GET /api/points/leaderboard?clubId=xxx&month=yyyy-MM&limit=10
 * Headers: Authorization Bearer + Content-Type application/json (tự gắn bởi api instance)
 *
 * @param {string} clubId - ID câu lạc bộ
 * @param {string} month - Tháng dạng yyyy-MM (vd: "2024-10")
 * @param {number} [limit=10] - Số lượng top thành viên muốn lấy
 * @returns {Promise<{ success: boolean, data: { clubId, month, limit, items: Array } }>}
 */
export const getMonthlyLeaderboard = async (clubId, month, limit = 10) => {
  try {
    const response = await api.get('/points/leaderboard', {
      params: {
        clubId,
        month,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    throw (
      error.response?.data || {
        message: error.message || 'Không thể tải bảng xếp hạng theo tháng',
      }
    );
  }
};
