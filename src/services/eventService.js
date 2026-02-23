import axios from "axios";

const BASE_URL = "http://localhost:5000/api/events";

// Helper function để lấy headers với token
const getHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
        },
    };
};

const eventService = {
    // Lấy danh sách sự kiện của câu lạc bộ
    getEvents: (clubId) => axios.get(`${BASE_URL}/${clubId}/event`, getHeaders()),

    // Lấy sự kiện đã tham gia
    getPastEvents: () => axios.get(`${BASE_URL}/past`, getHeaders()),

    // Lấy sự kiện theo club
    getEventsByClub: (clubId, params) => axios.get(`${BASE_URL}/club/${clubId}`, { params, ...getHeaders() }),

    // Đăng ký tham gia sự kiện
    registerForEvent: (id, userId) => axios.post(`${BASE_URL}/${id}/register`, { userId }, getHeaders()),

    // Hủy đăng ký sự kiện
    cancelRegistration: (id, userId) => axios.delete(`${BASE_URL}/${id}/register`, { data: { userId }, ...getHeaders() }),

    // Check-in sự kiện
    checkInEvent: (id, email) => axios.post(`${BASE_URL}/${id}/check-in`, { email }, getHeaders()),

    // Xem feedbacks của sự kiện
    getFeedbacks: (clubId, eventId) => axios.get(`${BASE_URL}/club/${clubId}/event/${eventId}/feedback`, getHeaders()),

    // Gửi feedback (POST /api/events/:id/feedback body: { userId, rating, comment })
    submitFeedback: (id, payload) => axios.post(`${BASE_URL}/${id}/feedback`, payload, getHeaders()),

    // Xem chi tiết sự kiện
    getEventById: (clubId, eventId) => axios.get(`${BASE_URL}/club/${clubId}/event/${eventId}`, getHeaders()),
};

export default eventService;