import React from 'react'
import '../styles/About.css'

const About = () => {
  return (
    <div className="home-page">
      <div className="home-overlay" />
      <div className="myclub-container">
        <header className="myclub-header">
          <h1 className="myclub-title">Về Chúng Tôi</h1>
        </header>

        <div className="about-grid">
          {/* Giới thiệu chung */}
          <div className="glass-card about-card">
            <h2 className="about-title">
              Giới Thiệu Về Câu Lạc Bộ
            </h2>
            <p className="about-text">
              Câu lạc bộ của chúng tôi được thành lập với mục đích tạo ra một cộng đồng học tập,
              phát triển kỹ năng và giao lưu giữa các bạn sinh viên. Chúng tôi tin rằng sự
              cộng tác và chia sẻ kiến thức là chìa khóa để thành công.
            </p>
          </div>

          {/* Giá trị cốt lõi */}
          <div className="about-values-grid">
            {[
              {
                title: 'Sáng Tạo',
                description: 'Khuyến khích sáng kiến và ý tưởng mới từ mọi thành viên',
                icon: '💡'
              },
              {
                title: 'Cộng Tác',
                description: 'Làm việc cùng nhau để đạt được mục tiêu chung',
                icon: '🤝'
              },
              {
                title: 'Phát Triển',
                description: 'Nâng cao kỹ năng và kiến thức cá nhân liên tục',
                icon: '📈'
              },
              {
                title: 'Cộng Đồng',
                description: 'Xây dựng một cộng đồng ấm áp và hỗ trợ nhau',
                icon: '👥'
              }
            ].map((value, index) => (
              <div key={index} className="glass-card about-value-card">
                <div className="about-value-icon">
                  {value.icon}
                </div>
                <h3 className="about-value-title">
                  {value.title}
                </h3>
                <p className="about-value-text">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          {/* Lịch sử thành lập */}
          <div className="glass-card about-card">
            <h2 className="about-title">
              Lịch Sử Của Chúng Tôi
            </h2>
            <div className="about-history-list">
              {[
                { year: '2020', event: 'Câu lạc bộ được thành lập bởi một nhóm sinh viên đam mê' },
                { year: '2021', event: 'Phát triển các hoạt động đầu tiên và tăng số lượng thành viên' },
                { year: '2022', event: 'Tổ chức hội thảo và workshop đầu tiên' },
                { year: '2024', event: 'Mở rộng hoạt động và phát triển ứng dụng quản lý câu lạc bộ' }
              ].map((item, index) => (
                <div key={index} className="about-history-item">
                  <div className="about-history-year">
                    {item.year}
                  </div>
                  <div className="about-history-event">
                    {item.event}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liên hệ */}
          <div className="glass-card about-card about-contact-card">
            <h2 className="about-title">
              Hãy Liên Hệ Với Chúng Tôi
            </h2>
            <p className="about-contact-text">
              Nếu bạn muốn biết thêm thông tin hoặc muốn tham gia, hãy liên hệ với chúng tôi qua các kênh sau:
            </p>
            <div className="about-contact-list">
              <div className="about-contact-item">
                <span className="about-contact-icon">📧</span>
                <span className="about-contact-value">Email: contact@clubuniverse.edu.vn</span>
              </div>
              <div className="about-contact-item">
                <span className="about-contact-icon">📱</span>
                <span className="about-contact-value">Phone: (024) 1234-5678</span>
              </div>
              <div className="about-contact-item">
                <span className="about-contact-icon">📍</span>
                <span className="about-contact-value">Địa chỉ: Phòng 302, Tòa nhà A, Đại học XYZ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
