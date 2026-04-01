import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { createTransaction, updateTransaction } from '../../api/transactionApi';

// Danh mục gợi ý
const INCOME_CATEGORIES = ['Phí thành viên', 'Tài trợ', 'Đóng góp sự kiện', 'Bán hàng', 'Khác'];
const EXPENSE_CATEGORIES = ['Thuê địa điểm', 'Mua vật tư', 'In ấn', 'Chi phí sự kiện', 'Thiết bị', 'Khác'];

/**
 * Modal Form tạo / sửa giao dịch tài chính
 * @param {boolean}  open          - Trạng thái mở/đóng
 * @param {Function} onClose       - Callback đóng modal
 * @param {string}   clubId        - ID của CLB
 * @param {object|null} editData   - Null = create, Object = edit mode
 * @param {Function} onSuccess     - Callback sau khi lưu thành công
 */
const TransactionForm = ({ open, onClose, clubId, editData = null, onSuccess }) => {
    const isEdit = !!editData;

    const [form, setForm] = useState({
        type: 0,
        category: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });
    const [saving, setSaving] = useState(false);

    // Populate form khi edit
    useEffect(() => {
        if (!open) return;
        if (isEdit && editData) {
            setForm({
                type: editData.type ?? 0,
                category: editData.category || '',
                amount: editData.amount || '',
                description: editData.description || '',
                transaction_date: editData.transaction_date
                    ? new Date(editData.transaction_date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
            });
        } else {
            setForm({
                type: 0,
                category: '',
                amount: '',
                description: '',
                transaction_date: new Date().toISOString().split('T')[0],
            });
        }
    }, [open, isEdit, editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: name === 'type' ? Number(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category || !form.amount || !form.description || !form.transaction_date) {
            toast.warn('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (Number(form.amount) <= 0) {
            toast.warn('Số tiền phải lớn hơn 0');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (isEdit) {
                await updateTransaction(clubId, editData._id, payload);
                toast.success('Đã cập nhật giao dịch');
            } else {
                await createTransaction(clubId, payload);
                toast.success('Đã tạo yêu cầu giao dịch');
            }
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('TransactionForm error:', err);
            toast.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const categories = form.type === 0 ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return ReactDOM.createPortal(
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#fff', borderRadius: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6'
                }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
                        <i className={`fa-solid fa-${isEdit ? 'pen' : 'plus'}`}
                            style={{ color: '#6366f1', marginRight: 8 }} />
                        {isEdit ? 'Cập nhật giao dịch' : 'Tạo giao dịch mới'}
                    </h3>
                    <button className="reward-modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Loại giao dịch */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                            Loại giao dịch <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[
                                { value: 0, label: '💰 Thu', color: '#10b981' },
                                { value: 1, label: '💸 Chi', color: '#ef4444' },
                            ].map(opt => (
                                <label key={opt.value} style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '10px 0',
                                    border: `2px solid ${form.type === opt.value ? opt.color : '#e5e7eb'}`,
                                    borderRadius: 10, cursor: 'pointer',
                                    background: form.type === opt.value ? `${opt.color}15` : '#fff',
                                    fontWeight: 600, fontSize: 14, color: form.type === opt.value ? opt.color : '#6b7280',
                                    transition: 'all 0.18s'
                                }}>
                                    <input type="radio" name="type" value={opt.value} checked={form.type === opt.value}
                                        onChange={handleChange} style={{ display: 'none' }} />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Danh mục */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Danh mục <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select name="category" value={form.category} onChange={handleChange}
                            style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db', borderRadius: 9, fontSize: 14, color: '#1f2937', outline: 'none' }}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Số tiền */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Số tiền (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input type="number" name="amount" value={form.amount} onChange={handleChange} min={1}
                            placeholder="VD: 500000"
                            style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db', borderRadius: 9, fontSize: 14, color: '#1f2937', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Mô tả <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                            placeholder="Nhập mô tả chi tiết giao dịch..."
                            style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db', borderRadius: 9, fontSize: 14, color: '#1f2937', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Ngày giao dịch */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Ngày giao dịch <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange}
                            style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #d1d5db', borderRadius: 9, fontSize: 14, color: '#1f2937', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                        <button type="button" className="reward-btn-cancel" onClick={onClose} disabled={saving}>Hủy</button>
                        <button type="submit" className="reward-btn-submit" disabled={saving}>
                            {saving
                                ? <><i className="fa-solid fa-spinner fa-spin" /> Đang lưu...</>
                                : <><i className="fa-solid fa-floppy-disk" /> {isEdit ? 'Cập nhật' : 'Tạo giao dịch'}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

TransactionForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    clubId: PropTypes.string.isRequired,
    editData: PropTypes.object,
    onSuccess: PropTypes.func,
};

export default TransactionForm;
