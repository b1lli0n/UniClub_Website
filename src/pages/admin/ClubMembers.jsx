import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getClubDetail, getClubMembers, assignManagementRole } from '../../api/adminapi'
import AssignBadgeModal from '../../components/modals/AssignBadgeModal'

const ClubMembers = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [club, setClub] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updating, setUpdating] = useState({})

    // Trạng thái modal "Thêm huy hiệu"
    const [badgeModal, setBadgeModal] = useState({ open: false, member: null })

    // Pagination & Filters
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

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
    const getStatusName = (status) => {
        const statusMap = {
            0: 'Chờ duyệt',
            1: 'Hoạt động',
            2: 'Từ chối',
            3: 'Đã rời'
        }
        return statusMap[status] || 'Không xác định'
    }

    // Fetch club details and members
    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch club details (only once)
            if (!club) {
                const clubResponse = await getClubDetail(id)
                setClub(clubResponse.data.club)
            }

            // Build filter params
            const params = {
                page: currentPage,
                limit: 10,
                sortBy: 'role',
                sortOrder: 'asc' // Ascending with priority system (leader first)
            }

            if (filterRole !== 'all') {
                params.role = parseInt(filterRole)
            }

            if (filterStatus !== 'all') {
                params.status = parseInt(filterStatus)
            }

            // Fetch members with filters
            const membersResponse = await getClubMembers(id, params)
            console.log(membersResponse)
            setMembers(membersResponse.data.members)
            setTotalPages(membersResponse.data.pagination.totalPages)
            setTotalItems(membersResponse.data.pagination.totalItems)
        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err.message || 'Không thể tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id, currentPage, filterRole, filterStatus])

    // Handle role change
    const handleRoleChange = async (memberId, userId, newRole) => {
        try {
            setUpdating({ ...updating, [memberId]: true })

            await assignManagementRole(id, userId, parseInt(newRole))

            // Refresh data after successful update
            await fetchData()

            alert('Cập nhật vai trò thành công!')
        } catch (err) {
            console.error('Error updating role:', err)
            alert(err.message || 'Không thể cập nhật vai trò')
        } finally {
            setUpdating({ ...updating, [memberId]: false })
        }
    }

    // Xử lý sau khi gán huy hiệu thành công
    const handleBadgeSuccess = () => {
        toast.success('Đã thêm huy hiệu thành công!')
    }

    if (loading && !club) {
        return (
            <div className="admin-panel admin-panel--animate">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#3b82f6' }} />
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (error && !club) {
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

    return (
        <>
            <div className="admin-panel admin-panel--animate">
                <div className="admin-panel-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            className="admin-status-btn"
                            onClick={() => navigate(`/admin/club-detail/${id}`)}
                            title="Quay lại"
                            style={{ width: 32, height: 32 }}
                        >
                            <i className="fa-solid fa-arrow-left" />
                        </button>
                        <div>
                            <h2 className="admin-title">Quản lý thành viên</h2>
                            <p className="admin-subtitle">
                                {club?.name} - {totalItems} thành viên
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ fontSize: '14px', color: '#6b7280', marginRight: 8 }}>
                                Vai trò:
                            </label>
                            <select
                                className="admin-role-select"
                                value={filterRole}
                                onChange={(e) => {
                                    setFilterRole(e.target.value)
                                    setCurrentPage(1)
                                }}
                            >
                                <option value="all">Tất cả</option>
                                <option value="1">Chủ nhiệm</option>
                                <option value="2">Phó chủ nhiệm</option>
                                <option value="3">Thư ký</option>
                                <option value="4">Thủ quỹ</option>
                                <option value="5">Quản lý sự kiện</option>
                                <option value="0">Thành viên</option>
                            </select>
                        </div>


                    </div>
                </div>

                {/* Members Table */}
                <div className="admin-table">
                    <div className="admin-table-head">
                        <div className="admin-col" style={{ flex: 1.5 }}>Tên thành viên</div>
                        <div className="admin-col" style={{ flex: 1.5 }}>Email</div>
                        <div className="admin-col" style={{ flex: 1 }}>Vai trò</div>
                        <div className="admin-col" style={{ flex: 1 }}>Ngày tham gia</div>
                        <div className="admin-col" style={{ flex: 1 }}>Hành động</div>
                    </div>

                    <div className="admin-table-body">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ color: '#3b82f6' }} />
                            </div>
                        ) : members.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                Không tìm thấy thành viên nào
                            </div>
                        ) : (
                            members.map((member) => (
                                <div key={member._id} className="admin-row">
                                    <div className="admin-col" style={{ flex: 1.5 }}>
                                        {member.user_id?.name || 'N/A'}
                                    </div>
                                    <div className="admin-col" style={{ flex: 1.5, color: '#6b7280' }}>
                                        {member.user_id?.email || 'N/A'}
                                    </div>
                                    <div className="admin-col" style={{ flex: 1 }}>
                                        <select
                                            className="admin-role-select"
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member._id, member.user_id._id, e.target.value)}
                                            disabled={updating[member._id]}
                                            style={{
                                                color: getRoleColor(member.role),
                                                fontWeight: member.role === 1 ? 'bold' : 'normal'
                                            }}
                                        >
                                            <option value="0">Thành viên</option>
                                            <option value="1">Chủ nhiệm</option>
                                            <option value="2">Phó chủ nhiệm</option>
                                            <option value="3">Thư ký</option>
                                            <option value="4">Thủ quỹ</option>
                                            <option value="5">Quản lý sự kiện</option>
                                        </select>
                                    </div>

                                    <div className="admin-col" style={{ flex: 1, color: '#6b7280' }}>
                                        {new Date(member.joined_at).toLocaleDateString('vi-VN')}
                                    </div>
                                    {/* Hành động: Thêm huy hiệu */}
                                    <div className="admin-col" style={{ flex: 1 }}>
                                        <button
                                            className="admin-status-btn--approve"
                                            style={{ fontSize: 12, padding: '5px 12px' }}
                                            onClick={() => setBadgeModal({ open: true, member })}
                                            title="Thêm huy hiệu cho thành viên"
                                        >
                                            <i className="fa-solid fa-medal" style={{ marginRight: 4 }} />
                                            Thêm huy hiệu
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="admin-pagination" style={{ marginTop: 16 }}>
                        <button
                            className="admin-status-btn"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <i className="fa-solid fa-chevron-left" />
                        </button>

                        <span style={{ margin: '0 16px', color: '#6b7280' }}>
                            Trang {currentPage} / {totalPages}
                        </span>

                        <button
                            className="admin-status-btn"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal "Thêm huy hiệu" */}
            <AssignBadgeModal
                open={badgeModal.open}
                onClose={() => setBadgeModal({ open: false, member: null })}
                clubId={id}
                member={badgeModal.member}
                onSuccess={handleBadgeSuccess}
            />
        </>
    )
}

export default ClubMembers
