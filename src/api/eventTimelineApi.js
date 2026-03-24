// ===== EVENT TIMELINE APIS =====
import api from './api';

const eventTimelineAPI = api;

// Lấy danh sách timeline của event
export const getEventTimeline = async (eventId) => {
  try {
    const response = await eventTimelineAPI.get(`/events/${eventId}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Get event timeline error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy timeline sự kiện' };
  }
};

// Lấy timeline đang diễn ra
export const getCurrentEventTimeline = async (eventId) => {
  try {
    const response = await eventTimelineAPI.get(`/events/${eventId}/timeline/current`);
    return response.data;
  } catch (error) {
    console.error('Get current event timeline error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy timeline hiện tại' };
  }
};

// Lấy chi tiết timeline item
export const getTimelineItemDetail = async (eventId, timelineId) => {
  try {
    const response = await eventTimelineAPI.get(`/events/${eventId}/timeline/${timelineId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Tạo timeline mới
export const createTimelineItem = async (eventId, timelineData) => {
  try {
    const response = await eventTimelineAPI.post(`/events/${eventId}/timeline`, timelineData);
    return response.data;
  } catch (error) {
    console.error('Create timeline error:', error);
    throw error.response?.data || { message: error.message || 'Không thể tạo timeline' };
  }
};

// Cập nhật timeline
export const updateTimelineItem = async (timelineId, timelineData) => {
  try {
    const response = await eventTimelineAPI.put(`/events/timeline/${timelineId}`, timelineData);
    return response.data;
  } catch (error) {
    console.error('Update timeline error:', error);
    throw error.response?.data || { message: error.message || 'Không thể cập nhật timeline' };
  }
};

export default eventTimelineAPI;
