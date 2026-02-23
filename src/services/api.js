import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false
});

// Helper function để thêm token vào header
// Auth disabled for FE testing
const getAuthHeader = () => ({});

export async function fetchJoinRequests(clubId, token) {
    try {
        const { data } = await apiClient.get(`/clubs/${clubId}/memberships`, {
            headers: getAuthHeader(token)
        });

        // Map BE Membership response to FE JoinRequest format
        const { mapMembership } = require('./dataMappers');
        if (Array.isArray(data)) {
            return data.map(m => mapMembership(m));
        }
        if (data.memberships && Array.isArray(data.memberships)) {
            return data.memberships.map(m => mapMembership(m));
        }
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch join requests');
    }
}

export async function approveJoinRequest(clubId, requestId, token, body = {}) {
    try {
        const { data } = await apiClient.post(
            `/clubs/${clubId}/memberships/${requestId}/approve`,
            body,
            { headers: getAuthHeader(token) }
        );
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Approve failed');
    }
}

export async function rejectJoinRequest(clubId, requestId, token, body = {}) {
    try {
        const { data } = await apiClient.post(
            `/clubs/${clubId}/memberships/${requestId}/reject`,
            body,
            { headers: getAuthHeader(token) }
        );
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Reject failed');
    }
}

export async function getEvents(clubId, token, status = null) {
    try {
        const params = status ? { status } : {};
        const { data } = await apiClient.get(`/clubs/${clubId}/events`, {
            headers: getAuthHeader(token),
            params
        });

        // Map BE response to FE format
        const { mapEvent } = require('./dataMappers');
        if (Array.isArray(data)) {
            return data.map(event => mapEvent(event));
        }
        if (data.events && Array.isArray(data.events)) {
            return data.events.map(event => mapEvent(event));
        }
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
}

export async function getEventDetail(clubId, eventId, token) {
    try {
        const { data } = await apiClient.get(`/clubs/${clubId}/events/${eventId}`, {
            headers: getAuthHeader(token)
        });

        // Map BE response to FE format
        const { mapEvent } = require('./dataMappers');
        if (data.event) {
            return {
                event: mapEvent(data.event),
                registrationsCount: data.registrationsCount || 0
            };
        }
        return { event: mapEvent(data), registrationsCount: 0 };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Event not found');
    }
}

export async function createEvent(clubId, token, body) {
    try {
        const { data } = await apiClient.post(
            `/clubs/${clubId}/events`,
            body,
            { headers: getAuthHeader(token) }
        );
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Create event failed');
    }
}

export async function updateEvent(clubId, eventId, token, body) {
    try {
        const { data } = await apiClient.put(
            `/clubs/${clubId}/events/${eventId}`,
            body,
            { headers: getAuthHeader(token) }
        );
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Update event failed');
    }
}

export async function cancelEvent(clubId, eventId, token, body = {}) {
    try {
        const { data } = await apiClient.patch(
            `/clubs/${clubId}/events/${eventId}/cancel`,
            body,
            { headers: getAuthHeader(token) }
        );
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Cancel event failed');
    }
}

export async function getNotifications(clubId, token) {
    try {
        const { data } = await apiClient.get(`/clubs/${clubId}/notifications`, {
            headers: getAuthHeader(token)
        });

        // Map BE response to FE format
        const { mapNotification } = require('./dataMappers');
        if (Array.isArray(data)) {
            return data.map(notif => mapNotification(notif));
        }
        if (data.notifications && Array.isArray(data.notifications)) {
            return data.notifications.map(notif => mapNotification(notif));
        }
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
}