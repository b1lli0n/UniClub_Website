import api from './api';

// Alias instance theo đúng format bạn muốn (clubAPI)
const clubAPI = api;

// Lấy danh sách tất cả clubs
export const getAllClubs = async (params = {}) => {
  try {
    const response = await clubAPI.get('/clubs', { params });
    return response.data;
  } catch (error) {
    console.error('Get all clubs error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách câu lạc bộ' };
  }
};

// Lấy thông tin chi tiết một club
export const getClubById = async (id) => {
  try {
    const response = await clubAPI.get(`/clubs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get club by id error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy thông tin câu lạc bộ' };
  }
};

// Lấy danh sách sự kiện của một club
export const getEventsByClub = async (clubId, params = {}) => {
  try {
    const response = await clubAPI.get(`/clubs/${clubId}/events`, { params });
    return response.data;
  } catch (error) {
    console.error('Get events by club error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách sự kiện của câu lạc bộ' };
  }
};

// Ví dụ thêm: tạo club mới theo đúng format mẫu
export const createClub = async (clubData) => {
  try {
    const response = await clubAPI.post('/clubs', clubData);
    return response.data;
  } catch (error) {
    console.error('Create club error:', error);
    throw error.response?.data || { message: error.message || 'Không thể tạo câu lạc bộ' };
  }
};

// Lấy danh sách join requests (pending memberships) của một club
export const getJoinRequests = async (clubId, params = {}) => {
  try {
    const response = await clubAPI.get(`/clubs/${clubId}/memberships`, { params });
    return response.data;
  } catch (error) {
    console.error('Get join requests error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách yêu cầu tham gia' };
  }
};

// Lấy danh sách thành viên của một club
export const getClubMembers = async (clubId, params = {}) => {
  try {
    const response = await clubAPI.get(`/clubs/${clubId}/memberships/members`, { params });
    return response.data;
  } catch (error) {
    console.error('Get club members error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách thành viên' };
  }
};

