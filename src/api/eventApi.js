import api from './api';

// Giữ style giống eventService cũ (return axios response)
const eventAPI = api;

const eventApi = {
  // Lấy danh sách sự kiện của câu lạc bộ
  getEvents: (clubId) => eventAPI.get(`/events/${clubId}/event`),

  // Lấy sự kiện đã tham gia
  getPastEvents: () => eventAPI.get('/events/past'),

  // Lấy sự kiện theo club
  getEventsByClub: (clubId, params) => eventAPI.get(`/events/club/${clubId}`, { params }),

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

  // Xem chi tiết sự kiện
  getEventById: (clubId, eventId) => eventAPI.get(`/events/club/${clubId}/event/${eventId}`),
};

export default eventApi;
