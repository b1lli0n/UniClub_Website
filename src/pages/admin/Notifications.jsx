import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/api'
import '../../styles/admin.css'

const fmtDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    })}`
}

const getTypeColor = (type) => {
    const colorMap = {
        'event_canceled': '#ef4444',
        'event': '#3b82f6',
        'membership': '#10b981',
        'transaction': '#f59e0b',
        'reminder': '#8b5cf6',
        'announcement': '#6366f1',
    }
    return colorMap[type] || '#6b7280'
}

const getTypeLabel = (type) => {
    const labelMap = {
        'event_canceled': 'Hủy sự kiện',
        'event': 'Sự kiện',
        'membership': 'Thành viên',
        'transaction': 'Giao dịch',
        'reminder': 'Nhắc nhở',
        'announcement': 'Thông báo',
    }
    return labelMap[type] || type
}

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
    const [filterUnread, setFilterUnread] = useState(false)

    const fetchNotifications = useCallback(async (pageNum = 1) => {
        setLoading(true)
        setError('')

        try {
            const params = {
                page: pageNum,
                limit: 20,
            }
            if (filterUnread) {
                params.unread = true
            }

            let response
            try {
                // Try admin endpoint first
                response = await api.get('/admin/notifications', { params })
            } catch (err) {
                if (err?.response?.status === 404) {
                    // Fallback to public notifications endpoint
                    response = await api.get('/notifications', { params })
                } else {
                    throw err
                }
            }
            const data = response.data ?? response

            const items = Array.isArray(data?.items) ? data.items : []
            setNotifications(items)

            setPagination({
                page: Number(data?.page) || pageNum,
                limit: Number(data?.limit) || 20,
                total: Number(data?.total) || items.length,
                pages: Number(data?.pages) || Math.ceil((Number(data?.total) || 0) / 20),
            })

            setPage(pageNum)
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Không thể tải thông báo'
            setError(message)
            toast.error(message)
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }, [filterUnread])

    useEffect(() => {
        fetchNotifications(1)
    }, [filterUnread])

    const handleMarkAsRead = async (notificationId) => {
        try {
            let notifyPatch
            try {
                // Try admin endpoint first
                notifyPatch = await api.patch(`/admin/notifications/${notificationId}/read`)
            } catch (err) {
                if (err?.response?.status === 404) {
                    // Fallback to public notifications endpoint
                    notifyPatch = await api.patch(`/notifications/${notificationId}/read`)
                } else {
                    throw err
                }
            }

            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, is_read: true } : notif
                )
            )
            toast.success('Đã đánh dấu là đã đọc')
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái')
        }
    }

    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">
                        <i className="fa-solid fa-bell" style={{ marginRight: 8, color: '#f59e0b' }} />
                        Quản lý thông báo
                    </h2>
                    <p className="admin-subtitle">Xem tất cả thông báo được gửi tới hệ thống</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={filterUnread}
                        onChange={(e) => setFilterUnread(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Chỉ hiển thị chưa đọc</span>
                </label>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                    Tổng: {pagination.total} thông báo
                </span>
            </div>

            <div className="admin-table">
                <div className="admin-table-head">
                    <div className="admin-col" style={{ flex: 1.5 }}>Tiêu đề</div>
                    <div className="admin-col" style={{ flex: 1.2 }}>Loại</div>
                    <div className="admin-col" style={{ flex: 2 }}>Nội dung</div>
                    <div className="admin-col" style={{ flex: 1 }}>Thời gian</div>
                    <div className="admin-col" style={{ flex: 0.8 }}>Trạng thái</div>
                    <div className="admin-col" style={{ flex: 0.6 }}>Thao tác</div>
                </div>

                <div className="admin-table-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#3b82f6' }} />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: 32, color: '#ef4444' }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />
                            {error}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
                            <i className="fa-solid fa-inbox" style={{ marginRight: 8, fontSize: 20 }} />
                            <p>Không có thông báo</p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const notificationData = notif?.notification || {}
                            const type = notificationData?.type || 'announcement'
                            const isRead = notif?.is_read === true

                            return (
                                <div
                                    key={notif._id}
                                    className="admin-row"
                                    style={{
                                        opacity: isRead ? 0.7 : 1,
                                        borderLeft: `4px solid ${getTypeColor(type)}`,
                                    }}
                                >
                                    <div className="admin-col" style={{ flex: 1.5, fontWeight: 600 }}>
                                        {notificationData?.title || '—'}
                                    </div>

                                    <div className="admin-col" style={{ flex: 1.2 }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: '#ffffff',
                                                backgroundColor: getTypeColor(type),
                                            }}
                                        >
                                            {getTypeLabel(type)}
                                        </span>
                                    </div>

                                    <div className="admin-col" style={{ flex: 2, fontSize: 13, color: '#6b7280' }}>
                                        {notificationData?.description || '—'}
                                    </div>

                                    <div className="admin-col" style={{ flex: 1, fontSize: 12, color: '#6b7280' }}>
                                        {fmtDateTime(notificationData?.created_at || notif.created_at)}
                                    </div>

                                    <div className="admin-col" style={{ flex: 0.8 }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                backgroundColor: isRead ? '#e5e7eb' : '#fef3c7',
                                                color: isRead ? '#6b7280' : '#92400e',
                                            }}
                                        >
                                            {isRead ? 'Đã đọc' : 'Chưa đọc'}
                                        </span>
                                    </div>

                                    <div className="admin-col" style={{ flex: 0.6 }}>
                                        {!isRead && (
                                            <button
                                                type="button"
                                                className="admin-status-btn"
                                                onClick={() => handleMarkAsRead(notif._id)}
                                                title="Đánh dấu là đã đọc"
                                                style={{
                                                    background: '#dbeafe',
                                                    color: '#2563eb',
                                                    border: '1px solid #bfdbfe',
                                                    fontSize: 12,
                                                    padding: '4px 8px',
                                                }}
                                            >
                                                <i className="fa-solid fa-check" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {pagination.pages > 1 && (
                    <div className="admin-pagination" style={{ marginTop: 12 }}>
                        <button
                            className="admin-status-btn"
                            onClick={() => fetchNotifications(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            <i className="fa-solid fa-chevron-left" />
                        </button>
                        <span style={{ margin: '0 14px', fontSize: 13, color: '#6b7280' }}>
                            Trang {page} / {pagination.pages} ({pagination.total} thông báo)
                        </span>
                        <button
                            className="admin-status-btn"
                            onClick={() => fetchNotifications(Math.min(pagination.pages, page + 1))}
                            disabled={page === pagination.pages}
                        >
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminNotifications
