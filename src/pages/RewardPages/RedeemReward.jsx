import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getContributionScore, getRedemptionHistory, redeemReward } from '../../api/rewardApi'
import '../../styles/Rewards.css'

const RedeemReward = () => {
    const navigate = useNavigate()
    const { clubId, rewardId } = useParams()
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            await redeemReward(clubId, rewardId)

            const [contributionPayload, historyPayload] = await Promise.all([
                getContributionScore(clubId),
                getRedemptionHistory(clubId, { page: 1, limit: 10 }),
            ])

            const contributionScore = Number(
                contributionPayload?.data?.contributionScore ?? contributionPayload?.contributionScore ?? 0
            )

            const historyData =
                historyPayload?.data?.data ||
                historyPayload?.data?.transactions ||
                historyPayload?.data?.history ||
                historyPayload?.transactions ||
                historyPayload?.history ||
                []

            const historyPagination =
                historyPayload?.data?.pagination ||
                historyPayload?.pagination ||
                { page: 1, limit: 10, total: Array.isArray(historyData) ? historyData.length : 0, totalPages: 1 }

            toast.success('Redeem reward thành công')
            navigate(`/club/${clubId}/rewards/history`, {
                state: {
                    contributionScore,
                    historyData: Array.isArray(historyData) ? historyData : [],
                    historyPagination,
                },
            })
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Redeem reward thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="rewards-page">
            <div className="rewards-shell">
                <div className="rewards-header">
                    <div>
                        <h1 className="rewards-title">Redeem reward</h1>
                        <p className="rewards-subtitle">Gửi yêu cầu đổi quà cho reward ID: {rewardId}</p>
                    </div>
                    <div className="rewards-actions">
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards/${rewardId}`}>Back to detail</Link>
                    </div>
                </div>

                <form className="reward-form" onSubmit={onSubmit}>
                    <div className="rewards-actions">
                        <button className="rewards-btn rewards-btn--primary" type="submit" disabled={submitting}>
                            {submitting ? 'Đang gửi...' : 'Xác nhận redeem'}
                        </button>
                        <Link className="rewards-btn" to={`/club/${clubId}/rewards`}>Huỷ</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RedeemReward
