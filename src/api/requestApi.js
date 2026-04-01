import api from './api';

const requestAPI = api;

// Xem danh sách yêu cầu tham gia (của club hiện tại - dành cho leader/admin)
// Gửi thêm type và status dạng số (0/1/2/3)
export const getAllJoinRequestsOfClubs = async (clubId, { type, status, page = 1, limit = 10 } = {}) => {
  try {
    const params = {};
    if (typeof type !== 'undefined' && type !== '') params.type = Number(type);
    if (typeof status !== 'undefined' && status !== '') params.status = Number(status);
    params.page = page;
    params.limit = limit;
    const response = await requestAPI.get(`/requests/club/${clubId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

