import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClubCreationRequests, updateClubStatus } from '../../api/adminapi'
import { toast } from 'react-toastify'
import { ASSET_BASE } from '../../api/api'

const buildLogoSrc = (logoUrl) => {
    if (!logoUrl || typeof logoUrl !== 'string') return ''
    if (logoUrl.startsWith('http')) return logoUrl
    return `${ASSET_BASE}${logoUrl}`
}



const ClubRequests = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState('newest')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [registrations, setRegistrations] = useState([])

    // Fetch club creation requests from API
    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getClubCreationRequests({
                page: 1,
                limit: 100,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            })

            console.log('=== API Response ===')
            console.log('Type:', typeof response)
            console.log('Is Array:', Array.isArray(response))
            console.log('Keys:', response ? Object.keys(response) : 'null')
            console.log('Full Response:', JSON.stringify(response, null, 2))

            // Handle different response structures
            let requestsData = []

            if (Array.isArray(response)) {
                console.log('✓ Response is array')
                requestsData = response
            } else if (response && response.requests && Array.isArray(response.requests)) {
                console.log('✓ Response.requests is array (PRIORITY - after interceptor)')
                requestsData = response.requests
            } else if (response && response.clubs && Array.isArray(response.clubs)) {
                console.log('✓ Response.clubs is array (after interceptor)')
                requestsData = response.clubs
            } else if (response && response.data && response.data.requests && Array.isArray(response.data.requests)) {
                console.log('✓ Response.data.requests is array')
                requestsData = response.data.requests
            } else if (response && response.data && response.data.clubs && Array.isArray(response.data.clubs)) {
                console.log('✓ Response.data.clubs is array')
                requestsData = response.data.clubs
            } else if (response && response.data && Array.isArray(response.data)) {
                console.log('✓ Response.data is array')
                requestsData = response.data
            } else if (response && response.result && Array.isArray(response.result)) {
                console.log('✓ Response.result is array')
                requestsData = response.result
            } else if (response && response.items && Array.isArray(response.items)) {
                console.log('✓ Response.items is array')
                requestsData = response.items
            } else {
                console.error('❌ Unexpected response structure')
                console.error('Response type:', typeof response)
                console.error('Response keys:', response ? Object.keys(response) : 'null')
                console.error('Full response:', response)
                throw new Error(`Cấu trúc API không đúng. Keys: ${response ? Object.keys(response).join(', ') : 'null'}`)
            }

            console.log('Requests data:', requestsData)

            // Map API response to component structure
            const mappedRequests = requestsData.map(req => {
                // Handle status - could be string or number
                let status = 'pending'
                if (req.status === 0 || req.status === 'pending') {
                    status = 'pending'
                } else if (req.status === 1 || req.status === 'approved') {
                    status = 'approved'
                } else if (req.status === 2 || req.status === 'paused') {
                    status = 'paused'
                } else if (req.status === 3 || req.status === 'rejected') {
                    status = 'rejected'
                }

                return {
                    id: req._id || req.id,
                    club: req.name || req.clubName || 'CLB Unknown',
                    logo_url: req.logo_url ,
                    sender: req.creator?.name || req.creator?.username || req.creatorName || req.leader_id?.name || 'Unknown',
                    date: req.created_at ? new Date(req.created_at).toLocaleDateString('vi-VN') :
                        req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : '19/01/2026',
                    status: status
                }
            })

            console.log('Mapped requests:', mappedRequests)
            setRegistrations(mappedRequests)
            toast.success(`Đã tải ${mappedRequests.length} yêu cầu`)
        } catch (err) {
            console.error('Error fetching requests:', err)

            // Fallback to mock data
            console.warn('Using mock data as fallback')
            const mockRequests = [
                { id: 1, club: 'CLB Nhiếp ảnh', sender: 'Nguyễn Thy', date: '19/01/2026', status: 'pending' },
                { id: 2, club: 'CLB Tiếng Anh', sender: 'Trần Minh', date: '18/01/2026', status: 'approved' },
                { id: 3, club: 'CLB Bóng đá', sender: 'Lê An', date: '17/01/2026', status: 'rejected' },
                { id: 4, club: 'CLB Âm nhạc', sender: 'Phạm Khoa', date: '16/01/2026', status: 'pending' },
                { id: 5, club: 'CLB Lập trình', sender: 'Hoàng Nam', date: '16/01/2026', status: 'pending' },
                { id: 6, club: 'CLB Tình nguyện', sender: 'Vũ Linh', date: '15/01/2026', status: 'approved' },
            ]
            setRegistrations(mockRequests)

            setError(err.message || 'Không thể kết nối đến server. Đang sử dụng dữ liệu mẫu.')
            toast.warning('Không thể kết nối đến máy chủ. Đang hiển thị dữ liệu mẫu.')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id, statusString) => {
        try {
            // ✅ MAPPING ĐÚNG THEO BACKEND:
            // Approve: status 1 (active)
            // Reject: status 3 (rejected) - KHÔNG PHẢI 2!
            const statusNumber = statusString === 'approved' ? 1 : 3

            console.log(`Updating club ${id} to status ${statusNumber}`)
            await updateClubStatus(id, statusNumber)

            const statusText = statusString === 'approved' ? 'đã duyệt' : 'đã từ chối'
            toast.success(`Yêu cầu ${statusText} thành công`)

            // ✅ Reload danh sách để CLB đã duyệt/từ chối biến mất khỏi list
            // (Vì API chỉ lấy status = 0)
            fetchRequests()
        } catch (err) {
            console.error('Error updating status:', err)
            toast.error('Không thể cập nhật trạng thái yêu cầu')
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        let rows = registrations
        if (q) {
            rows = rows.filter((r) => `${r.club} ${r.sender}`.toLowerCase().includes(q))
        }
        if (sortKey === 'newest') rows = [...rows].reverse()
        if (sortKey === 'oldest') rows = [...rows]
        return rows
    }, [registrations, search, sortKey])

    const pageSize = 5
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div>
                    <h2 className="admin-title">Quản lý danh sách đăng ký</h2>
                    <p className="admin-subtitle">Quản lý danh sách gửi yêu cầu đăng ký tạo câu lạc bộ</p>
                </div>
            </div>

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="fa-solid fa-magnifying-glass admin-search-icon" />
                    <input
                        className="admin-search-input"
                        placeholder="Search"
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
                    <span>Sort</span>
                </button>
            </div>

            <div className="admin-table">
                <div className="admin-table-head">
                    <div className="admin-col admin-col--club">Tên clb</div>
                    <div className="admin-col admin-col--sender">Người gửi</div>
                    <div className="admin-col admin-col--date">Ngày gửi</div>
                    <div className="admin-col admin-col--status">Trạng thái</div>
                    <div className="admin-col admin-col--logo-url">Logo URL</div>
                    <div className="admin-col admin-col--action" />
                </div>

                <div className="admin-table-body">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 12 }} />
                            <p>Đang tải danh sách yêu cầu...</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 24, marginBottom: 12 }} />
                            <p>{error}</p>
                            <button
                                className="admin-status-btn admin-status-btn--approve"
                                onClick={fetchRequests}
                                style={{ marginTop: 12, padding: '8px 16px' }}
                            >
                                <i className="fa-solid fa-rotate-right" style={{ marginRight: 8 }} />
                                Thử lại
                            </button>
                        </div>
                    ) : pageRows.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                            <i className="fa-solid fa-inbox" style={{ fontSize: 24, marginBottom: 12 }} />
                            <p>Không tìm thấy yêu cầu nào</p>
                        </div>
                    ) : (
                        pageRows.map((r) => {
                            return (
                                <div className="admin-row-wrap" key={r.id}>
                                    <div className="admin-row">
                                        <div className="admin-col admin-col--club">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {r.logo_url ? (
                                                    (() => {
                                                        const logoSrc = buildLogoSrc(r.logo_url)
                                                        return (
                                                    <img
                                                        src={logoSrc}
                                                        alt={r.club}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            border: '1px solid #e5e7eb',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                        )
                                                    })()
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            background: '#f3f4f6',
                                                            color: '#6b7280',
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                        }}
                                                        aria-hidden
                                                    >
                                                        CLB
                                                    </div>
                                                )}
                                                <span>{r.club}</span>
                                            </div>
                                        </div>
                                        <div className="admin-col admin-col--sender">{r.sender}</div>
                                        <div className="admin-col admin-col--date">{r.date}</div>
                                        <div className="admin-col admin-col--status">
                                            {r.status === 'pending' ? (
                                                <div className="admin-status-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-status-btn admin-status-btn--approve"
                                                        onClick={() => updateStatus(r.id, 'approved')}
                                                    >
                                                        <i className="fa-solid fa-check" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-status-btn admin-status-btn--reject"
                                                        onClick={() => updateStatus(r.id, 'rejected')}
                                                    >
                                                        <i className="fa-solid fa-xmark" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`admin-status admin-status--${r.status}`}>
                                                    {r.status === 'approved'
                                                        ? 'đã duyệt'
                                                        : r.status === 'paused'
                                                            ? 'tạm dừng'
                                                            : 'từ chối'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="admin-col admin-col--action">
                                            <button
                                                className="admin-eye-btn"
                                                type="button"
                                                onClick={() => navigate(`/admin/club-request-detail/${r.id}`, { state: { registration: r } })}
                                                title="Xem chi tiết"
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
                            const active = n === safePage
                            return (
                                <button
                                    key={n}
                                    className={`admin-page-num ${active ? 'is-active' : ''}`}
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

export default ClubRequests
