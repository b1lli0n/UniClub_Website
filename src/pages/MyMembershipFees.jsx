import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { createPaymentUrl } from '../api/paymentApi';
import { getUserClubs, listMyMembershipFees } from '../api/userApi';
import '../styles/MyMembershipFees.css';

const STATUS_LABELS = {
  '0': 'Chưa thanh toán',
  '1': 'Đã thanh toán',
  '2': 'Thanh toán thất bại'
};

const getStatusLabel = (status) => STATUS_LABELS[String(status)] || 'UNKNOWN';

const FILTER_OPTIONS = [
  { value: '-1', label: 'Tất cả trạng thái' },
  { value: '0', label: 'Chưa thanh toán' },
  { value: '1', label: 'Đã thanh toán' },
  { value: '2', label: 'Thanh toán thất bại' }
];

const PAGE_SIZE = 10;

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} VND`;

const formatCreatedDate = (value) => {
  if (!value) {
    return 'Chua cap nhat';
  }

  if (typeof value === 'string') {
    const datePart = value.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Chua cap nhat';
  }

  return parsedDate.toLocaleDateString('vi-VN', { timeZone: 'UTC' });
};

const parseDateOnly = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const datePart = value.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const isOverdueFee = (item) => {
  if (Number(item?.status) !== 0) return false;

  const createdDate = parseDateOnly(item?.created_at || item?.createdAt);
  if (!createdDate) return false;

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return createdDate < todayDate;
};

const DEFAULT_SUMMARY = {
  unpaid: 0,
  paid: 0,
  failed: 0,
  all: 0
};

const extractListPayload = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      items: [],
      summary: DEFAULT_SUMMARY,
      total: 0,
      page: 1,
      limit: 20
    };
  }

  return {
    items: Array.isArray(data.items) ? data.items : [],
    summary: data.summary || DEFAULT_SUMMARY,
    total: Number(data.total) || 0,
    page: Number(data.page) || 1,
    limit: Number(data.limit) || 20
  };
};

export default function MyMembershipFees() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [periodOptions, setPeriodOptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [statusFilter, setStatusFilter] = useState('-1');
  const [clubFilter, setClubFilter] = useState('-1');
  const [periodFilter, setPeriodFilter] = useState('-1');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFee, setSelectedFee] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  useEffect(() => {
    let canceled = false;

    const loadClubs = async () => {
      try {
        const userId = user?._id || user?.id;
        if (!userId) return;

        const response = await getUserClubs(userId);
        const rawItems = response?.data?.clubs || response?.data || response?.clubs || response || [];

        const mappedClubs = Array.isArray(rawItems)
          ? rawItems
              .map((item, index) => {
                const club = item?.club_id || item?.club || item || {};
                return {
                  id: club?._id || club?.id || `club-${index}`,
                  name: club?.name || `Cau lac bo #${index + 1}`
                };
              })
              .filter((club) => club.id)
          : [];

        if (!canceled) {
          setClubs(mappedClubs);
        }
      } catch {
        if (!canceled) {
          setClubs([]);
        }
      }
    };

    loadClubs();

    return () => {
      canceled = true;
    };
  }, [user]);

  useEffect(() => {
    let canceled = false;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const userId = user?._id || user?.id;
        if (!userId) {
          throw new Error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        }

        const requestParams = {
          page: currentPage,
          limit: PAGE_SIZE
        };

        if (statusFilter !== '-1') {
          requestParams.status = Number(statusFilter);
        }

        if (clubFilter !== '-1') {
          requestParams.club_id = clubFilter;
        }

        if (periodFilter !== '-1') {
          requestParams.period = periodFilter;
        }

        const responseData = await listMyMembershipFees(requestParams);
        const result = extractListPayload(responseData);

        if (!canceled) {
          const safeResult = result || {
            items: [],
            summary: DEFAULT_SUMMARY,
            total: 0,
            page: 1,
            limit: 20
          };

          setFees(safeResult.items);
          setPeriodOptions((prev) => {
            const fromItems = safeResult.items
              .map((item) => item?.period)
              .filter(Boolean)
              .map((p) => String(p));
            const merged = new Set([...prev, ...fromItems]);
            return Array.from(merged).sort();
          });
          setPagination({
            page: safeResult.page,
            limit: safeResult.limit,
            total: safeResult.total
          });
        }
      } catch (err) {
        if (!canceled) {
          setError(err?.message || 'Không thể tải danh sách phí thành viên.');
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      canceled = true;
    };
  }, [user, statusFilter, clubFilter, periodFilter, currentPage]);

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || PAGE_SIZE)));

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleClubFilterChange = (event) => {
    setClubFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePeriodFilterChange = (event) => {
    setPeriodFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (!loading && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (!loading && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleVnpayPayment = async (item) => {
    try {
      setIsCreatingPayment(true);

      const payload = {
        club_id: item?.club_id,
        period: item?.period,
        amount: Number(item?.amount) || undefined,
      };
      // console.log('Creating VNPay payment with payload:', payload);
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      const response = await createPaymentUrl(payload);
      const paymentUrl = response?.paymentUrl;

      if (!paymentUrl) {
        toast.error('Không lấy được liên kết thanh toán VNPay từ máy chủ.');
        return;
      }

      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      closePaymentMethodModal();
    } catch (err) {
      toast.error(err?.message || 'Không thể tạo thanh toán VNPay.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const openPaymentMethodModal = (item) => {
    setSelectedFee(item);
    setIsPaymentModalOpen(true);
  };

  const closePaymentMethodModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedFee(null);
  };

  const handleChoosePaymentMethod = (method) => {
    if (!selectedFee) {
      toast.error('Không tìm thấy khoản phí cần thanh toán.');
      return;
    }

    if (method === 'vnpay') {
      handleVnpayPayment(selectedFee);
      return;
    }

    if (method === 'cash') {
      toast.info('Bạn đã chọn thanh toán tiền mặt. Vui lòng liên hệ CLB để được hướng dẫn thu phí.');
      closePaymentMethodModal();
    }
  };

  const handleViewReceipt = (item) => {
    const orderInfo =
      item?.order_info ||
      item?.orderInfo ||
      `Membership fee payment (${item?.period || 'N/A'})`;

    const params = new URLSearchParams({
      status: String(item?.status ?? ''),
      txnRef: item?.txn_ref || item?.txnRef || '',
      paymentId: item?.payment_id || item?._id || '',
      vnpResponseCode: Number(item?.status) === 1 ? '00' : '99',
      vnpPaydate: item?.paid_at || item?.payment_date || item?.created_at || '',
      vnpOrderInfo: orderInfo
    });

    navigate(`/payment/receipt?${params.toString()}`);
  };

  return (
    <div className="my-fees-page">
      <div className="my-fees-container">

        <div className="my-fees-toolbar">
          <label htmlFor="club-filter" className="my-fees-filter-label">Lọc theo câu lạc bộ</label>
          <select
            id="club-filter"
            className="my-fees-filter-select"
            value={clubFilter}
            onChange={handleClubFilterChange}
            disabled={loading}
          >
            <option value="-1">Tất cả câu lạc bộ</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>

          <label htmlFor="status-filter" className="my-fees-filter-label">Lọc theo trạng thái</label>
          <select
            id="status-filter"
            className="my-fees-filter-select"
            value={statusFilter}
            onChange={handleFilterChange}
            disabled={loading}
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <label htmlFor="period-filter" className="my-fees-filter-label">Lọc theo kỳ</label>
          <select
            id="period-filter"
            className="my-fees-filter-select"
            value={periodFilter}
            onChange={handlePeriodFilterChange}
            disabled={loading}
          >
            <option value="-1">Tất cả kỳ</option>
            {periodOptions.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
{/* 
        <div className="my-fees-summary-grid">
          <div className="my-fees-card my-fees-summary-card">
            <p>Chua thanh toan</p>
            <strong>{summary.unpaid || 0}</strong>
          </div>
          <div className="my-fees-card my-fees-summary-card">
            <p>Da thanh toan</p>
            <strong>{summary.paid || 0}</strong>
          </div>
          <div className="my-fees-card my-fees-summary-card">
            <p>That bai</p>
            <strong>{summary.failed || 0}</strong>
          </div>
          <div className="my-fees-card my-fees-summary-card">
            <p>Tong</p>
            <strong>{summary.all || 0}</strong>
          </div>
        </div> */}

        {loading && (
          <div className="my-fees-card my-fees-center">Đang tải danh sách...</div>
        )}

        {!loading && error && (
          <div className="my-fees-card my-fees-center my-fees-error">{error}</div>
        )}

        {!loading && !error && fees.length === 0 && (
          <div className="my-fees-card my-fees-center">Chưa có phí cần đóng.</div>
        )}

        {!loading && !error && fees.length > 0 && (
          <div className="my-fees-table-wrap my-fees-card">
            <div className="my-fees-table-head my-fees-row">
              <span>Câu lạc bộ</span>
              <span>Kỳ</span>
              <span>Ngày tạo</span>
              <span>Số tiền</span>
              <span>Trạng thái</span>
            </div>

            {fees.map((item) => (
              <div key={item._id || item.txn_ref || `${item.membership_id}-${item.period}-${item.created_at}`} className="my-fees-row my-fees-item">
                <span>{item.club_name || 'Chua ro CLB'}</span>
                <span>{item.period || 'Chua cap nhat'}</span>
                <span>
                  {formatCreatedDate(item.created_at)}
                </span>
                <strong>{formatCurrency(item.amount)}</strong>
                <div className="my-fees-status-actions">
                  {Number(item.status) === 0 && !isOverdueFee(item) ? (
                    <button
                      type="button"
                      className="my-fees-pay-btn"
                      onClick={() => openPaymentMethodModal(item)}
                    >
                      Cần thanh toán
                    </button>
                  ) : Number(item.status) === 0 && isOverdueFee(item) ? (
                    <span className="my-fees-overdue-msg">
                      Đã quá hạn thanh toán khoản phí này
                    </span>
                  ) : (
                    <span className={`my-fees-status status-${String(item.status || '').toLowerCase()}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  )}

                  {[1, 2].includes(Number(item.status)) && (
                    <button
                      type="button"
                      className="my-fees-view-btn"
                      onClick={() => handleViewReceipt(item)}
                      aria-label="Xem biên lai"
                      title="Xem biên lai"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* <div className="my-fees-footer-note">
              Trang {pagination.page} • Hien thi toi da {pagination.limit} ban ghi • Tong {pagination.total} ban ghi
            </div> */}

            <div className="my-fees-pagination">
              <button
                type="button"
                className="my-fees-page-btn"
                onClick={handlePrevPage}
                disabled={loading || currentPage <= 1}
              >
                Trang trước
              </button>
              <span className="my-fees-page-text">Trang {currentPage}/{totalPages}</span>
              <button
                type="button"
                className="my-fees-page-btn"
                onClick={handleNextPage}
                disabled={loading || currentPage >= totalPages}
              >
                Trang sau
              </button>
            </div>
          </div>
        )}

        {isPaymentModalOpen && selectedFee && (
          <div
            className="my-fees-modal-overlay"
            role="presentation"
            onClick={closePaymentMethodModal}
          >
            <div
              className="my-fees-payment-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-method-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 id="payment-method-title">Chọn phương thức thanh toán</h3>
              <p>
                Khoản phí: <strong>{formatCurrency(selectedFee.amount)}</strong>
              </p>
              <p>
                Câu lạc bộ: <strong>{selectedFee.club_name || 'Chua ro CLB'}</strong>
              </p>

              <div className="my-fees-payment-actions">
                <button
                  type="button"
                  className="my-fees-method-btn my-fees-method-vnpay"
                  onClick={() => handleChoosePaymentMethod('vnpay')}
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? 'Đang tạo link...' : 'Thanh toán bằng VNPay'}
                </button>
                <button
                  type="button"
                  className="my-fees-method-btn my-fees-method-cash"
                  onClick={() => handleChoosePaymentMethod('cash')}
                  disabled={isCreatingPayment}
                >
                  Thanh toán tiền mặt
                </button>
              </div>

              <button
                type="button"
                className="my-fees-method-close"
                onClick={closePaymentMethodModal}
                disabled={isCreatingPayment}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
