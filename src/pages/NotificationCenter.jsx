import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    getNotifications,
    deleteNotification,
    markAsRead,
    getNotificationDetail,
} from "../api/notificationApi";
import { acceptInvitation, rejectInvitation } from "../api/invitationApi";
import CreateNotificationModal from "../components/CreateNotificationModal";
import "../styles/NotificationCenter.css";

const NotificationCenter = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        status: "all",
        search: "",
        page: 1,
        limit: 10,
    });
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
    });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [invitationActionLoading, setInvitationActionLoading] = useState("");

    // ✅ NEW: Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: 'single', // 'single' or 'bulk'
        id: null,
        count: 0
    });

    // Helper functions
    const getNotificationData = (item) => item?.notification || item;
    const getTitle = (item) => getNotificationData(item)?.title || "Không có tiêu đề";
    const getContent = (item) => {
        const data = getNotificationData(item);
        return data?.description || data?.content || data?.body || "Không có nội dung";
    };
    const isRead = (item) => item?.is_read || item?.isRead || false;
    const getCreatedAt = (item) => {
        const data = getNotificationData(item);
        return data?.createdAt || data?.created_at || item?.createdAt || item?.created_at || null;
    };
    const getSenderName = (item) => {
        const data = getNotificationData(item);
        return data?.display_sender_name || data?.displayName || data?.senderName || "Hệ thống";
    };
    const getType = (item) => getNotificationData(item)?.type || "general";
    const getInvitationMeta = (item) => {
        const data = getNotificationData(item) || {};
        const payload = data.payload || data.metadata || data.data || {};
        const invitationObj = payload.invitation || payload.invitationInfo || null;

        const invitationId =
            payload.invitationId ||
            payload.invitation_id ||
            payload.inviteId ||
            payload.referenceId ||
            payload.reference_id ||
            invitationObj?._id ||
            invitationObj?.id ||
            data.invitationId ||
            data.invitation_id ||
            null;

        const clubId =
            payload.clubId ||
            payload.club_id ||
            invitationObj?.clubId ||
            invitationObj?.club_id ||
            localStorage.getItem("clubId") ||
            null;

        const status =
            payload.status ||
            payload.invitationStatus ||
            invitationObj?.status ||
            null;

        const type = String(data.type || "").toLowerCase();
        const isInvitation = type.includes("invitation") || Boolean(invitationId);

        return { isInvitation, invitationId, clubId, status };
    };

    const isFinalInvitationStatus = (status) => {
        const normalized = String(status || "").toLowerCase();
        return ["approved", "accepted", "rejected", "declined", "canceled", "cancelled"].includes(normalized);
    };

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: filter.page,
                limit: filter.limit,
            };
            if (filter.status !== "all") params.status = filter.status;
            if (filter.search) params.search = filter.search;

            const response = await getNotifications(params);

            let notificationsList = [];
            if (Array.isArray(response)) {
                notificationsList = response;
            } else if (Array.isArray(response?.items)) {
                notificationsList = response.items;
            } else if (Array.isArray(response?.data?.items)) {
                notificationsList = response.data.items;
            } else if (Array.isArray(response?.data)) {
                notificationsList = response.data;
            }

            setNotifications(notificationsList);
            setPagination({
                total: response?.total || 0,
                totalPages: response?.totalPages || 1,
                page: response?.page || filter.page,
            });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Không thể tải danh sách thông báo");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const notificationId = searchParams.get("id");
        if (notificationId) {
            handleViewDetail(notificationId);
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filter.page !== 1) {
                setFilter((prev) => ({ ...prev, page: 1 }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filter.search]);

    const handleViewDetail = async (id) => {
        try {
            const detail = await getNotificationDetail(id);
            setSelectedNotification(detail?.data || detail);
            setNotifications((prev) =>
                prev.map((n) =>
                    (n._id || n.id) === id ? { ...n, is_read: true, isRead: true } : n
                )
            );
        } catch (error) {
            console.error("Failed to get notification detail:", error);
            toast.error("Không thể tải chi tiết thông báo");
        }
    };


    const handleNotificationClick = async (notification) => {
        const id = notification._id || notification.id;

        // ✅ FIX: Set selected notification trực tiếp từ data đã có
        setSelectedNotification(notification);

        try {
            if (!isRead(notification)) {
                await markAsRead(id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        (n._id || n.id) === id ? { ...n, is_read: true, isRead: true } : n
                    )
                );
            }
            // Không cần gọi handleViewDetail nữa vì đã có đủ data
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleInvitationAction = async (notification, action) => {
        const inviteMeta = getInvitationMeta(notification);
        if (!inviteMeta.invitationId) {
            toast.error("Không tìm thấy mã lời mời");
            return;
        }

        const actionKey = `${notification._id || notification.id || inviteMeta.invitationId}-${action}`;
        setInvitationActionLoading(actionKey);

        try {
            if (action === "accept") {
                await acceptInvitation(inviteMeta.invitationId, inviteMeta.clubId);
                toast.success("Đã đồng ý tham gia câu lạc bộ");
            } else {
                await rejectInvitation(inviteMeta.invitationId, inviteMeta.clubId);
                toast.success("Đã từ chối lời mời");
            }

            const id = notification._id || notification.id;
            if (id && !isRead(notification)) {
                await markAsRead(id);
            }

            await fetchNotifications();
            setSelectedNotification(null);
        } catch (error) {
            toast.error(error?.message || "Xử lý lời mời thất bại");
        } finally {
            setInvitationActionLoading("");
        }
    };

    // ✅ NEW: Open delete confirmation modal
    const openDeleteModal = (id, e) => {
        e?.stopPropagation();
        setDeleteModal({
            isOpen: true,
            type: 'single',
            id: id,
            count: 1
        });
    };

    // ✅ NEW: Open bulk delete confirmation modal
    const openBulkDeleteModal = () => {
        if (selectedIds.length === 0) {
            toast.warning("Vui lòng chọn thông báo cần xóa");
            return;
        }
        setDeleteModal({
            isOpen: true,
            type: 'bulk',
            id: null,
            count: selectedIds.length
        });
    };

    // ✅ NEW: Close delete modal
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            type: 'single',
            id: null,
            count: 0
        });
    };

    // ✅ NEW: Confirm delete action
    const confirmDelete = async () => {
        if (deleteModal.type === 'single' && deleteModal.id) {
            // Single delete
            setDeletingId(deleteModal.id);
            closeDeleteModal();
            try {
                await deleteNotification(deleteModal.id);
                setTimeout(() => {
                    setNotifications((prev) =>
                        prev.filter((n) => (n._id || n.id) !== deleteModal.id)
                    );
                    setDeletingId(null);
                    toast.success("Đã xóa thông báo");
                    if (selectedNotification && (selectedNotification._id || selectedNotification.id) === deleteModal.id) {
                        setSelectedNotification(null);
                    }
                }, 300);
            } catch (error) {
                setDeletingId(null);
                toast.error("Xóa thông báo thất bại");
            }
        } else if (deleteModal.type === 'bulk') {
            // Bulk delete
            closeDeleteModal();
            try {
                await Promise.all(selectedIds.map((id) => deleteNotification(id)));
                setNotifications((prev) =>
                    prev.filter((n) => !selectedIds.includes(n._id || n.id))
                );
                setSelectedIds([]);
                toast.success("Đã xóa các thông báo đã chọn");
            } catch (error) {
                toast.error("Xóa thông báo thất bại");
            }
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map((n) => n._id || n.id));
        }
    };

    const handleSelectOne = (id, e) => {
        e.stopPropagation();
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handlePageChange = (newPage) => {
        setFilter((prev) => ({ ...prev, page: newPage }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Không rõ";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Không rõ";
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "event":
            case "event_canceled":
            case "event_registered":
                return "📅";
            case "club":
            case "membership_approved":
            case "membership_rejected":
                return "👥";
            case "system":
                return "🔔";
            default:
                return "📧";
        }
    };

    const getTypeLabel = (type) => {
        switch (type?.toLowerCase()) {
            case "event":
            case "event_canceled":
            case "event_registered":
                return { label: "Sự kiện", color: "#3b82f6" };
            case "club":
            case "membership_approved":
            case "membership_rejected":
                return { label: "Câu lạc bộ", color: "#10b981" };
            case "system":
                return { label: "Hệ thống", color: "#f59e0b" };
            default:
                return { label: "Cá nhân", color: "#8b5cf6" };
        }
    };

    const selectedInviteMeta = selectedNotification ? getInvitationMeta(selectedNotification) : null;
    const showInvitationActions =
        Boolean(selectedInviteMeta?.isInvitation) &&
        Boolean(selectedInviteMeta?.invitationId) &&
        !isFinalInvitationStatus(selectedInviteMeta?.status);
    const selectedNotiId =
        selectedNotification?._id ||
        selectedNotification?.id ||
        selectedInviteMeta?.invitationId ||
        "";
    const acceptLoading = invitationActionLoading === `${selectedNotiId}-accept`;
    const rejectLoading = invitationActionLoading === `${selectedNotiId}-reject`;

    return (
        <div className="notification-center">
            {/* Header */}
            <div className="notification-center-header">
                <div className="header-content">
                    <div className="header-icon">🔔</div>
                    <div className="header-text">
                        <h1>Trung tâm thông báo</h1>
                        <p>Quản lý tất cả thông báo của bạn</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="notification-center-content">
                <div className="notification-layout">
                    {/* Left Panel */}
                    <div className="notification-list-panel">
                        <div className="notification-card">
                            {/* Toolbar */}
                            <div className="notification-toolbar">
                                <div className="toolbar-left">
                                    <div className="search-box">
                                        <span className="search-icon">🔍</span>
                                        <input
                                            type="text"
                                            value={filter.search}
                                            onChange={(e) =>
                                                setFilter({ ...filter, search: e.target.value, page: 1 })
                                            }
                                            placeholder="Tìm kiếm thông báo..."
                                        />
                                    </div>
                                    <div className="filter-box">
                                        <select
                                            value={filter.status}
                                            onChange={(e) =>
                                                setFilter({ ...filter, status: e.target.value, page: 1 })
                                            }
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="unread">Chưa đọc</option>
                                            <option value="read">Đã đọc</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    className="create-notification-btn"
                                    onClick={() => setIsComposeOpen(true)}
                                >
                                    <span>+</span>
                                    Tạo thông báo
                                </button>
                            </div>

                            {/* Bulk Actions */}
                            {selectedIds.length > 0 && (
                                <div className="bulk-actions">
                                    <span>Đã chọn {selectedIds.length} thông báo</span>
                                    <button className="bulk-delete-btn" onClick={openBulkDeleteModal}>
                                        🗑️ Xóa đã chọn
                                    </button>
                                </div>
                            )}

                            {/* Select All */}
                            <div className="select-all-row">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedIds.length === notifications.length &&
                                            notifications.length > 0
                                        }
                                        onChange={handleSelectAll}
                                    />
                                    <span>Chọn tất cả</span>
                                </label>
                            </div>

                            {/* Notification List */}
                            <div className="notification-list">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="spinner-large"></div>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="empty-state">
                                        <span className="empty-icon">🔔</span>
                                        <h3>Không có thông báo</h3>
                                        <p>
                                            {filter.search
                                                ? "Không tìm thấy thông báo phù hợp"
                                                : "Bạn chưa có thông báo nào"}
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification._id || notification.id}
                                            className={`notification-row ${!isRead(notification) ? "unread" : ""} 
                                                ${selectedNotification &&
                                                    (selectedNotification._id || selectedNotification.id) ===
                                                    (notification._id || notification.id)
                                                    ? "selected" : ""} 
                                                ${deletingId === (notification._id || notification.id) ? "deleting" : ""}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="notification-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(notification._id || notification.id)}
                                                    onChange={(e) => handleSelectOne(notification._id || notification.id, e)}
                                                />
                                            </div>

                                            {!isRead(notification) && <div className="unread-indicator"></div>}

                                            <div className="notification-type-icon">
                                                {getTypeIcon(getType(notification))}
                                            </div>

                                            <div className="notification-info">
                                                <div className="notification-header">
                                                    <h4 className="notification-title">{getTitle(notification)}</h4>
                                                    <span className="notification-date">
                                                        {formatDate(getCreatedAt(notification))}
                                                    </span>
                                                </div>
                                                <p className="notification-preview">{getContent(notification)}</p>
                                                <span className="notification-sender">Từ: {getSenderName(notification)}</span>
                                            </div>

                                            <button
                                                className="delete-btn"
                                                onClick={(e) => openDeleteModal(notification._id || notification.id, e)}
                                                title="Xóa thông báo"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <div className="pagination-info">
                                        Hiển thị {(pagination.page - 1) * filter.limit + 1} -{" "}
                                        {Math.min(pagination.page * filter.limit, pagination.total)} trong số {pagination.total}
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            className="pagination-btn"
                                            disabled={pagination.page === 1}
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                        >
                                            ← Trước
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) pageNum = i + 1;
                                            else if (pagination.page <= 3) pageNum = i + 1;
                                            else if (pagination.page >= pagination.totalPages - 2)
                                                pageNum = pagination.totalPages - 4 + i;
                                            else pageNum = pagination.page - 2 + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`pagination-btn page-number ${pagination.page === pageNum ? "active" : ""}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            className="pagination-btn"
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                        >
                                            Sau →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="notification-detail-panel">
                        {selectedNotification ? (
                            <div className="detail-card">
                                <div className="detail-header">
                                    <div className="detail-type">
                                        <span
                                            className="type-badge"
                                            style={{
                                                backgroundColor: getTypeLabel(getType(selectedNotification)).color + "20",
                                                color: getTypeLabel(getType(selectedNotification)).color,
                                            }}
                                        >
                                            {getTypeIcon(getType(selectedNotification))}{" "}
                                            {getTypeLabel(getType(selectedNotification)).label}
                                        </span>
                                    </div>
                                    <button className="close-detail-btn" onClick={() => setSelectedNotification(null)}>
                                        ×
                                    </button>
                                </div>
                                <h2 className="detail-title">{getTitle(selectedNotification)}</h2>
                                <div className="detail-meta">
                                    <div className="meta-item">
                                        <span className="meta-icon">👤</span>
                                        <span>Từ: <strong>{getSenderName(selectedNotification)}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-icon">📅</span>
                                        <span>{formatDate(getCreatedAt(selectedNotification))}</span>
                                    </div>
                                </div>
                                <div className="detail-body">{getContent(selectedNotification)}</div>
                                <div className="detail-actions">
                                    {showInvitationActions && (
                                        <div className="notification-invite-actions">
                                            <button
                                                type="button"
                                                className="invite-action-btn invite-action-btn-accept"
                                                disabled={acceptLoading || rejectLoading}
                                                onClick={() => handleInvitationAction(selectedNotification, "accept")}
                                            >
                                                {acceptLoading ? "Đang xử lý..." : "Đồng ý tham gia"}
                                            </button>
                                            <button
                                                type="button"
                                                className="invite-action-btn invite-action-btn-reject"
                                                disabled={acceptLoading || rejectLoading}
                                                onClick={() => handleInvitationAction(selectedNotification, "reject")}
                                            >
                                                {rejectLoading ? "Đang xử lý..." : "Từ chối"}
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        className="delete-action-btn"
                                        onClick={(e) => openDeleteModal(selectedNotification._id || selectedNotification.id, e)}
                                    >
                                        🗑️ Xóa thông báo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="no-selection">
                                <span className="no-selection-icon">📬</span>
                                <h3>Chọn một thông báo để xem chi tiết</h3>
                                <p>Click vào thông báo bên trái để xem nội dung đầy đủ</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ NEW: Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="delete-modal-overlay" onClick={closeDeleteModal}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-icon">🗑️</div>
                        <h3 className="delete-modal-title">Xác nhận xóa</h3>
                        <p className="delete-modal-message">
                            {deleteModal.type === 'single'
                                ? "Bạn có chắc chắn muốn xóa thông báo này?"
                                : `Bạn có chắc chắn muốn xóa ${deleteModal.count} thông báo đã chọn?`}
                        </p>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-btn cancel" onClick={closeDeleteModal}>
                                Hủy
                            </button>
                            <button className="delete-modal-btn confirm" onClick={confirmDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compose Modal */}
            <CreateNotificationModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                onSuccess={() => {
                    setIsComposeOpen(false);
                    fetchNotifications();
                }}
            />
        </div>
    );
};

export default NotificationCenter;