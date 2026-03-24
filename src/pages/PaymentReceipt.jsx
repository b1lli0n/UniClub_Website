import React, { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import '../styles/PaymentReceipt.css';

const STATUS_LABELS = {
  0: 'Chờ thanh toán',
  1: 'Đã thanh toán',
  2: 'Thanh toán thất bại'
};

const readJSONParam = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(rawValue));
    } catch {
      return null;
    }
  }
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatPaymentDate = (value) => {
  if (!value) {
    return '--';
  }

  const raw = String(value).trim();

  // VNPay format: yyyyMMddHHmmss
  if (/^\d{14}$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = raw.slice(8, 10);
    const minute = raw.slice(10, 12);
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export default function PaymentReceipt() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const receiptData = useMemo(() => {
    const jsonPayload =
      readJSONParam(searchParams.get('data')) ||
      readJSONParam(searchParams.get('payload')) ||
      readJSONParam(searchParams.get('result'));

    const fromQuery = {
      paymentId: searchParams.get('paymentId'),
      txnRef: searchParams.get('txnRef'),
      orderInfo: searchParams.get('vnpOrderInfo'),
      paymentDate: searchParams.get('vnpPaydate'),
      status: searchParams.get('status'),
    //   vnpResponseCode: searchParams.get('vnpResponseCode')
    };

    const fromState = location.state?.receipt || location.state?.paymentResult || location.state || {};

    const merged = {
      ...fromQuery,
      ...(jsonPayload || {}),
      ...(typeof fromState === 'object' ? fromState : {})
    };

    const resolvedStatusRaw =
      merged.status ??
      merged.vnpTransactionStatus ??
      merged.vnp_TransactionStatus ??
      (merged.vnpResponseCode === '00' || merged.vnp_ResponseCode === '00' ? '1' : null);

    const normalizedStatus =
      resolvedStatusRaw === '00'
        ? 1
        : toNumberOrNull(resolvedStatusRaw);

    return {
      paymentId: merged.paymentId || '--',
      txnRef: merged.txnRef || '--',
      orderInfo: merged.orderInfo || merged.vnpOrderInfo || '--',
      paymentDate: merged.paymentDate || merged.vnpPaydate || '--',
      status: normalizedStatus,
    //   vnpResponseCode: merged.vnpResponseCode || merged.vnp_ResponseCode || '--'
    };
  }, [location.state, searchParams]);

  const isSuccess = receiptData.vnpResponseCode === '00' || receiptData.status === 1;
  const statusLabel = STATUS_LABELS[receiptData.status] || (isSuccess ? 'Đã thanh toán' : 'Đang xử lý');

  return (
    <section className="receipt-page">
      <div className="receipt-card">
        <div className={`receipt-badge ${isSuccess ? 'success' : 'pending'}`}>
          {isSuccess ? 'Thanh toán thành công' : 'Cần kiểm tra lại giao dịch'}
        </div>

        <h1>Biên lai thanh toán</h1>
        <p className="receipt-subtitle">Chi tiết giao dịch từ hệ thống thanh toán.</p>

        <div className="receipt-grid">
          <div className="receipt-item">
            <span>Mã thanh toán</span>
            <strong>{receiptData.paymentId}</strong>
          </div>

          <div className="receipt-item">
            <span>Mã giao dịch (TxnRef)</span>
            <strong>{receiptData.txnRef}</strong>
          </div>

          <div className="receipt-item">
            <span>Thông tin giao dịch</span>
            <strong>{receiptData.orderInfo}</strong>
          </div>

          <div className="receipt-item">
            <span>Ngày thanh toán</span>
            <strong>{formatPaymentDate(receiptData.paymentDate)}</strong>
          </div>

          <div className="receipt-item">
            <span>Trạng thái</span>
            <strong>{statusLabel}</strong>
          </div>
        </div>

        <div className="receipt-actions">
          <Link className="receipt-btn secondary" to="/my-membership-fees">
            Về danh sách phí
          </Link>
          <Link className="receipt-btn primary" to="/">
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}
