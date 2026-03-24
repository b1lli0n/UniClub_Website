import api from './api';

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

export const getMyBadges = async (clubId) => {
  try {
    const response = await api.get('/points/badges/me', {
      params: { clubId },
    });
    return response.data;
  } catch (error) {
    console.error('Get my badges error:', error);
    throw (
      error.response?.data || {
        message: error.message || 'Không thể tải huy hiệu của bạn',
      }
    );
  }
};

export const getPointRules = async (clubId) => {
  try {
    const response = await api.get('/points/rules', {
      params: { clubId },
    });
    return response.data;
  } catch (error) {
    console.error('Get point rules error:', error);
    throw (
      error.response?.data || {
        message: error.message || 'Không thể tải quy tắc tính điểm',
      }
    );
  }
};
