import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getTransactions, getLeaderTransactions, reviewLeaderTransaction } from '../api/transactionApi';
import TransactionForm from '../components/TransactionForm';
import '../styles/admin.css';
import '../styles/rewards.css';

const STATUS_MAP = {
    0: { label: 'Chờ duyệt', color: '#92400e', bg: '#fef3c7', border: '#f59e0b' },
    1: { label: 'Đã duyệt', color: '#065f46', bg: '#d1fae5', border: '#34d399' },
    2: { label: 'Từ chối', color: '#991b1b', bg: '#fee2e2', border: '#f87171' },
};

const TYPE_MAP = {
    0: { label: 'Thu', color: '#065f46', bg: '#d1fae5', icon: 'arrow-down' },
    1: { label: 'Chi', color: '#991b1b', bg: '#fee2e2', icon: 'arrow-up' },
};

const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const creatorDisplayName = (txn) => {
    const u = txn?.created_by;
    if (!u) return 'N/A';
    const nested = u.user_id?.fullName || u.user_id?.full_name;
    if (nested) return nested;
    return u.fullName || u.full_name || u.name || 'N/A';
};

const approverDisplayName = (txn) => {
    const u = txn?.approved_by;
    if (!u) return 'N/A';
    const nested = u.user_id?.fullName || u.user_id?.full_name;
    if (nested) return nested;
    return u.fullName || u.full_name || u.name || 'N/A';
};

const TransactionList = () => {
    const { id: clubId } = useParams();
    const clubRole = Number(localStorage.getItem('clubRole'));
    const isLeader = clubRole === 1;
    const isFinance = clubRole === 3 || clubRole === 4;

    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Modal state
    const [formModal, setFormModal] = useState({ open: false, editData: null });

    // Expand detail view
    const [expandedId, setExpandedId] = useState(null);

    const fetchTransactions = useCallback(async () => {
        if (!clubId) return;
        if (!isLeader && !isFinance) {
            setError('Bạn không có quyền xem trang này');
            setTransactions([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = { page, limit: 10 };
            if (statusFilter !== '') params.status = statusFilter;
            if (typeFilter !== '') params.type = typeFilter;
            const res = isLeader
                ? await getLeaderTransactions(clubId, params)
                : await getTransactions(clubId, params);
            const body = res?.data ?? res;
            const list = body?.data ?? body?.transactions ?? [];
            const pag = body?.pagination ?? {};
            setTransactions(Array.isArray(list) ? list : []);
            setPagination({
                total: pag.total ?? 0,
                page: pag.page ?? page,
                totalPages: pag.totalPages ?? pag.pages ?? 1,
            });
        } catch (err) {
            console.error('fetchTransactions error:', err);
            setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách giao dịch');
        } finally {
            setLoading(false);
        }
    }, [clubId, page, statusFilter, typeFilter, isLeader, isFinance]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const handleLeaderReview = async (txnId, action) => {
        try {
            await reviewLeaderTransaction(clubId, txnId, { action });
            toast.success(action === 'approve' ? 'Đã duyệt giao dịch' : 'Đã từ chối giao dịch');
            fetchTransactions();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Không thể xử lý');
        }
    };

    const totalIncome = transactions.filter(t => t.type === 0 && t.status === 1).reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 1 && t.status === 1).reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="admin-panel admin-panel--animate" style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
                        <i className="fa-solid fa-wallet" style={{ color: '#6366f1', marginRight: 10 }} />
                        Quản lý tài chính CLB
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>Theo dõi thu chi quỹ câu lạc bộ</p>
                </div>
                {isFinance ? (
                    <button
                        className="reward-create-btn"
                        onClick={() => setFormModal({ open: true, editData: null })}
                    >
                        <i className="fa-solid fa-plus" /> Tạo giao dịch
                    </button>
                ) : null}
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                {[
                    { label: 'Tổng thu (đã duyệt)', value: totalIncome, color: '#065f46', bg: '#d1fae5', icon: 'arrow-trend-up' },
                    { label: 'Tổng chi (đã duyệt)', value: totalExpense, color: '#991b1b', bg: '#fee2e2', icon: 'arrow-trend-down' },
                    { label: 'Số dư ước tính', value: balance, color: balance >= 0 ? '#1e40af' : '#991b1b', bg: '#dbeafe', icon: 'scale-balanced' },
                ].map(card => (
                    <div key={card.label} style={{
                        padding: '16px 18px', borderRadius: 12,
                        background: card.bg, border: `1px solid ${card.color}30`
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: card.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <i className={`fa-solid fa-${card.icon}`} style={{ marginRight: 6 }} />
                            {card.label}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: card.color }}>
                            {formatVND(card.value)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <select
                    className="reward-club-select"
                    style={{ width: 'auto', minWidth: 140 }}
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="0">Chờ duyệt</option>
                    <option value="1">Đã duyệt</option>
                    <option value="2">Từ chối</option>
                </select>
                <select
                    className="reward-club-select"
                    style={{ width: 'auto', minWidth: 140 }}
                    value={typeFilter}
                    onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả loại</option>
                    <option value="0">💰 Thu</option>
                    <option value="1">💸 Chi</option>
                </select>
                {pagination.total > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', alignSelf: 'center' }}>
                        {pagination.total} giao dịch
                    </span>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: 16, background: '#fee2e2', borderRadius: 10, color: '#991b1b', marginBottom: 16 }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} />{error}
                </div>
            )}

            {/* Table */}
            <div className="admin-table">
                <div className="admin-table-head">
                    <div className="admin-col" style={{ flex: 0.6 }}>Loại</div>
                    <div className="admin-col" style={{ flex: 1.2 }}>Danh mục</div>
                    <div className="admin-col" style={{ flex: 1.3 }}>Số tiền</div>
                    <div className="admin-col" style={{ flex: 1.5 }}>Ngày GD</div>
                    <div className="admin-col" style={{ flex: 1 }}>Trạng thái</div>
                    <div className="admin-col" style={{ flex: 1.2 }}>Hành động</div>
                </div>

                <div className="admin-table-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#6366f1' }} />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="reward-empty">
                            <i className="fa-solid fa-receipt" />
                            <p>Chưa có giao dịch nào</p>
                        </div>
                    ) : transactions.map(txn => {
                        const typeInfo = TYPE_MAP[txn.type] || {};
                        const statusInfo = STATUS_MAP[txn.status] || {};
                        const isExpanded = expandedId === txn._id;
                        const isPending = txn.status === 0;
                        const creatorName = creatorDisplayName(txn);

                        return (
                            <div key={txn._id}>
                                <div
                                    className="admin-row"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setExpandedId(isExpanded ? null : txn._id)}
                                >
                                    {/* Loại */}
                                    <div className="admin-col" style={{ flex: 0.6 }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            padding: '3px 9px', borderRadius: 20,
                                            background: typeInfo.bg, color: typeInfo.color,
                                            fontSize: 12, fontWeight: 700
                                        }}>
                                            <i className={`fa-solid fa-${typeInfo.icon}`} />
                                            {typeInfo.label}
                                        </span>
                                    </div>
                                    {/* Danh mục */}
                                    <div className="admin-col" style={{ flex: 1.2, fontWeight: 600, color: '#111827' }}>
                                        {txn.category}
                                    </div>
                                    {/* Số tiền */}
                                    <div className="admin-col" style={{ flex: 1.3, fontWeight: 700, color: txn.type === 0 ? '#065f46' : '#991b1b' }}>
                                        {txn.type === 1 ? '– ' : '+ '}{formatVND(txn.amount)}
                                    </div>
                                    {/* Ngày GD */}
                                    <div className="admin-col" style={{ flex: 1.5, color: '#6b7280', fontSize: 13 }}>
                                        {new Date(txn.transaction_date).toLocaleDateString('vi-VN')}
                                    </div>
                                    {/* Trạng thái */}
                                    <div className="admin-col" style={{ flex: 1 }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            padding: '4px 10px', borderRadius: 20,
                                            background: statusInfo.bg, color: statusInfo.color,
                                            border: `1px solid ${statusInfo.border}`,
                                            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    {/* Actions */}
                                    <div className="admin-col" style={{ flex: 1.2 }}
                                        onClick={e => e.stopPropagation()}>
                                        {isPending && isFinance && (
                                            <button
                                                className="admin-status-btn--approve"
                                                style={{ fontSize: 12, padding: '5px 12px' }}
                                                onClick={() => setFormModal({ open: true, editData: txn })}
                                            >
                                                <i className="fa-solid fa-pen" /> Sửa
                                            </button>
                                        )}
                                        {isPending && isLeader && (
                                            <div className="txn-leader-actions">
                                                <button
                                                    type="button"
                                                    className="admin-status-btn--approve txn-leader-btn"
                                                    onClick={() => handleLeaderReview(txn._id, 'approve')}
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-status-btn--reject txn-leader-btn"
                                                    onClick={() => handleLeaderReview(txn._id, 'reject')}
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        )}
                                        {!isPending && (
                                            <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {isExpanded && (
                                    <div style={{
                                        padding: '14px 24px', background: '#f9fafb',
                                        borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>Mô tả</span>
                                                <span style={{ fontSize: 14, color: '#111827' }}>{txn.description}</span>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>Người tạo</span>
                                                <span style={{ fontSize: 14, color: '#111827' }}>{creatorName}</span>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>Ngày tạo</span>
                                                <span style={{ fontSize: 14, color: '#111827' }}>{new Date(txn.created_at).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            {txn.approved_by && (
                                                <div>
                                                    <span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>Người duyệt</span>
                                                    <span style={{ fontSize: 14, color: '#111827' }}>
                                                        {approverDisplayName(txn)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="admin-pagination" style={{ marginTop: 16 }}>
                    <button className="admin-status-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        <i className="fa-solid fa-chevron-left" />
                    </button>
                    <span style={{ margin: '0 16px', color: '#6b7280' }}>
                        Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button className="admin-status-btn" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>
                        <i className="fa-solid fa-chevron-right" />
                    </button>
                </div>
            )}

            {/* Form Modal */}
            {isFinance ? (
                <TransactionForm
                    open={formModal.open}
                    onClose={() => setFormModal({ open: false, editData: null })}
                    clubId={clubId}
                    editData={formModal.editData}
                    onSuccess={fetchTransactions}
                />
            ) : null}
        </div>
    );
};

export default TransactionList;
