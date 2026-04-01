import React from 'react';
import {
  BarChart3,
  BarChart2,
  Calendar,
  CalendarClock,
  ListTree,
  Pencil,
  Lock,
  Sparkles,
  RefreshCw,
  Award,
} from 'lucide-react';

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PollDetail = ({
  loadingDetail,
  detail,
  selectedPollId,
  onOpenVote,
  canManage,
  onEditPoll,
  onClosePoll,
  closingPoll,
}) => {
  if (loadingDetail) {
    return (
      <div className="pm-glass-panel pm-glass-panel--detail">
        <div className="pm-detail-loading">
          <div className="pm-detail-shimmer" />
          <p>Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (!selectedPollId || !detail) {
    return (
      <div className="pm-glass-panel pm-glass-panel--detail">
        <div className="pm-detail-empty">
          <Sparkles className="pm-detail-empty-icon" size={40} strokeWidth={1.2} />
          <p className="pm-detail-empty-title">Chọn một poll</p>
          <p className="pm-detail-empty-desc">Chọn poll bên trái để xem kết quả bình chọn.</p>
        </div>
      </div>
    );
  }

  const poll = detail.poll;
  const options = detail.options || [];
  const totalVotes = detail.total_votes ?? 0;
  const typeLabel = Number(poll?.type) === 0 ? 'Chọn một' : 'Chọn nhiều';
  const isOpen = poll?.status === 'open';
  const hasMinPoints = poll?.min_points_required != null && poll?.min_points_required !== '';

  return (
    <div className="pm-glass-panel pm-glass-panel--detail">
      <div className="pm-detail-header">
        <div className="pm-detail-title-bar">
          <h2 className="pm-detail-title">{poll?.title}</h2>
          <div className="pm-detail-actions">
            {canManage ? (
              <>
                {isOpen ? (
                  <button type="button" className="pm-detail-btn-ghost" onClick={onEditPoll}>
                    <Pencil size={14} strokeWidth={2.2} aria-hidden />
                    <span>Chỉnh sửa</span>
                  </button>
                ) : null}
                {isOpen ? (
                  <button
                    type="button"
                    className="pm-detail-btn-ghost"
                    onClick={onClosePoll}
                    disabled={closingPoll}
                  >
                    <Lock size={14} strokeWidth={2.2} aria-hidden />
                    <span>{closingPoll ? 'Đang đóng...' : 'Đóng poll'}</span>
                  </button>
                ) : null}
                <button type="button" className="pm-detail-btn-primary" onClick={() => onOpenVote(selectedPollId)}>
                  <BarChart3 size={15} strokeWidth={2.2} aria-hidden />
                  <span>Bình chọn / Chi tiết</span>
                </button>
              </>
            ) : (
              <button type="button" className="pm-detail-btn-primary" onClick={() => onOpenVote(selectedPollId)}>
                <BarChart3 size={15} strokeWidth={2.2} aria-hidden />
                <span>Bình chọn / Chi tiết</span>
              </button>
            )}
          </div>
        </div>
        <div className="pm-detail-status-row">
          <span className={`pm-detail-status ${isOpen ? 'is-open' : 'is-closed'}`}>
            {isOpen ? 'Đang mở' : 'Đã đóng'}
          </span>
        </div>

        <div className="pm-detail-meta-grid">
          <div className="pm-detail-meta-item">
            <Calendar className="pm-detail-meta-icon" size={18} strokeWidth={2} aria-hidden />
            <div className="pm-detail-meta-text">
              <span className="pm-detail-meta-label">Bắt đầu</span>
              <span className="pm-detail-meta-value">{formatDateTime(poll?.start_date)}</span>
            </div>
          </div>
          <div className="pm-detail-meta-item">
            <CalendarClock className="pm-detail-meta-icon" size={18} strokeWidth={2} aria-hidden />
            <div className="pm-detail-meta-text">
              <span className="pm-detail-meta-label">Hết hạn</span>
              <span className="pm-detail-meta-value">{formatDateTime(poll?.end_date)}</span>
            </div>
          </div>
          <div className="pm-detail-meta-item">
            <ListTree className="pm-detail-meta-icon" size={18} strokeWidth={2} aria-hidden />
            <div className="pm-detail-meta-text">
              <span className="pm-detail-meta-label">Loại poll</span>
              <span className="pm-detail-meta-value">{typeLabel}</span>
            </div>
          </div>
          <div className="pm-detail-meta-item">
            <BarChart2 className="pm-detail-meta-icon" size={18} strokeWidth={2} aria-hidden />
            <div className="pm-detail-meta-text">
              <span className="pm-detail-meta-label">Tổng phiếu</span>
              <span className="pm-detail-meta-value">{totalVotes.toLocaleString('vi-VN')}</span>
            </div>
          </div>
          {hasMinPoints ? (
            <div className="pm-detail-meta-item">
              <Award className="pm-detail-meta-icon" size={18} strokeWidth={2} aria-hidden />
              <div className="pm-detail-meta-text">
                <span className="pm-detail-meta-label">Điểm tối thiểu</span>
                <span className="pm-detail-meta-value">{Number(poll.min_points_required).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          ) : null}
          <div className="pm-detail-meta-item">
            <RefreshCw className="pm-detail-meta-icon" size={18} strokeWidth={2} aria-hidden />
            <div className="pm-detail-meta-text">
              <span className="pm-detail-meta-label">Đổi lựa chọn sau vote</span>
              <span className="pm-detail-meta-value">{poll?.allow_change_vote ? 'Có' : 'Không'}</span>
            </div>
          </div>
        </div>

        {poll?.description ? <p className="pm-detail-desc">{poll.description}</p> : null}
      </div>

      <div className="pm-detail-results">
        {options.map((opt) => {
          const width = Math.min(100, Number(opt.percentage || 0));
          return (
            <div
              key={String(opt.option_id)}
              className={`pm-detail-opt ${opt.is_leading ? 'is-leading' : ''}`}
            >
              <div className="pm-detail-opt-head">
                <span className="pm-detail-opt-label">{opt.label}</span>
                <span className="pm-detail-opt-pct">{opt.percentage ?? 0}%</span>
              </div>
              <div className="pm-detail-opt-track">
                <div className="pm-detail-opt-fill" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollDetail;
