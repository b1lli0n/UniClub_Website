import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { listPolls, closePoll } from '../../api/pollApi';
import PollList from '../../components/poll/PollList';
import PollDetail from '../../components/poll/PollDetail';
import PollFormModal from '../../components/poll/PollFormModal';
import '../../styles/ClubPollManagement.css';

export default function ClubPollManagement() {
  const { id: clubId } = useParams();
  const clubRole = Number(localStorage.getItem('clubRole'));
  const isLeader = clubRole === 1;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('all');

  const [selectedPollId, setSelectedPollId] = useState(null);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDetail, setEditDetail] = useState(null);

  const fetchList = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const sortParam = sortKey === 'all' ? undefined : sortKey;
      const res = await listPolls(clubId, {
        status: statusFilter || undefined,
        sort: sortParam,
        limit: 100,
      });
      if (res?.success) setItems(res.items || []);
      else setItems([]);
    } catch (e) {
      toast.error(e.message || 'Không tải được danh sách');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [clubId, statusFilter, sortKey]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const bump = () => setRefreshNonce((n) => n + 1);

  const handleClosePoll = () => {
    if (!clubId || !selectedPollId) return;
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="poll-pm-confirm-overlay" onClick={onClose} role="presentation">
          <div className="poll-pm-confirm-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="poll-pm-confirm-title">Đóng bình chọn?</h4>
            <p className="poll-pm-confirm-text">Thành viên sẽ không còn bỏ phiếu sau khi đóng.</p>
            <div className="poll-pm-confirm-actions">
              <button type="button" className="poll-pm-btn poll-pm-btn--soft" onClick={onClose}>
                Hủy
              </button>
              <button
                type="button"
                className="poll-pm-btn poll-pm-btn--gradient poll-pm-btn--confirm"
                onClick={async () => {
                  try {
                    await closePoll(clubId, selectedPollId);
                    toast.success('Đã đóng bình chọn');
                    onClose();
                    bump();
                    await fetchList();
                  } catch (e) {
                    toast.error(e.message || 'Không đóng được');
                  }
                }}
              >
                Xác nhận đóng
              </button>
            </div>
          </div>
        </div>
      ),
      closeOnClickOutside: true,
    });
  };

  return (
    <div className="poll-pm-page">
      <h1 className="poll-pm-page-title">Quản lý bình chọn</h1>

      <div className="poll-pm-page-actions">
        {isLeader && (
          <button type="button" className="poll-pm-btn poll-pm-btn--gradient" onClick={() => setCreateOpen(true)}>
            + Tạo mới
          </button>
        )}
      </div>

      <div className="poll-pm-layout">
        <div className="poll-pm-col poll-pm-col--list">
          <PollList
            items={items}
            loading={loading}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortKey={sortKey}
            onSortChange={setSortKey}
            selectedPollId={selectedPollId}
            onSelectPoll={(pid) => setSelectedPollId(pid)}
          />
        </div>
        <div className="poll-pm-col poll-pm-col--detail">
          <PollDetail
            clubId={clubId}
            pollId={selectedPollId}
            refreshNonce={refreshNonce}
            isLeader={isLeader}
            onRefreshList={fetchList}
            onRequestEdit={(d) => {
              setEditDetail(d);
              setEditOpen(true);
            }}
            onRequestClose={handleClosePoll}
          />
        </div>
      </div>

      {createOpen && (
        <PollFormModal
          mode="create"
          clubId={clubId}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            fetchList();
            bump();
          }}
        />
      )}
      {editOpen && editDetail && (
        <PollFormModal
          mode="edit"
          clubId={clubId}
          initialDetail={editDetail}
          onClose={() => {
            setEditOpen(false);
            setEditDetail(null);
          }}
          onSuccess={() => {
            fetchList();
            bump();
            setEditOpen(false);
            setEditDetail(null);
          }}
        />
      )}
    </div>
  );
}
