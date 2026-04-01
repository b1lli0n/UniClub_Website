import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getRewardDetail, getRewards, getUserRedemptionHistory, redeemReward } from '../../api/rewardApi'
import { getPointsHistory } from '../../api/pointsApi'
import ClubDetailNav from '../../components/clubs/ClubDetailNav'
import ConfirmModal from '../../components/modals/ConfirmModal'
import '../../styles/Rewards.css'

const getReward = (payload) => {
    if (!payload) return null
    if (payload.reward) return payload.reward
    if (payload.data?.reward) return payload.data.reward
    if (payload.data && !Array.isArray(payload.data)) return payload.data
    return payload
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

const getCurrentRewardPoints = (payload) => {
    const root = payload?.data || payload || {}
    const total = Number(root?.totalReward)
    return Number.isFinite(total) ? total : 0
}

const ViewRewardDetail = () => {
    const { clubId, rewardId } = useParams()
    const [reward, setReward] = useState(null)
    const [currentPoints, setCurrentPoints] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [redeeming, setRedeeming] = useState(false)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true)
                setError('')
                const [rewardPayload, pointPayload] = await Promise.all([
                    getRewardDetail(clubId, rewardId),
                    getPointsHistory(clubId),
                ])

                setReward(getReward(rewardPayload))
                setCurrentPoints(getCurrentRewardPoints(pointPayload))
            } catch (err) {
                if (err?.response?.status === 404) {
                    setError('Phần thưởng không tồn tại hoặc đã ngừng hoạt động')
                } else {
                    setError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết phần thưởng')
                }
            } finally {
                setLoading(false)
            }
        }

        if (clubId && rewardId) fetchDetail()
    }, [clubId, rewardId])

    const status = useMemo(() => normalizeStatus(reward), [reward])
    const pointsRequired = Number(reward?.points_required ?? reward?.points_cost ?? reward?.points ?? 0)
    const stock = reward?.stock ?? reward?.quantity
    const isOutOfStock = Number.isFinite(Number(stock)) && Number(stock) <= 0
    const notEnoughPoints = currentPoints < pointsRequired
    const isInactive = status !== 'active'
    const canRedeem = !isOutOfStock && !notEnoughPoints && !isInactive

    const closeConfirm = () => {
        if (!redeeming) setShowConfirm(false)
    }

    const handleRedeem = async () => {
        try {
            setRedeeming(true)
            await redeemReward(clubId, rewardId)

            const [pointPayload, rewardPayload] = await Promise.all([
                getPointsHistory(clubId),
                getRewardDetail(clubId, rewardId),
                getRewards(clubId, { page: 1, limit: 10 }),
                getUserRedemptionHistory(clubId, { page: 1, limit: 10, status: 1 }),
            ])

            setCurrentPoints(getCurrentRewardPoints(pointPayload))
            setReward(getReward(rewardPayload))
            toast.success('Đổi thưởng thành công, điểm đã được trừ ngay')
            setShowConfirm(false)
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
                        <h1 className="rewards-title">View reward detail</h1>
                        <p className="rewards-subtitle">Reward ID: {rewardId}</p>
                    </div>
                    <div className="rewards-actions">
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards`}>Back to rewards</Link>
                        <button
                            type="button"
                            className="rewards-btn rewards-btn--primary"
                            onClick={() => setShowConfirm(true)}
                            disabled={!canRedeem}
                        >
                            {isInactive ? 'Chưa khả dụng' : isOutOfStock ? 'Hết hàng' : notEnoughPoints ? 'Không đủ điểm' : 'Redeem reward'}
                        </button>
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
                            <span>{pointsRequired} điểm</span>
                        </div>
                        <div className="reward-detail-row">
                            <strong>Điểm hiện có</strong>
                            <span>{currentPoints} điểm</span>
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

            <ConfirmModal
                show={showConfirm}
                onHide={closeConfirm}
                onConfirm={handleRedeem}
                title="Xác nhận đổi quà"
                message={`Bạn có chắc muốn đổi \"${reward?.name || reward?.title || 'phần thưởng này'}\" không? Điểm sẽ bị trừ ngay.`}
                confirmText="Xác nhận redeem"
                cancelText="Huỷ"
                type="warning"
                loading={redeeming}
            />
        </div>
    )
}

export default ViewRewardDetail
