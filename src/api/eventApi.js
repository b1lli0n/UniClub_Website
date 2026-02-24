import api from './api';

// Giữ style giống eventService cũ (return axios response)
const eventAPI = api;

const eventApi = {
  // Lấy danh sách sự kiện của câu lạc bộ
  getEvents: (clubId) => eventAPI.get(`/events/${clubId}/event`),

  // Lấy sự kiện đã tham gia
  getPastEvents: () => eventAPI.get('/events/past'),

  // Lấy sự kiện theo club
  getEventsByClub: async (clubId, params = {}) => {
    // params: { q, category, sort, page, limit }
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/events/club/${clubId}?${queryString}`
      : `/events/club/${clubId}`;
    return await api.get(url);
  },

  // Đăng ký tham gia sự kiện
  registerForEvent: (id, userId) => eventAPI.post(`/events/${id}/register`, { userId }),

  // Hủy đăng ký sự kiện
  cancelRegistration: (id, userId) => eventAPI.delete(`/events/${id}/register`, { data: { userId } }),

  // Check-in sự kiện
  checkInEvent: (id, email) => eventAPI.post(`/events/${id}/check-in`, { email }),

  // Xem feedbacks của sự kiện (GET /api/events/:id/feedback)
  getFeedbacks: (id) => eventAPI.get(`/events/${id}/feedback`),

  // Gửi feedback (POST /api/events/:id/feedback body: { userId, rating, comment })
  submitFeedback: (id, payload) => eventAPI.post(`/events/${id}/feedback`, payload),

  // Cập nhật feedback (PUT /api/events/feedback/:feedbackId body: { rating, comments })
  updateFeedback: (feedbackId, payload) => eventAPI.put(`/events/feedback/${feedbackId}`, payload),

  // Xóa feedback (DELETE /api/events/feedback/:feedbackId)
  deleteFeedback: (feedbackId) => eventAPI.delete(`/events/feedback/${feedbackId}`),

  // Xem chi tiết sự kiện
  getEventById: (clubId, eventId) => eventAPI.get(`/events/club/${clubId}/event/${eventId}`),
};

export default eventApi;
