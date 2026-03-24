import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClubs, updateClubStatus as updateClubStatusAPI } from '../../api/adminapi'
import { toast } from 'react-toastify'

const STATUS_TO_API = {
    pending: 0,
    active: 1,
    inactive: 2,
    rejected: 3
}

const normalizeStatus = (status) => {
    if (status === 0 || status === 'pending') return 'pending'
    if (status === 1 || status === 'active' || status === 'approved') return 'active'
    if (status === 2 || status === 'paused' || status === 'inactive') return 'inactive'
    if (status === 3 || status === 'rejected') return 'rejected'
    return 'inactive'
}

const ClubList = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState('newest')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pendingActivationClubId, setPendingActivationClubId] = useState(null)

    const [clubs, setClubs] = useState([])

    // Fetch clubs from API
    useEffect(() => {
        fetchClubs()
    }, [])

    const fetchClubs = async () => {
        try {
            setLoading(true)
            setError(null)

            // Helper function to extract clubs array from response
            const extractClubs = (response) => {
                if (Array.isArray(response)) {
                    return response
                } else if (response.clubs && Array.isArray(response.clubs)) {
                    return response.clubs
                } else if (response.data && response.data.clubs && Array.isArray(response.data.clubs)) {
                    return response.data.clubs
                } else if (response.data && Array.isArray(response.data)) {
                    return response.data
                }
                return []
            }

            const extractPagination = (response) => {
                if (response?.pagination) return response.pagination
                if (response?.data?.pagination) return response.data.pagination
                return null
            }

            const limit = 100
            const firstResponse = await getClubs({
                page: 1,
                limit,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            })

            const firstPageClubs = extractClubs(firstResponse)
            const pagination = extractPagination(firstResponse)
            const totalPages = pagination?.totalPages || pagination?.total_pages || 1

            let clubsData = [...firstPageClubs]

            if (totalPages > 1) {
                const pageRequests = []
                for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
                    pageRequests.push(
                        getClubs({
                            page: currentPage,
                            limit,
                            sortBy: 'createdAt',
                            sortOrder: 'desc'
                        })
                    )
                }

                const pageResponses = await Promise.all(pageRequests)
                const otherPagesClubs = pageResponses.flatMap((res) => extractClubs(res))
                clubsData = [...clubsData, ...otherPagesClubs]
            }

            // Deduplicate by club id in case backend returns overlapping results
            const seenIds = new Set()
            clubsData = clubsData.filter((club) => {
                const clubId = club?._id || club?.id
                if (!clubId) return true
                if (seenIds.has(clubId)) return false
                seenIds.add(clubId)
                return true
            })

            console.log(`Total clubs fetched: ${clubsData.length} (pages: ${totalPages})`)

            // Map API response to match component structure
            const mappedClubs = clubsData.map(club => {
                const status = normalizeStatus(club.status)

                return {
                    id: club._id || club.id,
                    name: club.name,
                    manager: club.leader?.name || club.leader?.username || club.leader_id?.name || 'Chưa có',
                    members: club.memberCount || club.member_total || club.members?.length || 0,
                    status: status,
                    created: club.created_at || club.createdAt || new Date().toISOString()
                }
            })

            console.log('Mapped clubs:', mappedClubs)
            setClubs(mappedClubs)
            toast.success(`Đã tải ${mappedClubs.length} câu lạc bộ`)
        } catch (err) {
            console.error('Error fetching clubs:', err)

            // Fallback to mock data if API is not available (for development)
            console.warn('Using mock data as fallback')
            const mockClubs = [
                { id: 101, name: 'CLB Nhiếp ảnh', manager: 'Nguyễn Thy', members: 45, status: 'pending', created: '2023-12-20' },
                { id: 102, name: 'CLB Tiếng Anh', manager: 'Trần Minh', members: 120, status: 'active', created: '2024-05-15' },
                { id: 103, name: 'CLB IT', manager: 'Hoàng Nam', members: 88, status: 'inactive', created: '2025-01-10' },
                { id: 104, name: 'CLB Âm nhạc', manager: 'Lê Hương', members: 67, status: 'rejected', created: '2024-03-22' },
                { id: 105, name: 'CLB Thể thao', manager: 'Phạm Dũng', members: 95, status: 'active', created: '2024-08-10' },
            ]
            setClubs(mockClubs)

            setError(err.message || 'Không thể kết nối đến server. Đang sử dụng dữ liệu mẫu.')
            toast.warning('Không thể kết nối đến server. Đang hiển thị dữ liệu mẫu.')
        } finally {
            setLoading(false)
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        let rows = clubs
        if (q) {
            rows = rows.filter((c) => `${c.name} ${c.manager}`.toLowerCase().includes(q))
        }
        if (sortKey === 'newest') rows = [...rows].reverse()
        if (sortKey === 'oldest') rows = [...rows]
        return rows
    }, [clubs, search, sortKey])

    const pageSize = 5
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

    const updateClubStatus = async (id, statusString) => {
        try {
            const apiStatus = STATUS_TO_API[statusString]
            if (apiStatus === undefined) {
                toast.error('Trạng thái không hợp lệ')
                return
            }

            console.log(`Sending API Request: PUT /clubs/${id}/status`, { status: apiStatus })

            // 1. Cập nhật ngay lập tức trên UI (Optimistic update)
            setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, status: statusString } : c)))

            // 2. Gọi API để update trên server
            await updateClubStatusAPI(id, apiStatus)

            const successMap = {
                active: 'Đã duyệt/kích hoạt câu lạc bộ',
                inactive: 'Đã tạm dừng câu lạc bộ',
                rejected: 'Đã từ chối câu lạc bộ'
            }
            toast.success(successMap[statusString] || 'Đã cập nhật trạng thái câu lạc bộ')
            if (statusString === 'active') {
                setPendingActivationClubId(null)
            }
        } catch (err) {
            console.error('Error updating club status:', err)
            // Nếu lỗi, revert lại state cũ bằng cách load lại từ server
            toast.error('Không thể cập nhật trạng thái: ' + (err.message || 'Lỗi server'))
            fetchClubs()
        }
    }

    const startActivationConfirmation = (clubId) => {
        setPendingActivationClubId(clubId)
    }

    const cancelActivationConfirmation = () => {
        setPendingActivationClubId(null)
    }

    const confirmActivation = async (clubId) => {
        await updateClubStatus(clubId, 'active')
    }

    const getStatusLabel = (status) => {
        if (status === 'pending') return 'Chờ duyệt'
        if (status === 'active') return 'Hoạt động'
        if (status === 'rejected') return 'Từ chối'
        return 'Tạm dừng'
    }

    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">Quản lý câu lạc bộ</h2>
                    <p className="admin-subtitle">Theo dõi hoạt động, trạng thái và thành viên các câu lạc bộ</p>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fa-solid fa-magnifying-glass admin-search-icon" />
                    <input
                        className="admin-search-input"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                <button
                    className="admin-sort"
                    type="button"
                    onClick={() => setSortKey((s) => (s === 'newest' ? 'oldest' : 'newest'))}
                    title="Đổi sắp xếp"
                >
                    <i className="fa-solid fa-arrow-down-wide-short" />
                    <span>{sortKey === 'newest' ? 'Mới nhất' : 'Cũ nhất'}</span>
                </button>
            </div>

            <div className="admin-table">
                <div className="admin-table-head">
                    <div className="admin-col admin-col--club">Tên CLB</div>
                    <div className="admin-col admin-col--sender">Chủ nhiệm</div>
                    <div className="admin-col admin-col--date">Thành viên</div>
                    <div className="admin-col admin-col--status">Trạng thái</div>
                    <div className="admin-col admin-col--action" />
                </div>

                <div className="admin-table-body">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 12 }} />
                            <p>Đang tải danh sách câu lạc bộ...</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 24, marginBottom: 12 }} />
                            <p>{error}</p>
                            <button
                                className="admin-status-btn admin-status-btn--approve"
                                onClick={fetchClubs}
                                style={{ marginTop: 12, padding: '8px 16px' }}
                            >
                                <i className="fa-solid fa-rotate-right" style={{ marginRight: 8 }} />
                                Thử lại
                            </button>
                        </div>
                    ) : pageRows.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            <i className="fa-solid fa-inbox" style={{ fontSize: 24, marginBottom: 12 }} />
                            <p>Không tìm thấy câu lạc bộ nào</p>
                        </div>
                    ) : (
                        pageRows.map((c) => {
                            return (
                                <div className="admin-row-wrap" key={c.id}>
                                    <div className="admin-row">
                                        <div className="admin-col admin-col--club">{c.name}</div>
                                        <div className="admin-col admin-col--sender">{c.manager}</div>
                                        <div className="admin-col admin-col--date">{c.members}</div>
                                        <div className="admin-col admin-col--status">
                                            <span className={`admin-status admin-status--${c.status}`}>
                                                {getStatusLabel(c.status)}
                                            </span>
                                        </div>
                                        <div className="admin-col admin-col--action">
                                            <div className="admin-status-actions">
                                                {c.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="admin-status-btn admin-status-btn--approve"
                                                            onClick={() => updateClubStatus(c.id, 'active')}
                                                            title="Duyệt câu lạc bộ"
                                                        >
                                                            <i className="fa-solid fa-check" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-status-btn admin-status-btn--reject"
                                                            onClick={() => updateClubStatus(c.id, 'rejected')}
                                                            title="Từ chối câu lạc bộ"
                                                        >
                                                            <i className="fa-solid fa-xmark" />
                                                        </button>
                                                    </>
                                                ) : c.status === 'active' ? (
                                                    // Đang Active -> Hiển thị icon Mở khóa (Xanh) -> Bấm vào để Lock
                                                    <button
                                                        type="button"
                                                        className="admin-status-btn admin-status-btn--reject"
                                                        onClick={() => updateClubStatus(c.id, 'inactive')}
                                                        title="Deactivate câu lạc bộ"
                                                    >
                                                        <i className="fa-solid fa-lock" />
                                                    </button>
                                                ) : (
                                                    // Inactive hoặc Rejected -> cần xác nhận trước khi Activate
                                                    pendingActivationClubId === c.id ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="admin-status-btn admin-status-btn--approve"
                                                                onClick={() => confirmActivation(c.id)}
                                                                title="Xác nhận cho hoạt động"
                                                            >
                                                                <i className="fa-solid fa-check" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-status-btn admin-status-btn--reject"
                                                                onClick={cancelActivationConfirmation}
                                                                title="Hủy xác nhận"
                                                            >
                                                                <i className="fa-solid fa-xmark" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="admin-status-btn admin-status-btn--approve"
                                                            onClick={() => startActivationConfirmation(c.id)}
                                                            title="Bước 1: Mở xác nhận cho hoạt động"
                                                        >
                                                            <i className="fa-solid fa-lock-open" />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                            <button
                                                className="admin-eye-btn"
                                                type="button"
                                                onClick={() => navigate(`/admin/club-detail/${c.id}`, { state: { club: c } })}
                                                title="Xem chi tiết"
                                                style={{ marginLeft: 8 }}
                                            >
                                                <i className="fa-solid fa-eye" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="admin-pagination">
                    <button
                        className="admin-page-nav"
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <i className="fa-solid fa-chevron-left" />
                    </button>
                    <div className="admin-pages">
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const n = i + 1
                            return (
                                <button
                                    key={n}
                                    className={`admin-page-num ${n === safePage ? 'is-active' : ''}`}
                                    type="button"
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            )
                        })}
                    </div>
                    <button
                        className="admin-page-nav"
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <i className="fa-solid fa-chevron-right" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ClubList
