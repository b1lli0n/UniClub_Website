import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllJoinRequestsOfClubs } from '../api/requestApi';
import { getJoinRequestDetail } from '../api/clubApi';

const typeOptions = [
  { value: '', label: 'Tất cả loại' },
  { value: 0, label: 'Yêu cầu tham gia' },
  { value: 1, label: 'Lời mời' },
];
const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 0, label: 'Chờ duyệt' },
  { value: 1, label: 'Đã duyệt' },
  { value: 2, label: 'Từ chối' },
  { value: 3, label: 'Đã hủy' },
];

export default function JoinRequests() {
  const { clubId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllJoinRequestsOfClubs(clubId, { type, status, page, limit });
    //   console.log('JoinRequests API result:', res);
      const data = Array.isArray(res.requests.requests) ? res.requests.requests : [];
      console.log('JoinRequests data:', data);
      setRequests(data);
    } catch (err) {
      console.error('Lỗi tải danh sách duyệt thành viên:', err);
      setRequests([]);
    }
    setLoading(false);
  };

 useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [clubId, page, type, status]);


  return (
    <div>
      <h2>Duyệt Tham gia CLB</h2>
      <div style={{ marginBottom: 16 }}>
        <select value={type} onChange={e => setType(e.target.value)}>
          {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ marginLeft: 8 }}>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      {loading ? <div>Đang tải...</div> : (
        requests.length === 0 ? <div style={{margin:'16px 0'}}>Không có yêu cầu nào để duyệt.</div> :
        <table border="1" cellPadding="8" style={{ width: '100%', marginBottom: 16 }}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Người gửi</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={req._id}>
                <td>{(page - 1) * limit + idx + 1}</td>
                  <td>{req.user_id?.fullName || req.user_id?.full_name || 'Ẩn danh'}</td>
                  <td>{req.type === 1 ? 'Lời mời' : req.type === 0 ? 'Yêu cầu' : 'Không rõ'}</td>
                <td>{['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hủy'][req.status] || 'Không rõ'}</td>
                <td>{req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}</td>
                <td><button onClick={() => handleSelect(req)}>Xem chi tiết</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>
        Trang: <button disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
        <span style={{ margin: '0 8px' }}>{page}</span>
        <button disabled={requests.length < limit} onClick={() => setPage(page + 1)}>Sau</button>
      </div>
      {selected && (
        <div style={{ marginTop: 24, border: '1px solid #ccc', padding: 16 }}>
          <h3>Chi tiết yêu cầu</h3>
          <pre>{JSON.stringify(selected, null, 2)}</pre>
          <button onClick={() => setSelected(null)}>Đóng</button>
        </div>
      )}
    </div>
  );
}
