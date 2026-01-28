import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getClubCreationRequests = async (params = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    const response = await axios.get(`${API_URL}/clubs/creation-requests`, {
      params: { page, limit, sortBy, sortOrder }
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
