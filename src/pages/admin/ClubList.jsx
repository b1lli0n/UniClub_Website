import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClubs, updateClubStatus as updateClubStatusAPI } from '../../api/adminapi'
import { toast } from 'react-toastify'

const ClubList = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState('newest')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [clubs, setClubs] = useState([])

    // Fetch clubs from API
    useEffect(() => {
        fetchClubs()
    }, [])

    const fetchClubs = async () => {
        try {
            setLoading(true)
            setError(null)

            // ✅ GỌI API 2 LẦN: Lấy cả Active (status=1) và Paused (status=2)
            const [activeResponse, pausedResponse] = await Promise.all([
                getClubs({
                    page: 1,
                    limit: 100,
                    status: 1, // Active clubs
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                }),
                getClubs({
                    page: 1,
                    limit: 100,
                    status: 2, // Paused clubs
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                })
            ])

            console.log('Active Response:', activeResponse)
            console.log('Paused Response:', pausedResponse)

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

            // Extract and merge clubs from both responses
            const activeClubs = extractClubs(activeResponse)
            const pausedClubs = extractClubs(pausedResponse)
            const clubsData = [...activeClubs, ...pausedClubs]

            console.log(`Total clubs: ${clubsData.length} (Active: ${activeClubs.length}, Paused: ${pausedClubs.length})`)

            // Map API response to match component structure
            const mappedClubs = clubsData.map(club => {
                // ✅ MAPPING ĐÚNG THEO BACKEND:
                // 1 = active (đã duyệt, đang hoạt động)
                // 2 = paused (tạm dừng)
                let status = 'inactive' // Default cho status 2 (paused)

                if (club.status === 1 || club.status === 'active') {
                    status = 'active'
                } else if (club.status === 2 || club.status === 'paused') {
                    status = 'inactive' // UI hiển thị "Dừng hoạt động" cho paused
                }

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
                { id: 101, name: 'CLB Nhiếp ảnh', manager: 'Nguyễn Thy', members: 45, status: 'active', created: '2023-12-20' },
                { id: 102, name: 'CLB Tiếng Anh', manager: 'Trần Minh', members: 120, status: 'active', created: '2024-05-15' },
                { id: 103, name: 'CLB IT', manager: 'Hoàng Nam', members: 88, status: 'inactive', created: '2025-01-10' },
                { id: 104, name: 'CLB Âm nhạc', manager: 'Lê Hương', members: 67, status: 'active', created: '2024-03-22' },
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
            // Logic: 1 = Active, 2 = Inactive/Pause
            const apiStatus = statusString === 'active' ? 1 : 2

            console.log(`Sending API Request: PUT /clubs/${id}/status`, { status: apiStatus })

            // 1. Cập nhật ngay lập tức trên UI (Optimistic update)
            setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, status: statusString } : c)))

            // 2. Gọi API để update trên server
            const result = await updateClubStatusAPI(id, apiStatus)
            console.log('Update Result:', result)

            toast.success(statusString === 'active' ? 'Đã kích hoạt câu lạc bộ' : 'Đã dừng hoạt động câu lạc bộ')
        } catch (err) {
            console.error('Error updating club status:', err)
            // Nếu lỗi, revert lại state cũ bằng cách load lại từ server
            toast.error('Không thể cập nhật trạng thái: ' + (err.message || 'Lỗi server'))
            fetchClubs()
        }
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
                                                {c.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </div>
                                        <div className="admin-col admin-col--action">
                                            <div className="admin-status-actions">
                                                {c.status === 'active' ? (
                                                    // Đang Active -> Hiển thị icon Mở khóa (Xanh) -> Bấm vào để Lock
                                                    <button
                                                        type="button"
                                                        className="admin-status-btn admin-status-btn--approve"
                                                        onClick={() => updateClubStatus(c.id, 'inactive')}
                                                        title="Đang hoạt động - Bấm để dừng"
                                                    >
                                                        <i className="fa-solid fa-lock-open" />
                                                    </button>
                                                ) : (
                                                    // Đang Inactive -> Hiển thị icon Khóa (Đỏ) -> Bấm vào để Unlock
                                                    <button
                                                        type="button"
                                                        className="admin-status-btn admin-status-btn--reject"
                                                        onClick={() => updateClubStatus(c.id, 'active')}
                                                        title="Đang dừng - Bấm để kích hoạt"
                                                    >
                                                        <i className="fa-solid fa-lock" />
                                                    </button>
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
