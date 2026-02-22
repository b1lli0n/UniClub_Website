import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { redeemReward } from '../../api/rewardApi'
import '../../styles/Rewards.css'

const RedeemReward = () => {
    const navigate = useNavigate()
    const { clubId, rewardId } = useParams()
    const [quantity, setQuantity] = useState(1)
    const [note, setNote] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            await redeemReward(clubId, rewardId, {
                quantity: Number(quantity),
                note,
            })
            toast.success('Redeem reward thành công')
            navigate(`/club/${clubId}/rewards/history`)
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
                    <label>
                        Số lượng
                        <input
                            className="reward-input"
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Ghi chú
                        <textarea
                            className="reward-textarea"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập ghi chú nếu có"
                        />
                    </label>

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
