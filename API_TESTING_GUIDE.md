# API Testing Guide

## Event Management Endpoints

### 1. Create Event
**Route:** `POST /api/clubs/:clubId/events`
**Form:** CreateEvent.jsx

**Payload Structure:**
```json
{
  "title": "Hội xuân",
  "description": "Ngày hội mua sắm",
  "content": "Sự kiện mừng năm mới",
  "location": "Hall A, Building 5",
  "start_time": "2026-02-06T07:25:00Z",
  "end_time": "2026-02-06T19:25:00Z",
  "capacity": 30,
  "is_public": true,
  "progress_status": 0,
  "media_urls": []
}
```

**Response on Success:**
- Status: 200/201
- Message: "✅ Tạo sự kiện thành công! Đang chuyển hướng..."
- Auto redirect to `/events` after 2 seconds

**FE Mapping:**
- formData.startAt → payload.start_time (ISO string)
- formData.endAt → payload.end_time (ISO string)
- formData.public → payload.is_public
- formData.progressStatus → payload.progress_status

---

### 2. Update Event
**Route:** `PUT /api/clubs/:clubId/events/:eventId`
**Form:** UpdateEvent.jsx

**Payload Structure:** Same as Create Event
```json
{
  "title": "...",
  "description": "...",
  "content": "...",
  "location": "...",
  "start_time": "...",
  "end_time": "...",
  "capacity": 30,
  "is_public": true,
  "progress_status": 0,
  "media_urls": []
}
```

**Requirements:**
- Leader can only update event if NOT `closed` or `canceled`
- Field mapping same as Create

**Response on Success:**
- Status: 200
- Message: "Cập nhật thành công!"
- Auto redirect to `/events/:eventId` after 1.2 seconds

---

### 3. Cancel Event
**Route:** `PATCH /api/clubs/:clubId/events/:eventId/cancel`
**Trigger:** DangerZoneCard → CancelDialog

**Payload:**
```json
{
  "reason": "Nguyên nhân hủy sự kiện (tùy chọn)"
}
```

**Requirements:**
- Save notification to DB with cancellation reason
- Emit SocketIO to rooms: `event-{eventId}`, `club-{clubId}`
- Send notification to all registered members
- Only leader/admin can cancel

**Response on Success:**
- Status: 200
- Message: "Đã hủy sự kiện. Thông báo đã gửi: {notificationsSent}"
- Auto redirect to `/events` after 1.5 seconds

**SocketIO Emission:**
```javascript
io.to(`event-${eventId}`).emit('event:canceled', {
  eventId,
  clubId,
  title,
  canceledAt: new Date(),
  cancelReason
})

io.to(`club-${clubId}`).emit('event:updated', {
  eventId,
  status: 3, // canceled
  ...
})
```

---

## FE Data Mapping

### Event Model Fields
```javascript
// BE Returns (schema fields):
{
  event_id: ObjectId,
  club_id: ObjectId,
  created_by: ObjectId,
  title: String,
  description: String,
  content: String,
  start_time: Date,
  end_time: Date,
  location: String,
  is_public: Boolean,
  capacity: Number,
  status: Number (0,1,2,3),
  progress_status: Number (0,1),
  check_in_status: Number (0,1),
  media_urls: [String],
  feedback_summary: [String],
  created_at: Date,
  updated_at: Date,
  canceled_at: Date,
  cancel_reason: String
}

// FE Uses (camelCase):
{
  eventId: String,
  clubId: String,
  createdBy: Object,
  title: String,
  description: String,
  content: String,
  startAt: Date string,
  endAt: Date string,
  location: String,
  public: Boolean,
  capacity: Number,
  progressStatus: Number,
  progressStatusCode: Number,
  mediaUrls: [String],
  feedbackSummary: [String],
  createdAt: Date string,
  updatedAt: Date string,
  canceledAt: Date string,
  cancelReason: String
}
```

---

## Testing Checklist

### ✅ Create Event Flow
- [ ] Fill all required fields (title, description, content, location, start_time, end_time)
- [ ] Submit form
- [ ] Check console for payload structure
- [ ] Verify success message appears
- [ ] Confirm auto-redirect to `/events` after 2 seconds
- [ ] Check new event appears in event list

### ✅ Update Event Flow
- [ ] Navigate to event detail page
- [ ] Click edit button
- [ ] Change some fields (e.g., title, capacity)
- [ ] Submit form
- [ ] Verify success message
- [ ] Check redirect to event detail with updated info
- [ ] Try updating closed/canceled event (should show error)

### ✅ Cancel Event Flow
- [ ] Open event that's not yet canceled
- [ ] Click "Cancel Event" button
- [ ] Enter cancel reason (optional)
- [ ] Confirm cancellation
- [ ] Verify notification message with count
- [ ] Check event status changed to "Cancelled"
- [ ] Verify SocketIO notifications emitted to club members

---

## Common Issues & Fixes

### Issue: 404 Not Found
- **Cause:** Wrong endpoint path or clubId not set
- **Fix:** Check `localStorage.getItem('clubId')` and console logs

### Issue: Validation Error
- **Cause:** Missing required fields
- **Fix:** Ensure all fields with `*` are filled

### Issue: Date Format Error
- **Cause:** Invalid date format sent to BE
- **Fix:** Ensure startAt/endAt use ISO string format via `toISOString()`

### Issue: Redirect Not Working
- **Cause:** Navigation blocked or error state
- **Fix:** Check error message and validate response status

---

## Notes
- Remember to use HTTPS/Bearer token in headers
- All timestamps should be ISO 8601 format
- No `category` field in this schema (removed)
- `status` field is auto-set by BE (mutable only by admin routes)
- `check_in_status` field defaults to 0, not needed in FE form
