import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRedemptionHistory } from '../../api/rewardApi'
import '../../styles/Rewards.css'

const getHistory = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.transactions)) return payload.transactions
    if (Array.isArray(payload?.data?.transactions)) return payload.data.transactions
    if (Array.isArray(payload?.history)) return payload.history
    if (Array.isArray(payload?.data?.history)) return payload.data.history
    if (Array.isArray(payload?.data)) return payload.data
    return []
}

const statusText = (status) => {
    if (status === 0 || status === 'pending') return 'Pending'
    if (status === 1 || status === 'approved' || status === 'completed') return 'Approved'
    if (status === 2 || status === 'rejected' || status === 'cancelled') return 'Rejected'
    return String(status || 'Unknown')
}

const ViewRedemptionHistory = () => {
    const { clubId } = useParams()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true)
                setError('')
                const payload = await getRedemptionHistory(clubId)
                setHistory(getHistory(payload))
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Không thể tải lịch sử đổi quà')
            } finally {
                setLoading(false)
            }
        }

        if (clubId) fetchHistory()
    }, [clubId])

    return (
        <div className="rewards-page">
            <div className="rewards-shell">
                <div className="rewards-header">
                    <div>
                        <h1 className="rewards-title">View redemption history</h1>
                        <p className="rewards-subtitle">Lịch sử đổi quà theo CLB</p>
                    </div>
                    <div className="rewards-actions">
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards`}>Back to rewards</Link>
                    </div>
                </div>

                {loading && <div className="reward-loading">Đang tải lịch sử đổi quà...</div>}
                {!!error && !loading && <div className="reward-error">{error}</div>}

                {!loading && !error && history.length === 0 && (
                    <div className="reward-empty">Chưa có giao dịch đổi quà.</div>
                )}

                {!loading && !error && history.length > 0 && (
                    <table className="reward-history-table">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Reward</th>
                                <th>Số lượng</th>
                                <th>Điểm</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => {
                                const id = item._id || item.id
                                const reward = item.reward_id || item.reward || {}
                                return (
                                    <tr key={id}>
                                        <td>{new Date(item.createdAt || item.created_at || Date.now()).toLocaleString('vi-VN')}</td>
                                        <td>{reward.name || item.reward_name || 'Unknown reward'}</td>
                                        <td>{item.quantity || 1}</td>
                                        <td>{item.points_used || item.points || '-'}</td>
                                        <td>{statusText(item.status)}</td>
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

export default ViewRedemptionHistory
