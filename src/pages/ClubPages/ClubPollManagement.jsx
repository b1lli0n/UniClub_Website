import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Container } from 'react-bootstrap';
import { PlusCircle, X } from 'lucide-react';
import { closePoll, createPoll, getPollDetail, listPolls, updatePoll } from '../../api/pollApi';
import { getClubById } from '../../api/clubApi';
import PollVoteModal from '../../components/PollVoteModal';
import PollList from '../../components/poll/PollList';
import PollDetail from '../../components/poll/PollDetail';
import '../../styles/ClubPollManagement.css';

const createInitialForm = () => ({
  title: '',
  options: ['', ''],
  type: '0',
  start_date: '',
  end_date: '',
  min_points_required: '',
  allow_change_vote: false,
});

const toIso = (localValue) => {
  if (!localValue) return null;
  const d = new Date(localValue);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
};

const formatDate = (input) => {
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
};

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formFromDetail = (d) => {
  const p = d?.poll;
  const rawOpts = (d?.options || []).map((o) => String(o?.label ?? '').trim()).filter(Boolean);
  const opts = rawOpts.length >= 2 ? rawOpts : ['', ''];
  return {
    title: p?.title ?? '',
    options: opts,
    type: String(p?.type ?? '0'),
    start_date: toLocalInput(p?.start_date),
    end_date: toLocalInput(p?.end_date),
    min_points_required: p?.min_points_required != null && p?.min_points_required !== '' ? String(p.min_points_required) : '',
    allow_change_vote: !!p?.allow_change_vote,
  };
};

const normalizeFormForCompare = (f) => ({
  title: String(f?.title ?? '').trim(),
  options: Array.isArray(f?.options) ? f.options.map((x) => String(x ?? '').trim()) : [],
  type: String(f?.type ?? '0'),
  start_date: String(f?.start_date ?? ''),
  end_date: String(f?.end_date ?? ''),
  min_points_required: f?.min_points_required === '' ? '' : String(f?.min_points_required ?? '').trim(),
  allow_change_vote: !!f?.allow_change_vote,
});

const hasFormChanged = (current, initial) => {
  if (!initial) return false;
  return JSON.stringify(normalizeFormForCompare(current)) !== JSON.stringify(normalizeFormForCompare(initial));
};

const ClubPollManagement = () => {
  const { id: clubId } = useParams();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState('');
  const [modalPollId, setModalPollId] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [searchText, setSearchText] = useState('');
  const [form, setForm] = useState(createInitialForm);
  const [isLeader, setIsLeader] = useState(false);
  const [userPoints, setUserPoints] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPollId, setEditingPollId] = useState('');
  const [editInitialForm, setEditInitialForm] = useState(null);
  const [closingPoll, setClosingPoll] = useState(false);

  const loadPolls = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const res = await listPolls(clubId, {
        status,
        sort: sort || undefined,
        page: 1,
        limit: 30,
      }, true);
      if (res?.success) {
        const items = Array.isArray(res.items) ? res.items : [];
        setPolls(items);
        if (selectedPollId && !items.some((x) => String(x._id) === String(selectedPollId))) {
          setSelectedPollId('');
        }
      } else {
        setPolls([]);
        toast.error(res?.message || 'Không tải được danh sách bình chọn');
      }
    } catch (e) {
      setPolls([]);
      if (e?.response?.status === 403) {
        toast.error('Bạn không phải thành viên CLB này');
      } else {
        toast.error(e?.message || 'Không tải được danh sách bình chọn');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [clubId, status, sort]);

  useEffect(() => {
    const loadRole = async () => {
      if (!clubId) return;
      try {
        const res = await getClubById(clubId);
        const club = res?.data || {};
        const role = club?.membershipRole ?? club?.my_role ?? club?.role;
        const roleNum = Number(role);
        const roleFromStorage = Number(localStorage.getItem('clubRole'));
        const canCreateByRole = roleNum === 1 || roleNum === 2;
        const canCreateByStorage = roleFromStorage === 1 || roleFromStorage === 2;
        setIsLeader(canCreateByRole || canCreateByStorage);
        const scoreRaw = club?.my_points ?? club?.points ?? club?.member_points;
        if (scoreRaw != null && !Number.isNaN(Number(scoreRaw))) {
          setUserPoints(Number(scoreRaw));
        }
      } catch {
        const roleFromStorage = Number(localStorage.getItem('clubRole'));
        setIsLeader(roleFromStorage === 1 || roleFromStorage === 2);
      }
    };
    loadRole();
  }, [clubId]);

  const loadDetail = useCallback(async () => {
    if (!clubId || !selectedPollId) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const res = await getPollDetail(clubId, selectedPollId, true);
      if (res?.success && res?.data) {
        setDetail(res.data);
      } else {
        setDetail(null);
      }
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, [clubId, selectedPollId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const options = form.options;

  const canCreate = useMemo(() => isLeader, [isLeader]);
  const filteredPolls = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return polls;
    return polls.filter((p) => String(p?.title || '').toLowerCase().includes(q));
  }, [polls, searchText]);

  const closeCreateModal = () => {
    setCreateOpen(false);
    setEditingPollId('');
    setEditInitialForm(null);
    setForm(createInitialForm());
  };

  const handleOpenEdit = () => {
    if (!canCreate || !detail) return;
    const editForm = formFromDetail(detail);
    setForm(editForm);
    setEditInitialForm(editForm);
    setEditingPollId(String(selectedPollId));
    setCreateOpen(true);
  };

  const handleClosePollRequest = () => {
    if (!canCreate || !clubId || !selectedPollId || closingPoll) return;
    confirmAlert({
      overlayClassName: 'club-pm-confirm-overlay',
      customUI: ({ onClose }) => (
        <div className="club-pm-confirm-card" role="dialog" aria-modal="true" aria-label="Đóng bình chọn">
          <h1>Đóng bình chọn</h1>
          <p>Bạn có chắc muốn đóng bảng bình chọn này? Thành viên sẽ không thể bình chọn thêm.</p>
          <div className="react-confirm-alert-button-group">
            <button
              type="button"
              className="club-pm-confirm-btn club-pm-confirm-btn--ghost"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="club-pm-confirm-btn club-pm-confirm-btn--danger"
              onClick={async () => {
                onClose();
                setClosingPoll(true);
                try {
                  const res = await closePoll(clubId, selectedPollId);
                  if (res?.success) {
                    toast.success(res?.message || 'Đã đóng bảng bình chọn');
                    await loadPolls();
                    await loadDetail();
                  } else {
                    toast.error(res?.message || 'Không thể đóng bảng bình chọn');
                  }
                } catch (err) {
                  toast.error(err?.response?.data?.message || err?.message || 'Không thể đóng bảng bình chọn');
                } finally {
                  setClosingPoll(false);
                }
              }}
            >
              Đóng bình chọn
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreate) return;

    const title = form.title.trim();
    const cleanOptions = form.options.map((s) => s.trim()).filter(Boolean);
    const unique = new Set(cleanOptions.map((s) => s.toLowerCase()));
    const startIso = toIso(form.start_date);
    const endIso = toIso(form.end_date);

    if (!title) {
      toast.error('Tiêu đề bình chọn không được để trống');
      return;
    }
    if (cleanOptions.length < 2) {
      toast.error('Cần ít nhất 2 lựa chọn');
      return;
    }
    if (unique.size !== cleanOptions.length) {
      toast.error('Các lựa chọn không được trùng nhau');
      return;
    }
    if (!startIso || !endIso) {
      toast.error('Ngày bắt đầu/kết thúc không hợp lệ');
      return;
    }
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    if (new Date(endIso).getTime() < Date.now()) {
      toast.error('Không thể đặt ngày kết thúc trong quá khứ');
      return;
    }

    const isEditing = !!editingPollId;
    const editHasVotes =
      isEditing &&
      ((Number(detail?.total_votes) || 0) > 0 || (detail?.options || []).some((opt) => (Number(opt?.votes) || 0) > 0));
    const formChanged = !isEditing || hasFormChanged(form, editInitialForm);

    if (isEditing && !formChanged) {
      toast.info('Chưa có thay đổi để lưu');
      return;
    }

    let payload = {
      title,
      options: cleanOptions,
      type: Number(form.type),
      start_date: startIso,
      end_date: endIso,
      allow_change_vote: !!form.allow_change_vote,
    };
    if (form.min_points_required !== '') {
      payload.min_points_required = Number(form.min_points_required);
    }
    if (editHasVotes) {
      payload = {
        end_date: endIso,
      };
    }

    setCreating(true);
    try {
      if (editingPollId) {
        const res = await updatePoll(clubId, editingPollId, payload);
        if (res?.success) {
          toast.success(res?.message || 'Cập nhật bình chọn thành công');
          closeCreateModal();
          await loadPolls();
          await loadDetail();
        } else {
          toast.error(res?.message || 'Không thể cập nhật bình chọn');
        }
      } else {
        const res = await createPoll(clubId, payload);
        if (res?.success) {
          toast.success(res?.message || 'Tạo bình chọn thành công');
          closeCreateModal();
          await loadPolls();
        } else {
          toast.error(res?.message || 'Không thể tạo bình chọn');
        }
      }
    } catch (e2) {
      toast.error(e2?.response?.data?.message || e2?.message || (editingPollId ? 'Không thể cập nhật bình chọn' : 'Không thể tạo bình chọn'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="club-pm-page">
      <Container className="club-pm-container">
        <div className="club-pm-header-card">
          <div>
            <h1>Quản lí bình chọn</h1>
            <p>Danh sách, chi tiết và kết quả bình chọn của câu lạc bộ.</p>
          </div>
          {canCreate ? (
            <button
              type="button"
              className="club-pm-create-btn club-pm-create-btn--gradient"
              onClick={() => {
                setEditingPollId('');
                setEditInitialForm(null);
                setForm(createInitialForm());
                setCreateOpen(true);
              }}
            >
              <PlusCircle size={16} /> Tạo bình chọn
            </button>
          ) : null}
        </div>

        <div className="club-pm-split">
          <PollList
            searchText={searchText}
            onSearchChange={setSearchText}
            status={status}
            onStatusChange={setStatus}
            sort={sort}
            onSortChange={setSort}
            loading={loading}
            filteredPolls={filteredPolls}
            selectedPollId={selectedPollId}
            onSelectPoll={setSelectedPollId}
            formatDate={formatDate}
          />
          <PollDetail
            loadingDetail={loadingDetail}
            detail={detail}
            selectedPollId={selectedPollId}
            onOpenVote={setModalPollId}
            canManage={canCreate}
            onEditPoll={handleOpenEdit}
            onClosePoll={handleClosePollRequest}
            closingPoll={closingPoll}
          />
        </div>
      </Container>

      {createOpen ? (
        <div className="club-pm-create-overlay" role="presentation" onClick={closeCreateModal}>
          <div
            className="club-pm-create-modal club-pm-create-modal--dark"
            role="dialog"
            aria-modal="true"
            aria-labelledby="club-pm-create-title"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const isEditing = !!editingPollId;
              const editHasVotes =
                isEditing &&
                ((Number(detail?.total_votes) || 0) > 0 || (detail?.options || []).some((opt) => (Number(opt?.votes) || 0) > 0));
              const lockForVotedPoll = isEditing && editHasVotes;
              const canSubmit = !creating && (!isEditing || hasFormChanged(form, editInitialForm));
              return (
            <form className="club-pm-create-form club-pm-create-form--split" onSubmit={handleCreate}>
              <div className="club-pm-create-modal-top">
                <span className="club-pm-create-label" id="club-pm-create-title">{editingPollId ? 'Chỉnh sửa' : 'Tạo mới'}</span>
                <button type="button" className="club-pm-create-close" onClick={closeCreateModal} aria-label="Đóng">
                  <X size={20} strokeWidth={2.2} />
                </button>
              </div>

              <div className="club-pm-create-split">
                <aside className="club-pm-create-settings">
                  <p className="club-pm-create-settings-title">Cài đặt</p>
                  <label className="club-pm-dark-field">
                    <span>Loại poll</span>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                      disabled={lockForVotedPoll}
                    >
                      <option value="0">Chọn một (single)</option>
                      <option value="1">Chọn nhiều (multiple)</option>
                    </select>
                  </label>
                  <label className="club-pm-dark-field">
                    <span>Bắt đầu</span>
                    <input
                      type="datetime-local"
                      value={form.start_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                      disabled={lockForVotedPoll}
                    />
                  </label>
                  <label className="club-pm-dark-field">
                    <span>Kết thúc</span>
                    <input
                      type="datetime-local"
                      value={form.end_date}
                      onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                    />
                  </label>
                  <label className="club-pm-dark-field">
                    <span>Điểm tối thiểu (tùy chọn)</span>
                    <input
                      type="number"
                      min="0"
                      value={form.min_points_required}
                      onChange={(e) => setForm((prev) => ({ ...prev, min_points_required: e.target.value }))}
                      placeholder="Không giới hạn"
                      disabled={lockForVotedPoll}
                    />
                  </label>
                  <label className="club-pm-dark-check">
                    <input
                      type="checkbox"
                      checked={form.allow_change_vote}
                      onChange={(e) => setForm((prev) => ({ ...prev, allow_change_vote: e.target.checked }))}
                      disabled={lockForVotedPoll}
                    />
                    <span>Cho phép đổi lựa chọn sau khi vote</span>
                  </label>
                  {lockForVotedPoll ? (
                    <p className="club-pm-create-settings-title">Poll đã có lượt vote, chỉ được chỉnh ngày kết thúc.</p>
                  ) : null}
                </aside>

                <div className="club-pm-create-poll">
                  <label className="club-pm-dark-question">
                    <span className="club-pm-visually-hidden">Tiêu đề poll</span>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Bạn đang nghĩ điều gì?..."
                      className="club-pm-dark-title-input"
                      autoComplete="off"
                      disabled={lockForVotedPoll}
                    />
                  </label>

                  <div className="club-pm-dark-options">
                    {options.map((opt, idx) => (
                      <div key={idx} className="club-pm-dark-opt-row">
                        <span className="club-pm-dark-opt-num" aria-hidden>
                          {idx + 1}.
                        </span>
                        <input
                          value={opt}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              options: prev.options.map((x, i) => (i === idx ? e.target.value : x)),
                            }))
                          }
                          placeholder={idx === options.length - 1 ? 'Còn gì nữa?...' : `Lựa chọn ${idx + 1}`}
                          className="club-pm-dark-opt-input"
                          disabled={lockForVotedPoll}
                        />
                        {options.length > 2 ? (
                          <button
                            type="button"
                            className="club-pm-dark-opt-remove"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                options: prev.options.filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label={`Xóa lựa chọn ${idx + 1}`}
                            disabled={lockForVotedPoll}
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <span className="club-pm-dark-opt-spacer" aria-hidden />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="club-pm-dark-add-opt"
                    onClick={() => setForm((prev) => ({ ...prev, options: [...prev.options, ''] }))}
                  disabled={lockForVotedPoll}
                  >
                    + Thêm lựa chọn
                  </button>
                </div>
              </div>

              <div className="club-pm-create-actions club-pm-create-actions--dark">
                <button type="button" className="club-pm-cancel-btn club-pm-cancel-btn--dark" onClick={closeCreateModal}>
                  Hủy
                </button>
                <button type="submit" className="club-pm-create-submit-magenta" disabled={!canSubmit}>
                  {creating ? (editingPollId ? 'Đang lưu...' : 'Đang tạo...') : editingPollId ? 'Lưu' : 'Tạo'}
                </button>
              </div>
            </form>
              );
            })()}
          </div>
        </div>
      ) : null}

      <PollVoteModal
        open={!!modalPollId}
        clubId={clubId}
        pollId={modalPollId}
        onClose={() => setModalPollId('')}
        onUpdated={() => {
          loadPolls();
          loadDetail();
        }}
        userPoints={userPoints}
      />
    </div>
  );
};

export default ClubPollManagement;
