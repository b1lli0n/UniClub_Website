# Hướng dẫn tích hợp Notification khi Event bị Cancel (theo backend hiện tại)

## Tổng quan

Tài liệu này mô tả đúng hành vi backend hiện tại cho luồng hủy event và notification realtime. Nội dung tập trung vào API contract + socket events, không mặc định rằng FE đã tích hợp đầy đủ.

---

## 1. Hủy event

### Endpoint

`PATCH /api/clubs/:clubId/events/:eventId/cancel`

### Response hiện tại (backend)

Backend hiện trả về:

```json
{
  "event": {
    "_id": "event456",
    "title": "Workshop JavaScript Advanced",
    "club_id": "club123",
    "status": 3
  },
  "message": "Event canceled successfully"
}
```

Lưu ý:
- Hiện không có trường `notificationsSent` trong response.
- Body `reason` có thể gửi lên nhưng backend hiện chưa dùng để lưu/emit notification.

---

## 2. Notification endpoints (backend hiện tại)

- `GET /api/clubs/:clubId/notifications`
- `GET /api/clubs/:clubId/notifications/me`
- `PATCH /api/clubs/:clubId/notifications/:id/read`

### Ví dụ response danh sách

```json
{
  "items": [
    {
      "_id": "userNotif_789",
      "notification": {
        "_id": "notif_400",
        "title": "Sự kiện đã bị hủy",
        "description": "Sự kiện ... đã bị hủy.",
        "type": "event_canceled",
        "sender_id": "user_leader_id",
        "target_id": "user_student_id",
        "created_at": "2026-02-24T10:30:00Z"
      },
      "is_read": false,
      "created_at": "2026-02-24T10:30:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

Lưu ý timestamp:
- Controller hiện dùng `created_at`.
- `createdAt` có thể không ổn định nếu backend chưa normalize toàn bộ.

---

## 3. Socket events

### Join room nhận notification theo user

Client emit:

```javascript
socket.emit('join_user_notifications', userId)
```

### Event nhận notification realtime

Server emit event:

`notification_received`

Payload có phân biệt audience:

```javascript
{
  type: 'event_canceled',
  title: 'Sự kiện đã bị hủy',
  body: '... ',
  description: '... ',
  eventId: 'event456',
  clubId: 'club123',
  audience: 'registered' // hoặc 'unregistered'
}
```

Ngoài ra backend cũng phát `event_cancelled` cho room event tương ứng (nếu client join room event).

---

## 4. Checklist tích hợp FE (tham chiếu)

- [ ] Sau login: connect socket và emit `join_user_notifications` với đúng `userId`.
- [ ] Lắng nghe `notification_received`, xử lý khác nhau cho `audience=registered|unregistered`.
- [ ] Khi hủy event: gọi đúng endpoint cancel, chỉ kỳ vọng `event + message`.
- [ ] Màn Notifications gọi đúng endpoint đang có (`/notifications`, `/notifications/me`, `/:id/read`).
- [ ] UI parse thời gian ưu tiên `created_at`, fallback `createdAt` nếu cần.

---

## 5. Ghi chú xác minh

Hiện tại nội dung “đã tích hợp FE file X/Y/Z” không được khẳng định trong tài liệu này, vì trạng thái workspace bạn kiểm tra là backend. Nếu cần, có thể bổ sung một mục riêng “Frontend verification” sau khi đối chiếu trực tiếp FE repository.
