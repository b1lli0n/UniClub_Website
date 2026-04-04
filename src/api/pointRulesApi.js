// ===== POINT RULES APIS =====
import api from './api';

const pointRulesAPI = api;

// Tạo quy tắc điểm mới
export const createPointRule = async (clubId, ruleData) => {
  try {
    const response = await pointRulesAPI.post(`/point-rules/club/${clubId}`, ruleData);
    return response.data;
  } catch (error) {
    console.error('Create point rule error:', error);
    throw error.response?.data || { message: error.message || 'Không thể tạo quy tắc điểm' };
  }
};

// Lấy danh sách quy tắc điểm của club
export const getPointRules = async (clubId) => {
  try {
    const response = await pointRulesAPI.get(`/point-rules/club/${clubId}/all`);
    return response.data;
  } catch (error) {
    console.error('Get point rules error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách quy tắc điểm' };
  }
};

// Lấy chi tiết quy tắc điểm
export const getPointRuleDetail = async (clubId, ruleId) => {
  try {
    const response = await pointRulesAPI.get(`/point-rules/club/${clubId}/${ruleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cập nhật quy tắc điểm
export const updatePointRule = async (clubId, ruleId, ruleData) => {
  try {
    const response = await pointRulesAPI.put(`/point-rules/club/${clubId}/${ruleId}`, ruleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Toggle trạng thái kích hoạt/vô hiệu của quy tắc điểm
export const togglePointRule = async (clubId, ruleId) => {
  try {
    const response = await pointRulesAPI.patch(`/point-rules/club/${clubId}/${ruleId}/toggle`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default pointRulesAPI;