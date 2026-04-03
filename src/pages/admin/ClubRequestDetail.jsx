import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { getClubCreationRequestDetail, updateClubStatus } from '../../api/adminapi'
import { toast } from 'react-toastify'
import { ASSET_BASE } from '../../api/api'

const buildLogoSrc = (logoUrl) => {
    if (!logoUrl || typeof logoUrl !== 'string') return ''
    if (logoUrl.startsWith('http')) return logoUrl
    console.log('Building logo src from:', logoUrl)
    return `${ASSET_BASE}${logoUrl}`
}

const ClubRequestDetail = () => {
    const { id } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()

    const [registration, setRegistration] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRequestDetail = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await getClubCreationRequestDetail(id)
            console.log('API Response:', response)

            // Handle different response structures
            let requestData = null

            if (response.club) {
                // Trường hợp phổ biến: interceptor trả về object có key 'club'
                console.log('✓ Found response.club')
                requestData = response.club
            } else if (response.data && response.data.club) {
                // Trường hợp nested data.club
                console.log('✓ Found response.data.club')
                requestData = response.data.club
            } else if (response.request) {
                requestData = response.request
            } else if (response.data) {
                // Fallback cũ
                requestData = response.data
            } else {
                requestData = response
            }

            console.log('Final Request Data:', requestData)

            // Map API response to component structure
            const mappedRequest = {
                id: requestData._id || requestData.id,
                club: requestData.name || requestData.clubName || 'CLB Unknown',
                logo_url: requestData.logo_url,
                // Ưu tiên leader_id.name theo xác nhận của bạn
                sender: requestData.leader_id?.name || requestData.creator?.name || requestData.creatorName || 'Unknown',
                date: requestData.createdAt ? new Date(requestData.createdAt).toLocaleDateString('vi-VN') :
                    requestData.created_at ? new Date(requestData.created_at).toLocaleDateString('vi-VN') : '19/01/2026',
                status: requestData.status || 'pending',
                description: requestData.description || 'Không có mô tả',
                category: requestData.category || 'Chưa phân loại',
                contactEmail: requestData.contactEmail || requestData.leader_id?.email || requestData.creator?.email || '',
                contactPhone: requestData.contactPhone || '',
                membersCount: requestData.member_total || requestData.member_count || 0
            }

            console.log('Mapped request:', mappedRequest)
            setRegistration(mappedRequest)
        } catch (err) {
            console.error('Error fetching request detail:', err)

            // Fallback to mock data or state data
            const fallbackData = state?.registration || {
                id: id,
                club: 'CLB Unknown',
                logo_url: state?.registration?.logo_url || '',
                sender: 'Unknown',
                date: '19/01/2026',
                status: 'pending',
                description: 'Không có mô tả',
                category: 'Chưa phân loại'
            }

            setRegistration(fallbackData)
            setError(err.message || 'Không thể tải thông tin yêu cầu')
            toast.warning('Không thể tải thông tin từ máy chủ. Đang hiển thị dữ liệu tạm thời.')
        } finally {
            setLoading(false)
        }
    }, [id, state?.registration])

    // Fetch request detail from API
    useEffect(() => {
        fetchRequestDetail()
    }, [fetchRequestDetail])

    const updateStatus = async (statusString) => {
        try {
            // ✅ MAPPING ĐÚNG THEO BACKEND:
            // Approve: status 1 (active)
            // Reject: status 3 (rejected) - KHÔNG PHẢI 2!
            const statusNumber = statusString === 'approved' ? 1 : 3

            console.log(`Updating club ${id} to status ${statusNumber}`)
            await updateClubStatus(id, statusNumber)

            // Update local state
            setRegistration((prev) => ({ ...prev, status: statusString }))

            const statusText = statusString === 'approved' ? 'đã duyệt' : 'đã từ chối'
            toast.success(`Yêu cầu ${statusText} thành công`)
        } catch (err) {
            console.error('Error updating status:', err)
            toast.error('Không thể cập nhật trạng thái yêu cầu')
        }
    }


    return (
        <div className="admin-panel admin-panel--animate">
            <div className="admin-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        className="admin-status-btn"
                        onClick={() => navigate(-1)}
                        title="Quay lại"
                        style={{ width: 32, height: 32 }}
                    >
                        <i className="fa-solid fa-arrow-left" />
                    </button>
                    <div>
                        <h2 className="admin-title">Chi tiết đăng ký</h2>
                        <p className="admin-subtitle">Xem thông tin chi tiết và duyệt yêu cầu tạo câu lạc bộ</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 16 }} />
                    <p>Đang tải thông tin yêu cầu...</p>
                </div>
            ) : !registration ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, marginBottom: 16 }} />
                    <p>Không tìm thấy thông tin yêu cầu</p>
                    <button
                        className="admin-status-btn admin-status-btn--approve"
                        onClick={() => navigate(-1)}
                        style={{ marginTop: 16, padding: '8px 16px' }}
                    >
                        Quay lại
                    </button>
                </div>
            ) : (
                <div className="admin-row-details">
                    <h4 className="admin-detail-section-title">Thông tin yêu cầu</h4>
                    {error && (
                        <div style={{ marginBottom: 12, color: '#b45309', fontSize: 12 }}>
                            {error}
                        </div>
                    )}
                    <div className="admin-detail-layout">
                        <div className="admin-detail-grid">
                            <div className="admin-detail-item">
                                <div className="admin-detail-label">Tên câu lạc bộ</div>
                                <div className="admin-detail-value">{registration.club}</div>
                            </div>
                            <div className="admin-detail-item">
                                <div className="admin-detail-label">Người gửi yêu cầu</div>
                                <div className="admin-detail-value">{registration.sender}</div>
                            </div>
                            <div className="admin-detail-item">
                                <div className="admin-detail-label">Ngày tạo</div>
                                <div className="admin-detail-value">{registration.date}</div>
                            </div>
                            <div className="admin-detail-item">
                                <div className="admin-detail-label">Số lượng thành viên</div>
                                <div className="admin-detail-value">{registration.membersCount}</div>
                            </div>
                            <div className="admin-detail-item">
                                <div className="admin-detail-label">Trạng thái</div>
                                <div className="admin-detail-value">
                                    {registration.status === 'pending' ? (
                                        <span className="admin-status" style={{ color: '#d97706', fontWeight: 600 }}>
                                            Đang chờ duyệt
                                        </span>
                                    ) : (
                                        <span className={`admin-status admin-status--${registration.status}`}>
                                            {registration.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {registration.category && (
                                <div className="admin-detail-item">
                                    <div className="admin-detail-label">Danh mục</div>
                                    <div className="admin-detail-value">{registration.category}</div>
                                </div>
                            )}
                            {registration.contactEmail && (
                                <div className="admin-detail-item">
                                    <div className="admin-detail-label">Email liên hệ</div>
                                    <div className="admin-detail-value">{registration.contactEmail}</div>
                                </div>
                            )}
                            {registration.contactPhone && (
                                <div className="admin-detail-item">
                                    <div className="admin-detail-label">Số điện thoại</div>
                                    <div className="admin-detail-value">{registration.contactPhone}</div>
                                </div>
                            )}
                            <div className="admin-detail-item" style={{ gridColumn: '1 / -1' }}>
                                <div className="admin-detail-label">Nội dung chi tiết</div>
                                <div className="admin-detail-value" style={{ lineHeight: 1.6 }}>
                                    {registration.description || 'Nội dung mô tả về câu lạc bộ, mục tiêu hoạt động và kế hoạch phát triển.'}
                                </div>
                            </div>
                        </div>

                        <div className="admin-logo-panel">
                            <div className="admin-detail-label">Logo câu lạc bộ</div>
                            {registration.logo_url ? (
                                <img
                                    className="admin-logo-preview"
                                    src={buildLogoSrc(registration.logo_url)}
                                    alt={registration.club}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null
                                        e.currentTarget.src = '/images/clubs/default.png'
                                    }}
                                />
                            ) : (
                                <div className="admin-logo-empty">Chưa có logo</div>
                            )}
                            <i>
                                {registration.logo_url ?  registration.logo_url: 'Yêu cầu này không có logo đính kèm.'}
                            </i>
                        </div>
                    </div>

                    {registration.status === 'pending' && (
                        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                className="admin-status-btn admin-status-btn--approve"
                                style={{ width: 'auto', padding: '0 16px', height: 36, gap: 8 }}
                                onClick={() => updateStatus('approved')}
                            >
                                <i className="fa-solid fa-check" />
                                <span>Duyệt yêu cầu</span>
                            </button>
                            <button
                                type="button"
                                className="admin-status-btn admin-status-btn--reject"
                                style={{ width: 'auto', padding: '0 16px', height: 36, gap: 8 }}
                                onClick={() => updateStatus('rejected')}
                            >
                                <i className="fa-solid fa-xmark" />
                                <span>Từ chối</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ClubRequestDetail
