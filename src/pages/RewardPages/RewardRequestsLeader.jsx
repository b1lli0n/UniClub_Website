import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRedemptionHistory, updateRedemptionStatus } from '../../api/rewardApi'
import '../../styles/RewardsUser.css'

const getHistory = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.transactions)) return payload.transactions
    if (Array.isArray(payload?.data?.transactions)) return payload.data.transactions
    if (Array.isArray(payload?.history)) return payload.history
    if (Array.isArray(payload?.data?.history)) return payload.data.history
    if (Array.isArray(payload?.data)) return payload.data
    return []
}

const normalizeStatus = (status) => {
    if (status === 0 || status === 'pending') return 'pending'
    if (status === 1 || status === 'approved' || status === 'completed') return 'approved'
    if (status === 2 || status === 'rejected' || status === 'cancelled') return 'rejected'
    return String(status || 'unknown')
}

const statusLabel = (status) => {
    const normalized = normalizeStatus(status)
    if (normalized === 'pending') return 'Pending'
    if (normalized === 'approved') return 'Approved'
    if (normalized === 'rejected') return 'Rejected'
    return normalized
}

const RewardRequestsLeader = () => {
    const params = useParams()
    const clubId = params.clubId || localStorage.getItem('clubId')
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingId, setUpdatingId] = useState(null)

    const pendingRequests = useMemo(
        () => history.filter((item) => normalizeStatus(item.status) === 'pending'),
        [history]
    )

    const fetchHistory = async () => {
        if (!clubId) return
        try {
            setLoading(true)
            setError('')
            const payload = await getRedemptionHistory(clubId)
            setHistory(getHistory(payload))
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách yêu cầu đổi thưởng')
            setHistory([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clubId])

    const updateStatus = async (transactionId, nextStatus) => {
        if (!clubId || !transactionId) return
        setUpdatingId(transactionId)
        try {
            await updateRedemptionStatus(clubId, transactionId, { status: nextStatus })
            await fetchHistory()
        } catch (err) {
            if (nextStatus === 'approved' || nextStatus === 'rejected') {
                const fallbackStatus = nextStatus === 'approved' ? 1 : 2
                try {
                    await updateRedemptionStatus(clubId, transactionId, { status: fallbackStatus })
                    await fetchHistory()
                    return
                } catch (fallbackError) {
                    setError(
                        fallbackError?.response?.data?.message ||
                        fallbackError?.message ||
                        'Không thể cập nhật trạng thái yêu cầu'
                    )
                }
            } else {
                setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái yêu cầu')
            }
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="rewards-page">
            <div className="rewards-shell">
                <div className="rewards-header">
                    <div>
                        <h1 className="rewards-title">Request Reward</h1>
                        <p className="rewards-subtitle">Duyet yeu cau doi thuong cho CLB {clubId || '-'}</p>
                    </div>
                </div>

                {loading && <div className="reward-loading">Dang tai danh sach yeu cau...</div>}
                {!!error && !loading && <div className="reward-error">{error}</div>}

                {!loading && !error && pendingRequests.length === 0 && (
                    <div className="reward-empty">Khong co yeu cau nao dang cho duyet.</div>
                )}

                {!loading && !error && pendingRequests.length > 0 && (
                    <table className="reward-history-table">
                        <thead>
                            <tr>
                                <th>Thoi gian</th>
                                <th>Thanh vien</th>
                                <th>Reward</th>
                                <th>Diem</th>
                                <th>Trang thai</th>
                                <th>Hanh dong</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.map((item) => {
                                const id = item._id || item.id
                                const reward = item.reward_id || item.reward || {}
                                const member = item.membership_id?.user_id || item.user || item.member || {}
                                const isUpdating = updatingId === id

                                return (
                                    <tr key={id}>
                                        <td>{new Date(item.createdAt || item.created_at || Date.now()).toLocaleString('vi-VN')}</td>
                                        <td>{member.full_name || member.fullName || member.name || member.email || 'Unknown'}</td>
                                        <td>{reward.name || item.reward_name || 'Unknown reward'}</td>
                                        <td>{item.points_used || item.points_spent || item.points || '-'}</td>
                                        <td>{statusLabel(item.status)}</td>
                                        <td>
                                            <div className="rewards-actions">
                                                <button
                                                    className="rewards-btn rewards-btn--primary"
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() => updateStatus(id, 'approved')}
                                                >
                                                    Duyet
                                                </button>
                                                <button
                                                    className="rewards-btn"
                                                    type="button"
                                                    disabled={isUpdating}
                                                    onClick={() => updateStatus(id, 'rejected')}
                                                >
                                                    Tu choi
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default RewardRequestsLeader
