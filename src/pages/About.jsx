import React from 'react'

const About = () => {
  return (
    <div className="home-page">
      <div className="home-overlay" />
      <div className="myclub-container">
        <header className="myclub-header">
          <h1 className="myclub-title">Về Chúng Tôi</h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Giới thiệu chung */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--candy-text)', marginTop: 0 }}>
              Giới Thiệu Về Câu Lạc Bộ
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--candy-text)', opacity: 0.8 }}>
              Câu lạc bộ của chúng tôi được thành lập với mục đích tạo ra một cộng đồng học tập,
              phát triển kỹ năng và giao lưu giữa các bạn sinh viên. Chúng tôi tin rằng sự
              cộng tác và chia sẻ kiến thức là chìa khóa để thành công.
            </p>
          </div>

          {/* Giá trị cốt lõi */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
              <div
                key={index}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                  {value.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--candy-text)', margin: '0 0 12px 0' }}>
                  {value.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--candy-text)', opacity: 0.7, margin: 0 }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          {/* Lịch sử thành lập */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--candy-text)', marginTop: 0 }}>
              Lịch Sử Của Chúng Tôi
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { year: '2020', event: 'Câu lạc bộ được thành lập bởi một nhóm sinh viên đam mê' },
                { year: '2021', event: 'Phát triển các hoạt động đầu tiên và tăng số lượng thành viên' },
                { year: '2022', event: 'Tổ chức hội thảo và workshop đầu tiên' },
                { year: '2024', event: 'Mở rộng hoạt động và phát triển ứng dụng quản lý câu lạc bộ' }
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: index !== 3 ? '20px' : 0,
                    borderBottom: index !== 3 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                >
                  <div style={{
                    minWidth: '80px',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: 'var(--candy-hotpink)'
                  }}>
                    {item.year}
                  </div>
                  <div style={{ color: 'var(--candy-text)', opacity: 0.8 }}>
                    {item.event}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liên hệ */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(162, 210, 255, 0.2) 0%, rgba(255, 64, 129, 0.1) 100%)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--candy-text)', marginTop: 0 }}>
              Hãy Liên Hệ Với Chúng Tôi
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--candy-text)', opacity: 0.8, marginBottom: '20px' }}>
              Nếu bạn muốn biết thêm thông tin hoặc muốn tham gia, hãy liên hệ với chúng tôi qua các kênh sau:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📧</span>
                <span style={{ color: 'var(--candy-text)' }}>Email: contact@clubuniverse.edu.vn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📱</span>
                <span style={{ color: 'var(--candy-text)' }}>Phone: (024) 1234-5678</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📍</span>
                <span style={{ color: 'var(--candy-text)' }}>Địa chỉ: Phòng 302, Tòa nhà A, Đại học XYZ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
