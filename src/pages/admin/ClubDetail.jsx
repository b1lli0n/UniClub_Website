import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getClubDetail, getClubMembers } from '../../api/adminapi'

const ClubDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [club, setClub] = useState(null)
    const [members, setMembers] = useState([])
    const [totalMembers, setTotalMembers] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Role mapping
    const getRoleName = (role) => {
        const roleMap = {
            0: 'Thành viên',
            1: 'Chủ nhiệm',
            2: 'Phó chủ nhiệm',
            3: 'Thư ký',
            4: 'Thủ quỹ',
            5: 'Quản lý sự kiện'
        }
        return roleMap[role] || 'Không xác định'
    }

    // Role color mapping
    const getRoleColor = (role) => {
        const colorMap = {
            0: '#6b7280',
            1: '#16a34a',
            2: '#2563eb',
            3: '#7c3aed',
            4: '#dc2626',
            5: '#ea580c'
        }
        return colorMap[role] || '#6b7280'
    }

    // Status mapping
    const getStatusDisplay = (status) => {
        const statusMap = {
            0: { text: 'Chờ duyệt', class: 'pending' },
            1: { text: 'Hoạt động', class: 'active' },
            2: { text: 'Tạm dừng', class: 'paused' },
            3: { text: 'Từ chối', class: 'rejected' }
        }
        return statusMap[status] || { text: 'Không xác định', class: 'pending' }
    }

    // Fetch club details and members
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch club details
                const clubResponse = await getClubDetail(id)
                setClub(clubResponse.data.club)

                // Fetch members (only first 5, sorted by role)
                const membersResponse = await getClubMembers(id, {
                    page: 1,
                    limit: 5,
                    sortBy: 'role',
                    sortOrder: 'asc' // Ascending order with new priority system (leader first)
                })

                setMembers(membersResponse.data.members)
                setTotalMembers(membersResponse.data.pagination.totalItems)
            } catch (err) {
                console.error('Error fetching club data:', err)
                setError(err.message || 'Không thể tải dữ liệu câu lạc bộ')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3b82f6' }} />
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fa-solid fa-exclamation-circle" style={{ fontSize: '32px', color: '#ef4444' }} />
                    <p style={{ marginTop: '16px', color: '#ef4444' }}>{error}</p>
                    <button
                        className="admin-status-btn admin-status-btn--approve"
                        onClick={() => navigate(-1)}
                        style={{ marginTop: '16px' }}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    if (!club) {
        return null
    }

    const statusDisplay = getStatusDisplay(club.status)

    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        className="admin-status-btn"
                        onClick={() => navigate('/admin/list-clubs')}
                        title="Quay lại danh sách câu lạc bộ"
                        style={{ width: 32, height: 32 }}
                    >
                        <i className="fa-solid fa-arrow-left" />
                    </button>
                    <div>
                        <h2 className="admin-title">Chi tiết câu lạc bộ</h2>
                        <p className="admin-subtitle">Xem thông tin chi tiết câu lạc bộ</p>
                    </div>
                </div>
            </div>

            <div className="admin-row-details">
                <h4 className="admin-detail-section-title">Thông tin chung</h4>
                <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                        <div className="admin-detail-label">Tên CLB</div>
                        <div className="admin-detail-value">{club.name}</div>
                    </div>
                    <div className="admin-detail-item">
                        <div className="admin-detail-label">Chủ nhiệm</div>
                        <div className="admin-detail-value">
                            {club.leader_id?.name || 'Chưa có'}
                        </div>
                    </div>
                    <div className="admin-detail-item">
                        <div className="admin-detail-label">Danh mục</div>
                        <div className="admin-detail-value">{club.category || 'Chưa phân loại'}</div>
                    </div>
                    <div className="admin-detail-item">
                        <div className="admin-detail-label">Ngày tạo</div>
                        <div className="admin-detail-value">
                            {new Date(club.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                    <div className="admin-detail-item">
                        <div className="admin-detail-label">Tổng số thành viên</div>
                        <div className="admin-detail-value">{totalMembers}</div>
                    </div>
                    <div className="admin-detail-item">
                        <div className="admin-detail-label">Trạng thái</div>
                        <div className="admin-detail-value">
                            <span className={`admin-status admin-status--${statusDisplay.class}`}>
                                {statusDisplay.text}
                            </span>
                        </div>
                    </div>
                </div>

                {club.description && (
                    <>
                        <h4 className="admin-detail-section-title" style={{ marginTop: 24 }}>
                            Mô tả
                        </h4>
                        <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{club.description}</p>
                    </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                    <h4 className="admin-detail-section-title" style={{ margin: 0 }}>
                        Thành viên
                    </h4>
                    <button
                        className="admin-status-btn"
                        onClick={() => navigate(`/admin/club-members/${id}`)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '15px 110px',
                            marginLeft: '30px',
                            background: 'linear-gradient(135deg, #CDB4DB 0%, #FFC8DD 25%, #FFAFCC 50%, #BDE0FE 75%, #A2D2FF 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(205, 180, 219, 0.3)',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(205, 180, 219, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(205, 180, 219, 0.3)'
                        }}
                    >
                        <i className="fa-solid fa-users" />
                        <span>Xem tất cả thành viên</span>
                    </button>
                </div>

                <div className="admin-table" style={{ marginTop: 12 }}>
                    <div className="admin-table-head" style={{ background: '#f5f5f5' }}>
                        <div className="admin-col" style={{ flex: 1.5 }}>Tên thành viên</div>
                        <div className="admin-col" style={{ flex: 1 }}>Email</div>
                        <div className="admin-col" style={{ flex: 1 }}>Vai trò</div>
                        <div className="admin-col" style={{ flex: 1 }}>Ngày tham gia</div>
                    </div>
                    <div className="admin-table-body" style={{ gap: 4, padding: 8 }}>
                        {members.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                Chưa có thành viên nào
                            </div>
                        ) : (
                            members.map((member) => (
                                <div
                                    key={member._id}
                                    className="admin-row"
                                    style={{ padding: '12px', border: '1px solid #eee' }}
                                >
                                    <div className="admin-col" style={{ flex: 1.5 }}>
                                        {member.user_id?.name || 'N/A'}
                                    </div>
                                    <div className="admin-col" style={{ flex: 1, color: '#6b7280' }}>
                                        {member.user_id?.email || 'N/A'}
                                    </div>
                                    <div className="admin-col" style={{ flex: 1 }}>
                                        <span
                                            style={{
                                                fontWeight: member.role === 1 ? 'bold' : 'normal',
                                                color: getRoleColor(member.role)
                                            }}
                                        >
                                            {getRoleName(member.role)}
                                        </span>
                                    </div>
                                    <div className="admin-col" style={{ flex: 1, color: '#6b7280' }}>
                                        {new Date(member.joined_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {totalMembers > 5 && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            Hiển thị 5 trong số {totalMembers} thành viên
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClubDetail
