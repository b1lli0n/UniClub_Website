import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { createClub } from '../../api/clubApi';
import { getAllUsers } from '../../api/userApi';
import '../../styles/CreateClub.css';

const CATEGORY_OPTIONS = [
  { value: 'Học Thuật', label: 'Học Thuật' },
  { value: 'Thể Thao', label: 'Thể Thao' },
  { value: 'Nghệ Thuật', label: 'Nghệ Thuật' },
  { value: 'Sự Kiện', label: 'Sự Kiện' }
];

const CreateClub = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    category: null,
    members: []
  });

  const [memberEmail, setMemberEmail] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [validated, setValidated] = useState(false);

  // Scroll to top khi navigate đến trang này
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch danh sách users khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllUsers();
      let users = response.users;

      const options = users.map(user => {
        return {
          value: user._id,
          label: user.fullName || 'Chưa có tên',
          fullName: user.fullName
        };
      });
      
      setUserOptions(options);
    } catch (error) {
      console.error('❌ Error in fetchUsers:', error);
      toast.error('❌ Lỗi: ' + error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleMemberSelectChange = (selectedOption) => {
    if (selectedOption) {
      setMemberEmail(JSON.stringify({
        userId: selectedOption.value,
        fullName: selectedOption.fullName
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData({
      ...formData,
      category: selectedOption ? selectedOption.value : ''
    });
  };

  const handleAddMember = () => {
    const memberData = memberEmail.trim();
    
    if (!memberData) {
      toast.warning('Vui lòng chọn thành viên');
      return;
    }

    try {
      const member = JSON.parse(memberData);
      
      const alreadyExists = formData.members.some(m => 
        (typeof m === 'string' ? JSON.parse(m).userId : m.userId) === member.userId
      );
      
      if (alreadyExists) {
        toast.warning('Thành viên này đã được thêm');
        return;
      }

      setFormData({
        ...formData,
        members: [...formData.members, member]
      });
      setMemberEmail('');
      toast.success(`✅ Thêm thành viên thành công!`);
    } catch {
      toast.error('Lỗi khi thêm thành viên');
    }
  };

  const handleRemoveMember = (email) => {
    setFormData({
      ...formData,
      members: formData.members.filter(m => m !== email)
    });
    toast.info('Đã xóa thành viên');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      setFormData({
        ...formData,
        logo_url: file
      });
      // console.log('Selected logo file:', file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tên club
    if (!formData.name.trim()) {
      setValidated(true);
      toast.error('Vui lòng nhập tên câu lạc bộ');
      return;
    }

    // Kiểm tra danh mục
    if (!formData.category) {
      setValidated(true);
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    // Kiểm tra thành viên
    if (formData.members.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 thành viên');
      return;
    }

    if (formData.members.length < 1) {
      toast.error('Câu lạc bộ phải có ít nhất 1 thành viên');
      return;
    }

    setLoading(true);
    try {    
      const memberIds = formData.members.map(member => {
        const memberObj = typeof member === 'string' 
          ? JSON.parse(member) 
          : member;
        return memberObj.userId;
      }); 
      
    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);

    // gửi members
    memberIds.forEach(id => {
      formDataToSend.append("members", id);
    });

    // gửi file
    if (formData.logo_url) {
      formDataToSend.append("logo", formData.logo_url); // 👈 KEY PHẢI LÀ 'logo'
    }

      // console.log('Dữ liệu gửi đi:', dataToSubmit);
      await createClub(formDataToSend);
      toast.success('✅ Câu lạc bộ được tạo thành công!');
      
      // Reset form
      setFormData({ name: '', description: '', logo_url: '', category: null, members: [] });
      setLogoPreview('');
      setValidated(false);
      
      // Navigate to clubs page
      setTimeout(() => navigate('/clubs'), 1000);
    } catch (error) {
      console.error('Lỗi tạo club:', error);
      toast.error('❌ ' + (error.message || 'Có lỗi xảy ra khi tạo câu lạc bộ'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-club-page">
      <div className="create-club-container">
        <div className="create-club-header">
          <h1>Tạo Club Mới</h1>
          <p>Điền thông tin để tạo một club mới</p>
        </div>

        <Form onSubmit={handleSubmit} noValidate validated={validated}>
          {/* Club Information Section */}
          <div className="form-section">
            <h3 className="form-section-title">📋 Thông Tin Cơ Bản</h3>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tên Club <span>*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="VD: Web Development Club"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    isInvalid={validated && !formData.name.trim()}
                  />
                  <Form.Control.Feedback type="invalid">
                    Vui lòng nhập tên club
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Danh Mục <span>*</span></Form.Label>
                  <Select
                    name="category"
                    options={CATEGORY_OPTIONS}
                    placeholder="Chọn danh mục..."
                    value={CATEGORY_OPTIONS.find(opt => opt.value === formData.category) || null}
                    onChange={handleCategoryChange}
                    isClearable
                    isSearchable
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Mô Tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Nhập mô tả chi tiết về club..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Members Section */}
          <div className="form-section">
            <h3 className="form-section-title">👥 Thêm Thành Viên</h3>
            <Form.Group className="mb-3">
              <div className="d-flex gap-2 mb-3">
                <Select
                  options={userOptions}
                  placeholder="Chọn thành viên..."
                  isSearchable
                  isClearable
                  isLoading={loadingUsers}
                  onChange={handleMemberSelectChange}
                  noOptionsMessage={() => 'Không có thành viên nào'}
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      flex: 1
                    })
                  }}
                /> 
                <Button 
                  variant="outline-primary" 
                  onClick={handleAddMember}
                  className="flex-shrink-0"
                  style={{ padding: '0.95rem 1.5rem', fontWeight: 600, borderRadius: '1rem' }}
                >
                  Thêm
                </Button>
              </div>

              {formData.members.length > 0 && (
                <div>
                  <Form.Label className="mb-2" style={{ fontWeight: 700, fontSize: '1rem' }}>
                    Danh Sách Thành Viên ({formData.members.length})
                  </Form.Label>
                  <div className="members-list">
                    {formData.members.map((member, index) => {
                      const memberObj = typeof member === 'string' ? JSON.parse(member) : member;
                      return (
                        <div key={index} className="member-item">
                          <span>{memberObj.fullName}</span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                          >
                            Xóa
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Form.Group>
          </div>

          {/* Logo Section */}
          <div className="form-section">
            <h3 className="form-section-title">🖼️ Logo Câu lạc bộ</h3>
            <Form.Group className="mb-0">
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </Form.Group>

            {logoPreview && (
              <Form.Group className="mt-3 mb-0">
                <Form.Label className="mb-2" style={{ fontWeight: 700 }}>Xem Trước Logo</Form.Label>
                <div className="logo-preview-container">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="logo-preview"
                  />
                </div>
              </Form.Group>
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <Button 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="me-2"
            >
              Hủy
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
              className="px-4"
            >
              {loading ? 'Đang tạo...' : 'Tạo Câu lạc bộ'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CreateClub;
