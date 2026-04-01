import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getRewards, getUserRedemptionHistory, redeemReward } from '../../api/rewardApi'
import { getMembershipRewardPoint, getPointsHistory } from '../../api/pointsApi'
import '../../styles/RewardsUser.css'
import ClubDetailNav from '../../components/ClubDetailNav'
import ConfirmModal from '../../components/ConfirmModal'

const getRewardList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.rewards)) return payload.rewards
    if (Array.isArray(payload?.data?.rewards)) return payload.data.rewards
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data?.rewards)) return payload.data.data.rewards
    return []
}

const normalizeStatus = (reward) => {
    const status = reward?.status
    const isActive = reward?.is_active ?? reward?.isActive

    if (isActive === true || isActive === 1 || isActive === '1' || isActive === 'true') return 'active'
    if (isActive === false || isActive === 0 || isActive === '0' || isActive === 'false') return 'inactive'

    if (status === 1 || status === '1' || status === 'active' || status === 'approved') return 'active'
    if (status === 0 || status === '0' || status === 'pending') return 'pending'
    return 'inactive'
}

const getPointsHistoryValues = (payload) => {
    const root = payload?.data || payload || {}
    const totalReward = Number(root?.totalReward)
    const membershipId =
        root?.membershipId ||
        root?.membership?._id ||
        root?.membership?.id ||
        null

    return {
        totalReward: Number.isFinite(totalReward) ? totalReward : 0,
        membershipId,
    }
}

const ViewRewards = () => {
    const navigate = useNavigate()
    const { clubId } = useParams()
    const [rewards, setRewards] = useState([])
    const [currentPoints, setCurrentPoints] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedReward, setSelectedReward] = useState(null)
    const [redeeming, setRedeeming] = useState(false)

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                setLoading(true)
                setError('')
                const payload = await getRewards(clubId, { page, limit, search: search.trim() || undefined })
                setRewards(getRewardList(payload))
                const pg = payload?.pagination || payload?.data?.pagination || {}
                setTotalPages(Number(pg.totalPages || pg.pages) || 1)

                // Ưu tiên điểm hiện có từ points/history theo BE mới.
                try {
                    const historyRes = await getPointsHistory(clubId)
                    const history = getPointsHistoryValues(historyRes)

                    setCurrentPoints(history.totalReward)

                    // Fallback: khi totalReward chưa có nhưng đã có membershipId
                    if (history.totalReward <= 0 && history.membershipId) {
                        const rewardPointRes = await getMembershipRewardPoint(history.membershipId)
                        const directPoint =
                            rewardPointRes?.total_reward_point ??
                            rewardPointRes?.data?.total_reward_point ??
                            rewardPointRes?.data?.points ??
                            0
                        setCurrentPoints(Number(directPoint) || 0)
                    }
                } catch {
                    setCurrentPoints(0)
                }
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách phần thưởng')
            } finally {
                setLoading(false)
            }
        }

        if (!clubId) {
            setError('clubId không hợp lệ')
            setLoading(false)
            return
        }
        fetchRewards()
    }, [clubId, page, limit, search])

    const onBackToClub = () => {
        navigate(`/clubs/${clubId}`)
    }

    const closeRedeemModal = () => {
        if (!redeeming) setSelectedReward(null)
    }

    const handleRedeem = async () => {
        const selectedRewardId = selectedReward?._id || selectedReward?.id
        if (!selectedRewardId) return

        try {
            setRedeeming(true)
            await redeemReward(clubId, selectedRewardId)

            const [pointPayload, rewardsPayload] = await Promise.all([
                getPointsHistory(clubId),
                getRewards(clubId, { page, limit, search: search.trim() || undefined }),
                getUserRedemptionHistory(clubId, { page: 1, limit: 10, status: 1 }),
            ])

            const history = getPointsHistoryValues(pointPayload)
            setCurrentPoints(history.totalReward)
            setRewards(getRewardList(rewardsPayload))

            toast.success('Đổi thưởng thành công, điểm đã được trừ ngay')
            setSelectedReward(null)
        } catch (err) {
            if (err?.response?.status === 400 || err?.status === 400) {
                const current = err?.response?.data?.currentPoints ?? err?.currentPoints
                const required = err?.response?.data?.requiredPoints ?? err?.requiredPoints
                if (current !== undefined && required !== undefined) {
                    toast.error(`Không đủ điểm để đổi quà (${current}/${required})`)
                } else {
                    toast.error(err?.response?.data?.message || err?.message || 'Redeem reward thất bại')
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || 'Redeem reward thất bại')
            }
        } finally {
            setRedeeming(false)
        }
    }

    return (
        <div className="rewards-page">
            <ClubDetailNav />
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
                    <div className="reward-points-summary__value">
                        {error ? <span style={{ color: 'red' }}>{error}</span> : currentPoints.toLocaleString('vi-VN')}
                    </div>
                </div>
                <div className="rewards-actions" style={{ marginBottom: 12 }}>
                    <input
                        className="reward-input"
                        placeholder="Tìm reward..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                {loading && <div className="reward-loading">Đang tải rewards...</div>}
                {!!error && !loading && <div className="reward-error">{error}</div>}

                {!loading && !error && rewards.length === 0 && (
                    <div className="reward-empty">Chưa có phần thưởng nào.</div>
                )}

                {!loading && !error && rewards.length > 0 && (
                    <>
                        <div className="rewards-grid">
                            {rewards.map((reward) => {
                                const rewardId = reward._id || reward.id
                                const status = normalizeStatus(reward)
                                const pointsRequired = Number(reward.points_required ?? reward.points_cost ?? reward.points ?? 0)
                                const stock = reward.stock ?? reward.quantity
                                const isOutOfStock = Number.isFinite(Number(stock)) && Number(stock) <= 0
                                const notEnoughPoints = currentPoints < pointsRequired
                                const isInactive = status !== 'active'
                                const canRedeem = !notEnoughPoints && !isOutOfStock && !isInactive

                                return (
                                    <div key={rewardId} className="reward-card">
                                        <span className={`reward-status reward-status--${status}`}>
                                            {status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : 'Inactive'}
                                        </span>
                                        <h3>{reward.name || reward.title || 'Reward'}</h3>
                                        <div className="reward-meta">{reward.description || 'Không có mô tả'}</div>
                                        <div className="reward-points">{pointsRequired} điểm</div>
                                        <div className="reward-meta">Số lượng: {stock ?? 'Không giới hạn'}</div>
                                        <div className="rewards-actions">
                                            <Link className="rewards-btn" to={`/club/${clubId}/rewards/${rewardId}`}>View reward detail</Link>
                                            {canRedeem ? (
                                                <button
                                                    type="button"
                                                    className="rewards-btn rewards-btn--primary"
                                                    onClick={() => setSelectedReward(reward)}
                                                >
                                                    Redeem reward
                                                </button>
                                            ) : (
                                                <button type="button" className="rewards-btn rewards-btn--primary" disabled>
                                                    {isInactive ? 'Chưa khả dụng' : isOutOfStock ? 'Hết hàng' : 'Không đủ điểm'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="rewards-actions" style={{ marginTop: 12 }}>
                            <button className="rewards-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                Trang trước
                            </button>
                            <span>Trang {page}/{totalPages}</span>
                            <button className="rewards-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                Trang sau
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal
                show={!!selectedReward}
                onHide={closeRedeemModal}
                onConfirm={handleRedeem}
                title="Xác nhận đổi quà"
                message={`Bạn có chắc muốn đổi \"${selectedReward?.name || selectedReward?.title || 'phần thưởng này'}\" không? Điểm sẽ bị trừ ngay.`}
                confirmText="Xác nhận redeem"
                cancelText="Huỷ"
                type="warning"
                loading={redeeming}
            />
        </div>
    )
}

export default ViewRewards
