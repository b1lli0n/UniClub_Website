// [MOCK DATA] Đây là dữ liệu giả để test UI. 
// Sau này sẽ thay bằng API call từ backend.
export const EVENTS = [
  {
    id: "ev-001",
    title: "UniClub Workshop: CV & Interview",
    description: "Chuẩn bị CV, portfolio và mock interview cùng mentor.",
    longDescription:
      "Tham gia workshop để tối ưu CV/Portfolio, luyện trả lời phỏng vấn và nhận feedback trực tiếp. Phù hợp cho sinh viên năm 2+ đang chuẩn bị thực tập hoặc tìm job part-time.",
    category: "Workshop",
    status: "Đang diễn ra",
    dateText: "25/01",
    timeText: "18:30 - 20:30",
    startDate: "25/01/2026",
    endDate: "25/01/2026",
    location: "Hall A - Campus",
    host: "UniClub Career Team",
    capacity: 120,
    participants: 68,
    featured: true,
    tags: ["CV", "Interview", "Mentor"],
  },
  {
    id: "ev-002",
    title: "Giải chạy “Pink Morning Run”",
    description: "Chạy vui 3km/5km, nhận huy hiệu và quà lưu niệm.",
    longDescription:
      "Cùng nhau chạy bộ buổi sáng với 2 cự ly 3km và 5km. Có check-in, nhận huy hiệu và minigame cuối sự kiện.",
    category: "Thể thao",
    status: "Sắp diễn ra",
    dateText: "02/02",
    timeText: "06:00 - 08:00",
    startDate: "02/02/2026",
    endDate: "02/02/2026",
    location: "Sân vận động",
    host: "UniClub Sport",
    capacity: 300,
    participants: 142,
    featured: false,
    tags: ["Running", "Health"],
  },
  {
    id: "ev-003",
    title: "Movie Night: Cozy Cinema",
    description: "Xem phim + popcorn + mini game với câu lạc bộ.",
    longDescription:
      "Một đêm xem phim chill cùng UniClub. Có popcorn, nước và mini game nhận quà. Bạn có thể đề xuất phim ngay khi đăng ký.",
    category: "Giải trí",
    status: "Sắp diễn ra",
    dateText: "08/02",
    timeText: "19:00 - 21:30",
    startDate: "08/02/2026",
    endDate: "08/02/2026",
    location: "Room B201",
    host: "UniClub Media",
    capacity: 80,
    participants: 54,
    featured: false,
    tags: ["Cinema", "Cozy"],
  },
  {
    id: "ev-004",
    title: "Green Day: Clean-up & Planting",
    description: "Hoạt động cộng đồng: dọn rác + trồng cây trong khuôn viên.",
    longDescription:
      "Cùng nhau làm đẹp khuôn viên trường: dọn rác, phân loại, trồng cây và chụp ảnh lưu niệm. UniClub chuẩn bị dụng cụ và nước uống.",
    category: "Cộng đồng",
    status: "Sắp diễn ra",
    dateText: "15/02",
    timeText: "07:30 - 10:30",
    startDate: "15/02/2026",
    endDate: "15/02/2026",
    location: "Cổng chính",
    host: "UniClub Community",
    capacity: 150,
    participants: 33,
    featured: false,
    tags: ["Green", "Volunteer"],
  },
];

export function getEventById(eventId) {
  return EVENTS.find((e) => e.id === eventId);
}

