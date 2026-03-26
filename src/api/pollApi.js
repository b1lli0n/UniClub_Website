import api from './api';

export const listPolls = async (clubId, params = {}) => {
  const response = await api.get(`/clubs/${clubId}/polls`, { params });
  return response.data;
};

export const createPoll = async (clubId, body) => {
  const response = await api.post(`/clubs/${clubId}/polls`, body);
  return response.data;
};

export const getPollDetail = async (clubId, pollId) => {
  const response = await api.get(`/clubs/${clubId}/polls/${pollId}`);
  return response.data;
};

export const getPollResults = async (clubId, pollId) => {
  const response = await api.get(`/clubs/${clubId}/polls/${pollId}/results`);
  return response.data;
};

export const updatePoll = async (clubId, pollId, body) => {
  const response = await api.patch(`/clubs/${clubId}/polls/${pollId}`, body);
  return response.data;
};

export const closePoll = async (clubId, pollId) => {
  const response = await api.patch(`/clubs/${clubId}/polls/${pollId}/close`);
  return response.data;
};

export const votePoll = async (clubId, pollId, optionIds) => {
  const response = await api.post(`/clubs/${clubId}/polls/${pollId}/vote`, {
    option_ids: optionIds,
  });
  return response.data;
};
