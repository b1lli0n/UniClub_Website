import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRewardDetail } from '../../api/rewardApi'
import '../../styles/Rewards.css'

const getReward = (payload) => {
    if (!payload) return null
    if (payload.reward) return payload.reward
    if (payload.data?.reward) return payload.data.reward
    if (payload.data && !Array.isArray(payload.data)) return payload.data
    return payload
}

const normalizeStatus = (status) => {
    if (status === 1 || status === 'active' || status === 'approved') return 'active'
    if (status === 0 || status === 'pending') return 'pending'
    return 'inactive'
}

const ViewRewardDetail = () => {
    const { clubId, rewardId } = useParams()
    const [reward, setReward] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true)
                setError('')
                const payload = await getRewardDetail(clubId, rewardId)
                setReward(getReward(payload))
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết phần thưởng')
            } finally {
                setLoading(false)
            }
        }

        if (clubId && rewardId) fetchDetail()
    }, [clubId, rewardId])

    const status = useMemo(() => normalizeStatus(reward?.status), [reward])

    return (
        <div className="rewards-page">
            <div className="rewards-shell">
                <div className="rewards-header">
                    <div>
                        <h1 className="rewards-title">View reward detail</h1>
                        <p className="rewards-subtitle">Reward ID: {rewardId}</p>
                    </div>
                    <div className="rewards-actions">
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards`}>Back to rewards</Link>
                        <Link className="rewards-btn rewards-btn--primary" to={`/club/${clubId}/rewards/${rewardId}/redeem`}>Redeem reward</Link>
                    </div>
                </div>

                {loading && <div className="reward-loading">Đang tải reward detail...</div>}
                {!!error && !loading && <div className="reward-error">{error}</div>}

                {!loading && !error && reward && (
                    <div className="reward-detail">
                        <span className={`reward-status reward-status--${status}`}>
                            {status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive'}
                        </span>

                        <div className="reward-detail-row">
                            <strong>Tên phần thưởng</strong>
                            <span>{reward.name || reward.title || '-'}</span>
                        </div>
                        <div className="reward-detail-row">
                            <strong>Mô tả</strong>
                            <span>{reward.description || '-'}</span>
                        </div>
                        <div className="reward-detail-row">
                            <strong>Điểm đổi</strong>
                            <span>{reward.points_cost ?? reward.points ?? 0} điểm</span>
                        </div>
                        <div className="reward-detail-row">
                            <strong>Số lượng</strong>
                            <span>{reward.stock ?? reward.quantity ?? 'Không giới hạn'}</span>
                        </div>
                        <div className="reward-detail-row">
                            <strong>Điều kiện</strong>
                            <span>{reward.conditions || reward.terms || 'Không có'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewRewardDetail
