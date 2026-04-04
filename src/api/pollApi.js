import api from './api';

<<<<<<< HEAD
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
=======
export const listPolls = async (clubId, params = {}, forLeader = false) => {
  const endpoint = forLeader ? `/clubs/${clubId}/polls/leader` : `/clubs/${clubId}/polls`;
  const response = await api.get(endpoint, { params });
  return response.data;
};

export const getPollDetail = async (clubId, pollId, forLeader = false) => {
  const endpoint = forLeader
    ? `/clubs/${clubId}/polls/leader/${pollId}`
    : `/clubs/${clubId}/polls/${pollId}`;
  const response = await api.get(endpoint);
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
  return response.data;
};

export const getPollResults = async (clubId, pollId) => {
  const response = await api.get(`/clubs/${clubId}/polls/${pollId}/results`);
  return response.data;
};

<<<<<<< HEAD
=======
export const createPoll = async (clubId, body) => {
  const response = await api.post(`/clubs/${clubId}/polls`, body);
  return response.data;
};

>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
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
<<<<<<< HEAD
=======
  console.log('votePoll response', response);
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
  return response.data;
};
