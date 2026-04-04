import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { toast } from 'react-toastify';
import { createPointRule, getPointRules, updatePointRule, togglePointRule } from '../api/pointRulesApi';
import { getActionTypes  } from '../api/actionTypesAPI';
import '../styles/PointRulesManagement.css';

const PointRulesManagement = () => {
  const { id } = useParams();
console.log('PointRulesManagement mounted with clubId:',id);
  const [rules, setRules] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    action_type_id: '',
    achievement_point: 0,
    reward_point: 0,
    limit_per_event: 0,
    limit_per_day: 0,
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch action types and rules on mount
  useEffect(() => {
    fetchActionTypes();
    if (id) {
      fetchRules();
    }
  }, [id]);

  const fetchActionTypes = async () => {
    try {
      const data = await getActionTypes();
      setActionTypes(data || []);
    } catch (err) {
      console.error('Error fetching action types:', err);
    }
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await getPointRules(id);
      console.log('Raw point rules response:', data);
      const rulesArray = data?.rules || [];
      setRules(rulesArray);
      console.log('Fetched point rules:', rulesArray);
    } catch (err) {
      toast.error('Không thể tải danh sách quy tắc điểm');
      console.error(err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'achievement_point' ||
          name === 'reward_point' ||
          name === 'limit_per_event' ||
          name === 'limit_per_day'
        ? parseInt(value) || 0
        : value
    }));
  };

  const validateForm = () => {
    if (!formData.action_type_id.trim()) {
      return 'Vui lòng chọn loại hành động';
    }

    if (formData.achievement_point < 0) {
      return 'Điểm thành tích phải >= 0';
    }

    if (formData.reward_point < 0) {
      return 'Điểm thưởng phải >= 0';
    }

    if (formData.limit_per_event < 0) {
      return 'Giới hạn mỗi sự kiện phải >= 0';
    }

    if (formData.limit_per_day < 0) {
      return 'Giới hạn mỗi ngày phải >= 0';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await updatePointRule(id, editingId, formData);
        toast.success('Cập nhật quy tắc điểm thành công');
      } else {
              console.log('Fetching point rules for clubId:', id);
        await createPointRule(id, formData);
        toast.success('Tạo quy tắc điểm thành công');
      }

      // Reset form
      setFormData({
        action_type_id: '',
        achievement_point: 0,
        reward_point: 0,
        limit_per_event: 0,
        limit_per_day: 0,
        is_active: true,
      });
      setEditingId(null);
      setShowForm(false);

      // Refresh rules
      await fetchRules();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu quy tắc điểm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      action_type_id: rule.action_type_id?._id,
      achievement_point: rule.achievement_point,
      reward_point: rule.reward_point,
      limit_per_event: rule.limit_per_event,
      limit_per_day: rule.limit_per_day,
      is_active: rule.is_active,
    });
    setEditingId(rule._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setFormData({
      action_type_id: '',
      achievement_point: 0,
      reward_point: 0,
      limit_per_event: 0,
      limit_per_day: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleToggleActive = async (rule) => {
    const newStatus = !rule.is_active;
    const action = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
    
    setLoading(true);
    
    await toast.promise(
      (async () => {
        await togglePointRule(id, rule._id);
        await fetchRules();
      })(),
      {
        pending: `Đang ${action}...`,
        success: `${action === 'kích hoạt' ? 'Kích hoạt' : 'Vô hiệu hóa'} quy tắc điểm thành công`,
        error: {
          render() {
            return `Không thể ${action} quy tắc điểm`;
          }
        }
      }
    );
    
    setLoading(false);
  };

  return (
    <div className="point-rules-container">
      <h1 className="point-rules-title">Quản lý Quy Tắc Điểm</h1>

      {/* Form Section */}
      {showForm && (
        <div className="form-card">
          <h2 className="form-title">
            {editingId ? 'Cập nhật Quy Tắc Điểm' : 'Tạo Quy Tắc Điểm Mới'}
          </h2>

          <form onSubmit={handleSubmit} className="point-rules-form">
            <div className="form-group">
              <label className="form-label">
                Loại Hành Động <span className="required">*</span>
              </label>
              <select
                name="action_type_id"
                value={formData.action_type_id}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="">-- Chọn loại hành động --</option>
                {actionTypes.map(actionType => (
                  <option key={actionType._id} value={actionType._id}>
                    {actionType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Điểm Thành Tích <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="achievement_point"
                  value={formData.achievement_point}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Điểm Thưởng <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="reward_point"
                  value={formData.reward_point}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Giới hạn mỗi Sự kiện <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="limit_per_event"
                  value={formData.limit_per_event}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Giới hạn mỗi Ngày <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="limit_per_day"
                  value={formData.limit_per_day}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span>Kích hoạt quy tắc này</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn btn-secondary"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-create"
        >
          + Tạo Quy Tắc Điểm Mới
        </button>
      )}

      {/* Rules List */}
      <div className="rules-section">
        <h2 className="section-title">Danh Sách Quy Tắc Điểm</h2>

        {loading && !showForm ? (
          <div className="loading">Đang tải...</div>
        ) : rules.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có quy tắc điểm nào</p>
            <p className="text-muted">Hãy tạo quy tắc điểm đầu tiên của bạn</p>
          </div>
        ) : (
          <div className="rules-grid">
            {rules.map(rule => (
              <div key={rule._id} className="rule-card">
                <div className="rule-header">
                  <h3 className="rule-name">
                  {rule.action_type_id?.name}
                  </h3>
                  <span 
                    className={`status-badge ${rule.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(rule)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    title="Click để thay đổi trạng thái"
                  >
                    {rule.is_active ? 'Kích hoạt' : 'Vô hiệu'}
                  </span>
                </div>

                <div className="rule-details">
                  <div className="detail-item">
                    <span className="detail-label">Điểm Thành Tích:</span>
                    <span className="detail-value">{rule.achievement_point}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điểm Thưởng:</span>
                    <span className="detail-value">{rule.reward_point}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Giới hạn/Sự kiện:</span>
                    <span className="detail-value">{rule.limit_per_event}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Giới hạn/Ngày:</span>
                    <span className="detail-value">{rule.limit_per_day}</span>
                  </div>
                </div>

                <div className="rule-actions">
                  <button
                    onClick={() => handleEdit(rule)}
                    disabled={loading}
                    className="btn btn-small btn-edit"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PointRulesManagement;
