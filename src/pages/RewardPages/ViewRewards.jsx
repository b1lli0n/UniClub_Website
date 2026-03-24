import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getContributionScore, getRewards } from '../../api/rewardApi'
import '../../styles/RewardsUser.css'

const getRewardList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.rewards)) return payload.rewards
    if (Array.isArray(payload?.data?.rewards)) return payload.data.rewards
    if (Array.isArray(payload?.data)) return payload.data
    return []
}

const normalizeStatus = (status) => {
    if (status === 1 || status === 'active' || status === 'approved') return 'active'
    if (status === 0 || status === 'pending') return 'pending'
    return 'inactive'
}

const getCurrentPoints = (payload) => {
    const candidate =
        payload?.contributionScore ??
        payload?.data?.contributionScore ??
        payload?.current_points ??
        payload?.currentPoints ??
        payload?.points ??
        payload?.point_balance ??
        payload?.balance ??
        payload?.data?.current_points ??
        payload?.data?.currentPoints ??
        payload?.data?.points ??
        payload?.data?.point_balance ??
        payload?.data?.balance ??
        payload?.user?.current_points ??
        payload?.user?.points ??
        payload?.member?.current_points ??
        payload?.member?.points

    const parsed = Number(candidate)
    return Number.isFinite(parsed) ? parsed : 0
}

const ViewRewards = () => {
    const navigate = useNavigate()
    const { clubId } = useParams()
    const [rewards, setRewards] = useState([])
    const [currentPoints, setCurrentPoints] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                setLoading(true)
                setError('')
                const payload = await getRewards(clubId)
                setRewards(getRewardList(payload))

                try {
                    const contributionPayload = await getContributionScore(clubId)
                    setCurrentPoints(getCurrentPoints(contributionPayload))
                } catch {
                    setCurrentPoints(getCurrentPoints(payload))
                }
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách phần thưởng')
            } finally {
                setLoading(false)
            }
        }

        if (clubId) fetchRewards()
    }, [clubId])

    const stats = useMemo(() => {
        const activeCount = rewards.filter((item) => normalizeStatus(item.status) === 'active').length
        return { total: rewards.length, active: activeCount }
    }, [rewards])

    const onBackToClub = () => {
        navigate(`/clubs/${clubId}`)
    }

    return (
        <div className="rewards-page">
            <div className="rewards-shell">
                <div className="rewards-header">
                    <div>
                        <button type="button" className="rewards-btn" onClick={onBackToClub}>Quay về trang CLB</button>
                    </div>
                    <div>
                        <h1 className="rewards-title">View rewards</h1>
                    </div>
                    <div className="rewards-actions">
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards/history`}>View redemption history</Link>
                    </div>
                </div>

                <div className="reward-points-summary">
                    <div className="reward-points-summary__label">Điểm hiện có</div>
                    <div className="reward-points-summary__value">{currentPoints.toLocaleString('vi-VN')}</div>
                </div>

                {loading && <div className="reward-loading">Đang tải rewards...</div>}
                {!!error && !loading && <div className="reward-error">{error}</div>}

                {!loading && !error && rewards.length === 0 && (
                    <div className="reward-empty">Chưa có phần thưởng nào.</div>
                )}

                {!loading && !error && rewards.length > 0 && (
                    <div className="rewards-grid">
                        {rewards.map((reward) => {
                            const rewardId = reward._id || reward.id
                            const status = normalizeStatus(reward.status)

                            return (
                                <div key={rewardId} className="reward-card">
                                    <span className={`reward-status reward-status--${status}`}>
                                        {status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive'}
                                    </span>
                                    <h3>{reward.name || reward.title || 'Reward'}</h3>
                                    <div className="reward-meta">{reward.description || 'Không có mô tả'}</div>
                                    <div className="reward-points">{reward.points_cost ?? reward.points ?? 0} điểm</div>
                                    <div className="reward-meta">Số lượng: {reward.stock ?? reward.quantity ?? 'Không giới hạn'}</div>
                                    <div className="rewards-actions">
                                        <Link className="rewards-btn" to={`/club/${clubId}/rewards/${rewardId}`}>View reward detail</Link>
                                        <Link className="rewards-btn rewards-btn--primary" to={`/club/${clubId}/rewards/${rewardId}/redeem`}>Redeem reward</Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewRewards
