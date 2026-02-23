import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { createClub } from '../api/clubAPI';
import { getAllUsers } from '../api/userApi';

const CATEGORY_OPTIONS = [
  { value: 'Học Thuật', label: 'Học Thuật' },
  { value: 'Thể Thao', label: 'Thể Thao' },
  { value: 'Nghệ Thuật', label: 'Nghệ Thuật' },
  { value: 'Sự Kiện', label: 'Sự Kiện' }
];

const CreateClubModal = ({ show, onHide }) => {
  // console.log('🎨 CreateClubModal rendered, show =', show);
  
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

  // Fetch danh sách users khi modal mở
  useEffect(() => {
    if (show) {;
      fetchUsers();
    }
  }, [show]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      //Fetch all users
      const response = await getAllUsers();

      //Gán object users từ response
      let users = response.users;

      // if (users.length === 0) {
      //   toast.warning('Không có thành viên nào');
      // }
      
      const options = users.map(user => {
        return {
          value: user._id, //Dữ liệu lấy được
          label: user.fullName || 'Chưa có tên', //Hiển thị trong dropdown
          fullName: user.fullName
        };
      });
      
      setUserOptions(options);
      
    //   if (options.length > 0) {
    //     toast.success(`✅ Lấy được ${options.length} thành viên`);
    //   }

    } catch (error) {
      console.error('❌ Error in fetchUsers:', error);
      toast.error('❌ Lỗi: ' + error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleMemberSelectChange = (selectedOption) => {
    if (selectedOption) {
      // Lưu object {userId, name} để tracking
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
      
      // Kiểm tra xem userId đã có trong danh sách chưa
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
      toast.success(`✅ Thêm thành viên thành công! (${formData.members.length + 1}/5)`);
    } catch (error) {
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData({
          ...formData,
          logo_url: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Kiểm tra tên club
    if (!formData.name.trim()) {
      form.classList.add('was-validated');
      toast.error('Vui lòng nhập tên club');
      return;
    }

    // Kiểm tra danh mục
    if (!formData.category) {
      form.classList.add('was-validated');
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    // Kiểm tra thành viên
    if (formData.members.length === 0) {
      toast.error('Vui lòng thêm ít nhất 5 thành viên để làm leader');
      return;
    }

    if (formData.members.length < 5) {
      toast.error('Club phải có ít nhất 5 thành viên');
      return;
    }

    setLoading(true);
    try {
      // Lấy leader_id từ member đầu tiên
      const firstMember = typeof formData.members[0] === 'string' 
        ? JSON.parse(formData.members[0]) 
        : formData.members[0];
      
      // Convert members từ object thành array chỉ chứa userId
      const memberIds = formData.members.map(member => {
        const memberObj = typeof member === 'string' 
          ? JSON.parse(member) 
          : member;
        return memberObj.userId;
      });
      
      const dataToSubmit = {
        ...formData,
        members: memberIds,
        leader_id: firstMember.userId
      };
      
      // Gửi dữ liệu đến API backend
      await createClub(dataToSubmit);
      toast.success('✅ Club được tạo thành công!');
      
      // Reset form
      setFormData({ name: '', description: '', logo_url: '', category: null, members: [] });
      setLogoPreview('');
      form.classList.remove('was-validated');
      
      // Đóng modal
      onHide();
    } catch (error) {
      console.error('Lỗi tạo club:', error);
      toast.error('❌ ' + (error.message || 'Có lỗi xảy ra khi tạo club'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Tạo Club Mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            {/* Cột trái: Thông tin club */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên Club <span style={{ color: 'red' }}>*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Nhập tên club"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô Tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Nhập mô tả về club"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Danh Mục <span style={{ color: 'red' }}>*</span></Form.Label>
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

            {/* Cột phải: Thêm thành viên */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><strong>Thêm Thành Viên</strong></Form.Label>
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
                  >
                    Thêm
                  </Button>
                </div>

                {formData.members.length > 0 && (
                  <div>
                    <Form.Label className="mb-2">Danh Sách ({formData.members.length})</Form.Label>
                    <div style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '0.375rem',
                      padding: '0.75rem',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: '#f8f9fa'
                    }}>
                      {formData.members.map((member, index) => {
                        const memberObj = typeof member === 'string' ? JSON.parse(member) : member;
                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.5rem',
                              borderBottom: index < formData.members.length - 1 ? '1px solid #dee2e6' : 'none',
                              backgroundColor: '#fff'
                            }}
                          >
                            <span>{memberObj.name}</span>
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
            </Col>
          </Row>

          {/* Logo: Dưới cùng */}
          <Form.Group className="mb-3">
            <Form.Label>Logo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </Form.Group>

          {logoPreview && (
            <Form.Group className="mb-3 text-center">
              <Form.Label>Preview Logo</Form.Label>
              <div style={{
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa'
              }}>
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }} 
                />
              </div>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Đang tạo...' : 'Tạo Club'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateClubModal;
