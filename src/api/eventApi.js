import api from './api';

// Giữ style giống eventService cũ (return axios response)
const eventAPI = api;

const eventApi = {
  // ===== MY CLUB - Lấy sự kiện theo câu lạc bộ cụ thể =====
  // GET /api/events/club/:clubId
  getEventsByClub: (clubId, params) => eventAPI.get(`/events/club/${clubId}`, { params }),

  // ===== MY EVENTS - Lấy sự kiện user đã đăng ký (bắt buộc token) =====
  // GET /api/events/my-events
  getMyEvents: (params) => eventAPI.get('/events/my-events', { params }),

  // Alias cũ (deprecated, giữ để tương thích code cũ)
  getEvents: (clubId) => eventAPI.get(`/events/club/${clubId}`),
  getPastEvents: () => eventAPI.get('/events/my-events', { params: { status: 'past' } }),

  // ===== EVENT REGISTRATION =====
  // Đăng ký tham gia sự kiện
  registerForEvent: (id, userId) => eventAPI.post(`/events/${id}/register`, { userId }),

  // Hủy đăng ký sự kiện
  cancelRegistration: (id, userId) => eventAPI.delete(`/events/${id}/register`, { data: { userId } }),

  // Check-in sự kiện
  checkInEvent: (id, email) => eventAPI.post(`/events/${id}/check-in`, { email }),

  // ===== FEEDBACK =====
  // Xem feedbacks của sự kiện
  getFeedbacks: (id) => eventAPI.get(`/events/${id}/feedback`),

  // Gửi feedback
  submitFeedback: (id, payload) => eventAPI.post(`/events/${id}/feedback`, payload),

  // ===== EVENT DETAIL =====
  // Xem chi tiết sự kiện (dùng endpoint club-specific)
  getEventById: (clubId, eventId) => eventAPI.get(`/events/club/${clubId}/event/${eventId}`),
};

export default eventApi;

// Named exports để tương thích các page đang import
export const {
  getEventsByClub,
  getMyEvents,
  getEvents,
  getPastEvents,
  registerForEvent,
  cancelRegistration,
  checkInEvent,
  getFeedbacks,
  submitFeedback,
  getEventById,
} = eventApi;