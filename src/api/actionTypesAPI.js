import api from './api';

const actionTypesAPI = api;


// ===== ACTION TYPES APIS =====

// Lấy danh sách các loại hành động
export const getActionTypes = async () => {
  try {
    const response = await actionTypesAPI.get('/action-types/all');
    console.log('Fetched action types:', response.data);
    return response.data.actionTypes;
  } catch (error) {
    console.error('Get action types error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy danh sách loại hành động' };
  }
};

export default actionTypesAPI;