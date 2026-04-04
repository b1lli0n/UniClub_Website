<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getPollDetail,
  votePoll,
  closePoll,
  updatePoll,
} from '../api/pollApi';
import '../styles/PollVoteModal.css';

const toLocalInput = (d) => {
  if (!d) return '';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
=======
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getPollDetail, votePoll } from '../api/pollApi';
import { isPollVotingOpen } from '../utils/pollVoting';
import '../styles/PollVoteModal.css';

const formatDateTime = (input) => {
  if (!input) return '—';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
};

const PollVoteModal = ({
  clubId,
  pollId,
  open,
  onClose,
<<<<<<< HEAD
  isLeader,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editEnd, setEditEnd] = useState('');
  const [showEditEnd, setShowEditEnd] = useState(false);

  const load = useCallback(async () => {
    if (!clubId || !pollId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await getPollDetail(clubId, pollId);
      if (res.success && res.data) {
        setDetail(res.data);
        const mv = res.data.my_vote?.option_ids?.map((id) => String(id)) || [];
        setSelected(mv);
        setEditEnd(toLocalInput(res.data.poll?.end_date));
      } else {
        setErr(res.message || 'Không tải được poll');
      }
    } catch (e) {
      setErr(e?.message || 'Không tải được poll');
=======
  onUpdated,
  userPoints = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  const loadDetail = useCallback(async () => {
    if (!clubId || !pollId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getPollDetail(clubId, pollId);
      if (res?.success && res?.data) {
        const data = res.data;
        setDetail(data);
        const picked = (data?.my_vote?.option_ids || []).map((id) => String(id));
        setSelected(picked);
      } else {
        setError(res?.message || 'Không tải được poll');
      }
    } catch (e) {
      setError(e?.message || 'Không tải được poll');
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
    } finally {
      setLoading(false);
    }
  }, [clubId, pollId]);

  useEffect(() => {
<<<<<<< HEAD
    if (open && clubId && pollId) {
      load();
    }
  }, [open, clubId, pollId, load]);

  if (!open) return null;
=======
    if (open) {
      loadDetail();
    }
  }, [open, loadDetail]);
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9

  const poll = detail?.poll;
  const options = detail?.options || [];
  const totalVotes = detail?.total_votes ?? 0;
<<<<<<< HEAD
  const myVoteIds = (detail?.my_vote?.option_ids || []).map((id) => String(id));
  const isOpen = poll?.status === 'open';
  const isSingle = Number(poll?.type) === 0;
  const canVote =
    isOpen &&
    totalVotes >= 0 &&
    (!myVoteIds.length || poll?.allow_change_vote);

  const toggleOption = (oid) => {
    const s = String(oid);
    if (isSingle) {
      setSelected([s]);
    } else {
      setSelected((prev) =>
        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
      );
    }
=======
  const isSingle = Number(poll?.type) === 0;
  const votingOpen = isPollVotingOpen(poll);
  const nowMs = Date.now();
  const startMs = poll?.start_date ? new Date(poll.start_date).getTime() : null;
  const endMs = poll?.end_date ? new Date(poll.end_date).getTime() : null;
  const dbClosed = Number(poll?.status_code) === 1;
  const myVoteIds = (detail?.my_vote?.option_ids || []).map((id) => String(id));
  const alreadyVotedLocked = myVoteIds.length > 0 && !poll?.allow_change_vote;
  const pointRestricted = poll?.min_points_required != null;
  const notEnoughPoints =
    pointRestricted &&
    userPoints != null &&
    Number(userPoints) < Number(poll.min_points_required);

  const disableVote = !votingOpen || alreadyVotedLocked || notEnoughPoints;
  const canChangeAfterVote = !!poll?.allow_change_vote;
  const hasMyVote = myVoteIds.length > 0;

  const submitLabel = useMemo(() => {
    if (submitting) return 'Đang gửi...';
    if (alreadyVotedLocked) return 'Đã bình chọn';
    if (hasMyVote && canChangeAfterVote) return 'Cập nhật phiếu';
    return 'Bình chọn ngay';
  }, [submitting, alreadyVotedLocked, hasMyVote, canChangeAfterVote]);

  const disableReason = useMemo(() => {
    if (dbClosed) return 'Poll đã được đóng';
    if (startMs != null && !Number.isNaN(startMs) && nowMs < startMs) {
      return 'Chưa đến giờ mở bình chọn';
    }
    if (endMs != null && !Number.isNaN(endMs) && nowMs > endMs) {
      return 'Đã hết thời gian bình chọn';
    }
    if (!votingOpen) return 'Đang không trong thời gian cho phép vote';
    if (alreadyVotedLocked) return 'Bạn đã vote và bảng này không cho đổi lựa chọn';
    if (notEnoughPoints) return `Yêu cầu tối thiểu ${poll?.min_points_required} điểm`;
    return '';
  }, [dbClosed, startMs, endMs, votingOpen, alreadyVotedLocked, notEnoughPoints, poll?.min_points_required]);

  const handleToggleOption = (optionId) => {
    const id = String(optionId);
    if (isSingle) {
      setSelected([id]);
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
  };

  const handleVote = async () => {
    if (!selected.length) {
<<<<<<< HEAD
      toast.error('Chọn ít nhất một lựa chọn');
=======
      toast.error('Vui lòng chọn ít nhất một lựa chọn');
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
      return;
    }
    setSubmitting(true);
    try {
<<<<<<< HEAD
      const res = await votePoll(clubId, pollId, selected);
      if (res.success) {
        toast.success(res.message || 'Đã ghi nhận bình chọn');
        await load();
        onUpdated?.();
      } else {
        toast.error(res.message || 'Không thể bình chọn');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể bình chọn');
=======
      // console.log('Voting with optionIds', selected);
      const res = await votePoll(clubId, pollId, selected);
      console.log('votePoll res', res);
      if (res?.success) {
        toast.success(res.message || 'Bình chọn thành công');
        await loadDetail();
        onUpdated?.();
      } else {
        toast.error('Không thể bình chọn');
      }
    } catch (e) {
      const status = e?.response?.status;
      const serverMessage = e?.response?.data?.message;
      if (status === 403) {
        toast.error(serverMessage || 'Bạn không có quyền bình chọn');
        return;
      }
      toast.error(serverMessage || e?.message || 'Không thể bình chọn');
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
  const handleClosePoll = async () => {
    setSubmitting(true);
    try {
      const res = await closePoll(clubId, pollId);
      if (res.success) {
        toast.success(res.message || 'Đã đóng poll');
        await load();
        onUpdated?.();
      } else {
        toast.error(res.message || 'Không thể đóng poll');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể đóng poll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEnd = async () => {
    if (!editEnd) return;
    setSubmitting(true);
    try {
      const res = await updatePoll(clubId, pollId, {
        end_date: new Date(editEnd).toISOString(),
      });
      if (res.success) {
        toast.success(res.message || 'Đã cập nhật');
        setShowEditEnd(false);
        await load();
        onUpdated?.();
      } else {
        toast.error(res.message || 'Không thể cập nhật');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="poll-vm-overlay" role="presentation" onClick={onClose}>
      <div
        className="poll-vm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="poll-vm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="poll-vm-head">
          <h2 id="poll-vm-title" className="poll-vm-title">
            {poll?.title || 'Poll'}
          </h2>
          <button type="button" className="poll-vm-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="poll-vm-meta">
          {poll?.status === 'open' ? (
            <span className="poll-vm-pill poll-vm-pill--open">Đang mở</span>
          ) : (
            <span className="poll-vm-pill poll-vm-pill--closed">Đã đóng</span>
          )}
          <span className="poll-vm-pill poll-vm-pill--muted">
            {isSingle ? 'Chọn một' : 'Chọn nhiều'}
          </span>
          {poll?.min_points_required != null ? (
            <span className="poll-vm-pill poll-vm-pill--muted">
              &gt; {poll.min_points_required} điểm
            </span>
          ) : null}
        </div>
        <div className="poll-vm-body">
          {loading && <p className="poll-vm-loading">Đang tải...</p>}
          {!loading && err && <p className="poll-vm-error">{err}</p>}
          {!loading && !err && detail && (
            <>
              <div className="poll-vm-total">
                <span className="poll-vm-total-lbl">Tổng phiếu</span>
                <span className="poll-vm-total-val">{totalVotes}</span>
              </div>
              {options.map((opt) => (
                <div key={String(opt.option_id)} className="poll-vm-row">
                  <div className="poll-vm-row-top">
                    <span className="poll-vm-opt-label" title={opt.label}>
                      {opt.label}
                    </span>
                    <span className="poll-vm-opt-pct">{opt.percentage ?? 0}%</span>
                  </div>
                  <div className="poll-vm-bar">
                    <div
                      className={`poll-vm-bar-fill ${opt.is_leading ? 'poll-vm-bar-fill--lead' : ''}`}
                      style={{ width: `${Math.min(100, opt.percentage ?? 0)}%` }}
                    />
                  </div>
                </div>
              ))}

              {canVote && (
                <div className="poll-vm-vote-block">
                  <p className="poll-vm-vote-title">
                    {myVoteIds.length && !poll?.allow_change_vote
                      ? 'Bạn đã bình chọn'
                      : 'Chọn lựa chọn của bạn'}
                  </p>
                  {options.map((opt) => {
                    const id = String(opt.option_id);
                    const sel = selected.includes(id);
                    const disabled = myVoteIds.length > 0 && !poll?.allow_change_vote;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`poll-vm-option-btn ${sel ? 'is-selected' : ''}`}
                        onClick={() => !disabled && toggleOption(id)}
                        disabled={disabled}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: isSingle ? '50%' : 6,
                            border: '2px solid #d1d5db',
                            background: sel ? 'var(--poll-accent, #ff7051)' : '#fff',
                            flexShrink: 0,
                          }}
                          aria-hidden
                        />
                        <span className="poll-vm-opt-label">{opt.label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="poll-vm-submit"
                    disabled={
                      submitting ||
                      !selected.length ||
                      (myVoteIds.length > 0 && !poll?.allow_change_vote)
                    }
                    onClick={handleVote}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi bình chọn'}
                  </button>
                </div>
              )}

              {isLeader && (
                <div className="poll-vm-leader">
                  {isOpen && (
                    <>
                      <button
                        type="button"
                        className="poll-vm-btn-ghost poll-vm-btn-danger"
                        onClick={handleClosePoll}
                        disabled={submitting}
                      >
                        Đóng poll
                      </button>
                      <button
                        type="button"
                        className="poll-vm-btn-ghost"
                        onClick={() => setShowEditEnd((v) => !v)}
                      >
                        {showEditEnd ? 'Huỷ sửa hạn' : 'Sửa hạn kết thúc'}
                      </button>
                    </>
                  )}
                </div>
              )}
              {isLeader && showEditEnd && isOpen && (
                <div className="poll-vm-form" style={{ marginTop: 12 }}>
                  <label htmlFor="poll-end-edit">Hạn kết thúc</label>
                  <input
                    id="poll-end-edit"
                    type="datetime-local"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="poll-vm-submit"
                    disabled={submitting}
                    onClick={handleSaveEnd}
                  >
                    Lưu hạn
                  </button>
                </div>
              )}
            </>
          )}
        </div>
=======
  if (!open) return null;

  return (
    <div className="poll-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="poll-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="poll-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="poll-modal-head">
          <h3 id="poll-modal-title">{poll?.title || 'Bình chọn'}</h3>
          <button type="button" className="poll-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="poll-modal-meta">
          <span className={`poll-modal-pill ${votingOpen ? 'is-open' : 'is-closed'}`}>
            {votingOpen ? 'Đang mở' : 'Đang đóng'}
          </span>
          <span className="poll-modal-pill is-muted">{isSingle ? 'Chọn một' : 'Chọn nhiều'}</span>
          <span className="poll-modal-pill is-muted">Hạn: {formatDateTime(poll?.end_date)}</span>
          {poll ? (
            <span
              className={`poll-modal-pill poll-modal-pill--change ${canChangeAfterVote ? 'is-yes' : 'is-no'}`}
              title={
                canChangeAfterVote
                  ? 'Trong thời gian mở bình chọn, bạn có thể gửi lại phiếu với lựa chọn khác.'
                  : 'Sau khi đã gửi phiếu, bạn không thể đổi lựa chọn.'
              }
            >
              {canChangeAfterVote ? 'Được đổi lựa chọn' : 'Không đổi lựa chọn sau khi vote'}
            </span>
          ) : null}
          {pointRestricted ? (
            <span className="poll-modal-pill is-muted">Tối thiểu {poll?.min_points_required} điểm</span>
          ) : null}
        </div>

        <div className="poll-modal-body">
          {loading ? <p className="poll-modal-note">Đang tải dữ liệu poll...</p> : null}
          {!loading && error ? <p className="poll-modal-error">{error}</p> : null}
          {!loading && !error && detail ? (
            <>
              <div className="poll-modal-total-wrap">
                <div className="poll-modal-total">Tổng phiếu: {totalVotes}</div>
                <div className="poll-modal-description">
                  <span className="poll-modal-description-lead">
                    Bình chọn phương án phù hợp. Bạn có thể chọn {isSingle ? 'một' : 'nhiều'} lựa chọn.
                  </span>
                  <span className="poll-modal-description-follow">
                    {canChangeAfterVote
                      ? 'Sau khi đã bình chọn, bạn vẫn có thể thay đổi lựa chọn (trong thời gian còn mở).'
                      : 'Sau khi đã bình chọn, bạn không thể đổi lựa chọn.'}
                  </span>
                </div>
              </div>
              <div className="poll-modal-options">
                {options.map((opt) => {
                  const id = String(opt.option_id);
                  const checked = selected.includes(id);
                  return (
                    <button
                      type="button"
                      key={id}
                      className={`poll-modal-option ${checked ? 'is-selected' : ''}`}
                      onClick={() => !disableVote && handleToggleOption(opt.option_id)}
                      disabled={disableVote}
                    >
                      <div className="poll-modal-option-head">
                        <span className={`poll-modal-check ${checked ? 'is-checked' : ''}`} />
                        {checked ? (
                          <span className="poll-modal-picked" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                        <span className="poll-modal-label">{opt.label}</span>
                        <span className="poll-modal-votes">{opt.votes ?? 0} phiếu</span>
                        <span className="poll-modal-pct">{opt.percentage ?? 0}%</span>
                      </div>
                      <div className="poll-modal-bar">
                        <div
                          className={`poll-modal-fill ${opt.is_leading ? 'is-leading' : ''}`}
                          style={{ width: `${Math.min(100, Number(opt.percentage || 0))}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
        {!loading && !error && detail ? (
          <div className="poll-modal-actions">
            <button
              type="button"
              className="poll-modal-submit"
              onClick={handleVote}
              disabled={disableVote || submitting || selected.length === 0}
            >
              {submitLabel}
            </button>
            {disableReason ? <span className="poll-modal-disable-reason">{disableReason}</span> : null}
          </div>
        ) : null}
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
      </div>
    </div>
  );
};

export default PollVoteModal;
