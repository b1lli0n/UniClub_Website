import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Wallet, Check, X, ChevronLeft, ChevronRight, ChevronDown, Search, Download } from 'lucide-react';
import { getClubTransactions, getClubTransactionDetail, reviewClubTransaction, getClubById } from '../../api/clubApi';
import '../../styles/ClubTransactions.css';
import '../../styles/DashboardClubLeader.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: '0', label: 'Chờ duyệt' },
  { value: '1', label: 'Đã duyệt' },
  { value: '2', label: 'Từ chối' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: '0', label: 'Thu' },
  { value: '1', label: 'Chi' },
];

const formatVND = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusBadgeClass = (status) => {
  const s = Number(status);
  if (s === 0) return 'tx-status-pending';
  if (s === 1) return 'tx-status-approved';
  if (s === 2) return 'tx-status-rejected';
  return '';
};

const getStatusLabel = (status) => {
  const s = Number(status);
  if (s === 0) return 'Chờ duyệt';
  if (s === 1) return 'Đã duyệt';
  if (s === 2) return 'Từ chối';
  return '—';
};

const getStatusPillLabel = (status) => {
  const s = Number(status);
  if (s === 0) return 'Chờ duyệt';
  if (s === 1) return 'Giao dịch thành công';
  if (s === 2) return 'Giao dịch bị từ chối';
  return '—';
};

const getTypeLabel = (type) => (Number(type) === 1 ? 'Chi' : 'Thu');
const isIncome = (type) => Number(type) !== 1;

const truncateTo3Words = (str) => {
  if (!str || typeof str !== 'string') return '—';
  const words = str.trim().split(/\s+/);
  if (words.length <= 3) return str.trim();
  return words.slice(0, 3).join(' ') + '...';
};

const isValidClubId = (id) =>
  id != null && id !== '' && String(id) !== 'null' && String(id) !== 'undefined';

function TxSelect({ options, value, onChange, label, id }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 160 });
  const wrapRef = useRef(null);
  const selected = options.find((o) => o.value === value) || options[0];

  const updatePosition = () => {
    const btn = wrapRef.current?.querySelector('.tx-select-trigger');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 160),
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target) &&
        !e.target.closest('.tx-select-list-portal')) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className={`tx-select-wrap ${open ? 'tx-select-wrap-open' : ''}`} ref={wrapRef}>
      <span className="tx-select-label">{label}</span>
      <button
        type="button"
        className={`tx-select-trigger ${open ? 'tx-select-open' : ''}`}
        onClick={() => {
          if (!open) updatePosition();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        id={id}
      >
        <span>{selected?.label || 'Chọn'}</span>
        <ChevronDown size={16} className="tx-select-chevron" />
      </button>
      {open && createPortal(
        <ul
          className="tx-select-list tx-select-list-portal"
          role="listbox"
          aria-labelledby={id}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            minWidth: 160,
          }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`tx-select-option ${opt.value === value ? 'tx-select-option-active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}

export default function ClubTransactions() {
  const { id: clubIdFromUrl } = useParams();
  const validClubId = isValidClubId(clubIdFromUrl) ? clubIdFromUrl : null;
  const [club, setClub] = useState(null);
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (validClubId) localStorage.setItem('clubId', validClubId);
  }, [validClubId]);

  useEffect(() => {
    if (!validClubId) setLoading(false);
  }, [validClubId]);

  useEffect(() => {
    if (!validClubId) return;
    getClubById(validClubId).then((res) => {
      if (res?.data) setClub(res.data);
      else if (res?.name) setClub(res);
    }).catch(() => { });
  }, [validClubId]);

  useEffect(() => {
    const fetch = async () => {
      if (!validClubId) {
        setLoading(false);
        setList([]);
        return;
      }
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...(status !== '' && { status: Number(status) }),
          ...(type !== '' && { type: Number(type) }),
        };
        const res = await getClubTransactions(validClubId, params);
        if (res.success && Array.isArray(res.data)) {
          setList(res.data);
          setPagination((prev) => ({
            ...prev,
            total: res.pagination?.total ?? res.data.length,
            totalPages: res.pagination?.totalPages ?? 1,
          }));
        } else {
          setList([]);
        }
      } catch (err) {
        toast.error(err?.message || 'Không thể tải danh sách giao dịch');
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [validClubId, pagination.page, pagination.limit, status, type]);

  const openDetail = async (transactionId) => {
    if (!validClubId) return;
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await getClubTransactionDetail(validClubId, transactionId);
      const data = res?.data ?? res?.transaction ?? (res && typeof res._id === 'string' ? res : null);
      if (data) setDetail(data);
      else toast.error(res?.message || 'Không tải được chi tiết');
    } catch (err) {
      toast.error(err?.message || 'Không thể tải chi tiết giao dịch');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (transactionId, approved) => {
    if (!validClubId) return;
    setActionLoading(transactionId);
    try {
      const payload = { action: approved ? 'approve' : 'reject' };
      const nextStatus = approved ? 1 : 2;
      const res = await reviewClubTransaction(validClubId, transactionId, payload);
      if (res.success) {
        toast.success(approved ? 'Đã duyệt giao dịch' : 'Đã từ chối giao dịch');
        setDetail((prev) => (prev && prev._id === transactionId ? { ...prev, status: nextStatus } : prev));
        setList((prev) =>
          prev.map((t) => (t._id === transactionId ? { ...t, status: nextStatus } : t))
        );
      } else {
        toast.error(res?.message || 'Thao tác thất bại');
      }
    } catch (err) {
      toast.error(err?.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const creatorName = (t) =>
    t?.created_by?.fullName || t?.created_by?.email || '—';

  const pendingCount = list.filter((t) => Number(t.status) === 0).length;

  const incomeTotal = list.reduce((sum, t) => (Number(t.type) !== 1 ? sum + (Number(t.amount) || 0) : sum), 0);
  const expenseTotal = list.reduce((sum, t) => (Number(t.type) === 1 ? sum + (Number(t.amount) || 0) : sum), 0);
  const netTotal = incomeTotal - expenseTotal;

  const kw = (searchKeyword || '').trim().toLowerCase();
  const filtered = kw
    ? list.filter((t) => {
      const desc = (t.description || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const name = (creatorName(t) || '').toLowerCase();
      return desc.includes(kw) || cat.includes(kw) || name.includes(kw);
    })
    : list;
  const displayedList = [...filtered].sort((a, b) => Number(a.status) - Number(b.status));

  if (!validClubId) {
    return (
      <div className="tx-page">
        <div className="tx-container">
          <div className="tx-empty tx-invalid-club">
            <Wallet size={48} className="tx-empty-icon" />
            <p>Không tải được chi tiết</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page">
      <div className="tx-container">
        <div className="tx-hero-card">
          <div className="tx-hero-header">
            <div className="tx-header-left">
              <div className="tx-hero-icon">
                <Wallet size={28} strokeWidth={2} />
              </div>
              <div className="tx-header-text">
                <h1 className="tx-header-title">Quản lý giao dịch</h1>
                <p className="tx-header-subtitle">{club?.name || 'Xem và duyệt giao dịch'}</p>
              </div>
            </div>
            {/* <button type="button" className="tx-btn-export" aria-label="Xuất dữ liệu">
              <Download size={18} />
              Xuất
            </button> */}
          </div>

          <div className="tx-stats-row">
            <div className="tx-stat-card tx-stat-net">
              <div className="tx-stat-icon" />
              <span className="tx-stat-value">{formatVND(netTotal)}</span>
              <span className="tx-stat-label">Tổng</span>
            </div>
            <div className="tx-stat-card tx-stat-income">
              <div className="tx-stat-icon" />
              <span className="tx-stat-value">{formatVND(incomeTotal)}</span>
              <span className="tx-stat-label">Thu</span>
            </div>
            <div className="tx-stat-card tx-stat-expense">
              <div className="tx-stat-icon" />
              <span className="tx-stat-value">{formatVND(expenseTotal)}</span>
              <span className="tx-stat-label">Chi</span>
            </div>
          </div>

          <div className="tx-filter-row">
            <div className="tx-search-wrap">
              <Search size={18} className="tx-search-icon" />
              <input
                type="text"
                className="tx-search-input"
                placeholder="Tìm theo nội dung, danh mục..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                aria-label="Tìm kiếm giao dịch"
              />
            </div>
            <div className="tx-filter-controls">
              <TxSelect
                id="tx-status"
                label="Trạng thái"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
              <TxSelect
                id="tx-type"
                label="Loại"
                options={TYPE_OPTIONS}
                value={type}
                onChange={(v) => {
                  setType(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
            </div>
          </div>
        </div>

        <section className="tx-list-card">
          <div className="tx-list-header">
            <span className="tx-list-title">Lịch sử giao dịch</span>
            <span className="tx-list-meta">
              <strong>{pagination.total}</strong> giao dịch
              {pendingCount > 0 && (
                <>
                  {' • '}
                  <strong className="tx-stats-pending">{pendingCount}</strong> chờ duyệt
                </>
              )}
            </span>
          </div>
          <div className="tx-list-wrap">
            {loading ? (
              <div className="tx-loading">
                <div className="tx-loading-spinner" />
                <span>Đang tải...</span>
              </div>
            ) : list.length === 0 ? (
              <div className="tx-empty">
                <Wallet size={48} className="tx-empty-icon" />
                <p>Chưa có giao dịch nào</p>
                <span>Thử đổi bộ lọc hoặc quay lại sau</span>
              </div>
            ) : displayedList.length === 0 ? (
              <div className="tx-empty">
                <Search size={48} className="tx-empty-icon" />
                <p>Không tìm thấy giao dịch phù hợp</p>
                <span>Thử đổi từ khóa tìm kiếm</span>
              </div>
            ) : (
              <>
                <ul className="tx-item-list">
                  {displayedList.map((t) => (
                    <li
                      key={t._id}
                      className="tx-item"
                      onClick={() => openDetail(t._id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && openDetail(t._id)}
                      aria-label={`Xem chi tiết giao dịch ${t.description || t.category || ''}`}
                    >
                      <div className={`tx-item-icon-wrap tx-type-${isIncome(t.type) ? 'in' : 'out'}`}>
                        <Wallet size={20} strokeWidth={2} />
                      </div>
                      <div className="tx-item-content">
                        <div className="tx-item-title">{truncateTo3Words(t.description || t.category || 'Giao dịch')}</div>
                        <div className="tx-item-subtitle">
                          {formatDate(t.transaction_date)}
                          {t?.category && ` • ${t.category}`}
                        </div>
                      </div>
                      <div className="tx-item-creator-col">
                        <span className="tx-item-creator">{creatorName(t)}</span>
                      </div>
                      <div className="tx-item-status-col">
                        <span className={`tx-badge ${getStatusBadgeClass(t.status)}`}>
                          {getStatusLabel(t.status)}
                        </span>
                      </div>
                      <div className="tx-item-amount-col">
                        <span className="tx-item-amount">{formatVND(t.amount)}</span>
                      </div>
                      <div className="tx-item-actions" onClick={(e) => e.stopPropagation()}>
                        {Number(t.status) === 0 && (
                          <>
                            <button
                              type="button"
                              className="tx-btn tx-btn-approve"
                              onClick={() => handleReview(t._id, true)}
                              disabled={actionLoading === t._id}
                            >
                              <Check size={14} /> Chấp nhận
                            </button>
                            <button
                              type="button"
                              className="tx-btn tx-btn-reject"
                              onClick={() => handleReview(t._id, false)}
                              disabled={actionLoading === t._id}
                            >
                              <X size={14} /> Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {pagination.totalPages > 1 && (
                  <div className="tx-pagination">
                    <button
                      type="button"
                      className="tx-page-btn"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="tx-page-info">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      className="tx-page-btn"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {(detail !== null || detailLoading) && createPortal(
        <div className="tx-modal-overlay" onClick={() => !detailLoading && setDetail(null)}>
          <div className="tx-modal" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="tx-modal-loading">
                <div className="tx-loading-spinner" />
                <span>Đang tải...</span>
              </div>
            ) : detail ? (
              <>
                <div className="tx-modal-header">
                  <div className="tx-modal-header-left">
                    <div className="tx-modal-title">Chi tiết giao dịch</div>
                  </div>
                  <div className="tx-modal-header-right">
                    <span className={`tx-status-pill ${getStatusBadgeClass(detail.status)}`}>
                      {getStatusPillLabel(detail.status)}
                    </span>
                    <button
                      type="button"
                      className="tx-modal-close"
                      onClick={() => setDetail(null)}
                      aria-label="Đóng"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>
                <div className="tx-modal-body">
                  <div className="tx-detail-grid">
                    <div className="tx-detail-row">
                      <div className="tx-detail-label">Số tiền</div>
                      <div className="tx-detail-value tx-detail-amount">
                        {formatVND(detail.amount)}
                        <span className={`tx-detail-type ${isIncome(detail.type) ? 'tx-type-in' : 'tx-type-out'}`}>
                          {getTypeLabel(detail.type)}
                        </span>
                      </div>
                    </div>

                    <div className="tx-detail-row">
                      <div className="tx-detail-label">Danh mục</div>
                      <div className="tx-detail-value">{detail.category || '—'}</div>
                    </div>

                    <div className="tx-detail-row">
                      <div className="tx-detail-label">Người thực hiện</div>
                      <div className="tx-detail-value">
                        <div className="tx-detail-user-name">{creatorName(detail)}</div>
                        {detail.created_by?.email && (
                          <div className="tx-detail-user-email">{detail.created_by.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="tx-detail-row">
                      <div className="tx-detail-label">Ngày giao dịch</div>
                      <div className="tx-detail-value">{formatDate(detail.transaction_date)}</div>
                    </div>

                  </div>

                  {detail.description && (
                    <div className="tx-detail-note-card tx-detail-note-full">
                      <div className="tx-detail-note-title">Nội dung</div>
                      <div className="tx-detail-note-text">{detail.description}</div>
                    </div>
                  )}

                  {Number(detail.status) === 0 && (
                    <div className="tx-modal-actions">
                      <button
                        type="button"
                        className="tx-btn tx-btn-approve tx-btn-lg"
                        onClick={() => handleReview(detail._id, true)}
                        disabled={actionLoading === detail._id}
                      >
                        <Check size={20} /> Duyệt
                      </button>
                      <button
                        type="button"
                        className="tx-btn tx-btn-reject tx-btn-lg"
                        onClick={() => handleReview(detail._id, false)}
                        disabled={actionLoading === detail._id}
                      >
                        <X size={20} /> Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
