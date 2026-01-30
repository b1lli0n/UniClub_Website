/**
 * Data mappers to convert BE responses to FE format
 * BE uses snake_case + numeric status codes; FE uses camelCase + string enums
 */

// Event status mapping: BE code → FE label
const EVENT_STATUS_MAP = {
    0: 'draft',        // pending
    1: 'published',    // active
    2: 'paused',       // pause
    3: 'canceled'      // deactivate
};

// Progress status mapping: BE code → FE label
const PROGRESS_STATUS_MAP = {
    0: 'draft',
    1: 'completed'
};

// Membership status mapping: BE code → FE label
const MEMBERSHIP_STATUS_MAP = {
    0: 'pending',
    1: 'active',
    2: 'rejected',
    3: 'left'
};

/**
 * Map Event from BE format to FE format
 * @param {Object} event - BE Event object
 * @returns {Object} FE Event object
 */
export const mapEvent = (event) => {
    if (!event) return null;

    return {
        _id: event.event_id,
        eventId: event.event_id,
        clubId: event.club_id,
        title: event.title,
        description: event.description,
        location: event.location,
        startAt: event.start_at,
        endAt: event.end_at,
        capacity: event.capacity,
        public: event.is_public || false,
        status: EVENT_STATUS_MAP[event.status] || 'draft',
        progressStatus: PROGRESS_STATUS_MAP[event.progress_status] || 'draft',
        statusCode: event.status,
        progressStatusCode: event.progress_status,
        createdBy: event.created_by || null,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        canceledAt: event.canceled_at,
        cancelReason: event.cancel_reason,
        qrCode: event.qr_code,
        feedbackSummary: event.feedback_summary,
        // Include original for reference if needed
        _raw: event
    };
};

/**
 * Map Event from FE format to BE format for submission
 * @param {Object} event - FE Event object
 * @returns {Object} BE Event object
 */
export const unmapEvent = (event) => {
    if (!event) return null;

    // Reverse status mapping
    const statusKeyFE = Object.entries(EVENT_STATUS_MAP).find(([_, v]) => v === event.status)?.[0];
    const progressStatusKeyFE = Object.entries(PROGRESS_STATUS_MAP).find(([_, v]) => v === event.progressStatus)?.[0];

    return {
        event_id: event._id || event.eventId,
        club_id: event.clubId,
        title: event.title,
        description: event.description,
        location: event.location,
        start_at: event.startAt,
        end_at: event.endAt,
        capacity: event.capacity,
        is_public: event.public,
        status: event.statusCode !== undefined ? event.statusCode : parseInt(statusKeyFE || 0),
        progress_status: event.progressStatusCode !== undefined ? event.progressStatusCode : parseInt(progressStatusKeyFE || 0),
        created_by: event.createdBy?._id || event.createdBy?.user_id,
        created_at: event.createdAt,
        updated_at: event.updatedAt,
        canceled_at: event.canceledAt,
        cancel_reason: event.cancelReason,
        qr_code: event.qrCode,
        feedback_summary: event.feedbackSummary
    };
};

/**
 * Map Membership (Join Request) from BE format to FE format
 * @param {Object} membership - BE Membership object
 * @returns {Object} FE JoinRequest object
 */
export const mapMembership = (membership) => {
    if (!membership) return null;

    return {
        _id: membership.membership_id,
        membershipId: membership.membership_id,
        userId: membership.user_id,
        clubId: membership.club_id,
        user: membership.user || {
            _id: membership.user_id,
            name: membership.user?.full_name || 'Unknown',
            email: membership.user?.email || ''
        },
        role: membership.role || 0,
        status: MEMBERSHIP_STATUS_MAP[membership.status] || 'pending',
        statusCode: membership.status,
        contributionScore: membership.contribution_score,
        joinedAt: membership.joined_at,
        createdAt: membership.joined_at || membership.created_at,
        updatedAt: membership.updated_at,
        message: membership.message || '',
        // Include original for reference if needed
        _raw: membership
    };
};

/**
 * Map Notification from BE format to FE format
 * @param {Object} notification - BE Notification object
 * @returns {Object} FE Notification object
 */
export const mapNotification = (notification) => {
    if (!notification) return null;

    return {
        _id: notification.notification_id,
        notificationId: notification.notification_id,
        senderId: notification.sender_id,
        targetId: notification.target_id,
        title: notification.title,
        body: notification.description,
        description: notification.description,
        type: notification.type || 'general',
        read: notification.is_read || false,
        isRead: notification.is_read || false,
        deleted: notification.is_deleted || false,
        data: notification.payload || {},
        createdAt: notification.created_at,
        updatedAt: notification.updated_at,
        // Include original for reference if needed
        _raw: notification
    };
};

/**
 * Get status badge label for Event
 * @param {number|string} statusOrCode - Event status code or label
 * @returns {string} Readable status label
 */
export const getEventStatusLabel = (statusOrCode) => {
    if (typeof statusOrCode === 'number') {
        return EVENT_STATUS_MAP[statusOrCode] || 'unknown';
    }
    // If already a label, return as-is
    return statusOrCode || 'unknown';
};

/**
 * Get status badge label for Membership
 * @param {number|string} statusOrCode - Membership status code or label
 * @returns {string} Readable status label
 */
export const getMembershipStatusLabel = (statusOrCode) => {
    if (typeof statusOrCode === 'number') {
        return MEMBERSHIP_STATUS_MAP[statusOrCode] || 'unknown';
    }
    return statusOrCode || 'unknown';
};
