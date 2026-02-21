# UniClub – Format code, cách viết và cách vận hành

Tài liệu này mô tả **format code**, **quy ước đặt tên**, **cách app chạy** và **cách thêm tính năng mới** cho dự án UniClub (React + Vite).

---

## 1. Cấu trúc thư mục

```
src/
├── main.jsx              # Entry: React root + BrowserRouter + AuthProvider
├── App.jsx               # App shell: AppRouter + ToastContainer
├── api/                  # Gọi API (axios)
│   ├── api.js            # Instance chung (token, refresh)
│   ├── authApi.js
│   ├── clubApi.js
│   └── userApi.js
├── context/              # React Context (auth toàn cục)
│   └── AuthContext.jsx
├── router/
│   ├── AppRouter.jsx     # Định nghĩa Routes
│   └── ProtectedRoute.jsx
├── layouts/              # Layout có Header/Footer hoặc Sidebar
│   ├── UserLayout.jsx    # Header + Outlet + Footer
│   ├── MainLayout.jsx
│   └── AdminLayout.jsx
├── pages/                # Trang theo nhóm
│   ├── Auth/             # Login, Register
│   ├── ClubPages/        # ListOfClubs, ClubDetail, ListOfMyClubs
│   ├── EventPages/       # Event, EventDetail, MyEvent, EventPublic
│   ├── admin/            # Trang admin
│   ├── Home.jsx, Profile.jsx, About.jsx, Contacts.jsx, NotFound.jsx
│   └── ...
├── components/           # Component dùng chung
│   ├── Header.jsx, Footer.jsx
│   ├── ClubDetailCard.jsx, ClubCard.jsx, EventCard.jsx
│   └── ...
└── styles/               # CSS theo trang/component
    ├── index.css         # Global + biến :root
    ├── App.css
    ├── Header.css, ClubDetail.css, ListOfClubs.css, ...
```

---

## 2. Format code & quy ước

### 2.1 File và đặt tên

- **Component:** PascalCase, 1 component chính = 1 file, tên file trùng tên component.  
  Ví dụ: `ClubDetail.jsx` export `const ClubDetail = () => { ... };`
- **CSS:** cùng tên với trang/component, trong `src/styles/`.  
  Ví dụ: `ClubDetail.jsx` → `ClubDetail.css`.
- **API:** tên file theo domain: `authApi.js`, `clubApi.js`, `userApi.js`.

### 2.2 Import thứ tự (thường dùng)

1. React (và hooks nếu cần)
2. Thư viện bên ngoài (react-router-dom, react-bootstrap, toast, …)
3. API / context / component / layout (đường dẫn tương đối)
4. CSS (đường dẫn tương đối)

Ví dụ:

```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getClubById, getEventsByClub } from '../../api/clubApi';
import '../../styles/ClubDetail.css';
```

### 2.3 Hằng số và helper ở đầu file

- Biến môi trường / base URL ngay sau import:

```js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');
```

- Helper dùng nhiều trong trang (ví dụ build URL ảnh) cũng đặt đầu file:

```js
const buildImageSrc = (raw) => {
  const cleaned = (raw || '').trim().replace(/"/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('http')) return cleaned;
  return `${ASSET_BASE}${cleaned}`;
};
```

### 2.4 Component function

- Dùng **function component** (không class).
- Tên component = PascalCase.
- Export: `export default TênComponent;` ở cuối file.

```jsx
const ClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  // ...
  return (
    <div className="clubdetail-container">
      {/* ... */}
    </div>
  );
};

export default ClubDetail;
```

### 2.5 JSX

- Dùng **className** (không class).
- Ảnh từ BE: luôn có **onError** đổi sang ảnh mặc định, tránh chớp giật:

```jsx
<img
  src={logoSrc}
  alt={club.name}
  className="clubdetail-logo-img"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/images/clubs/default.png';
  }}
/>
```

- Comment JSX: `{/* Nội dung */}`.

---

## 3. Cách app chạy (luồng từ đầu đến trang)

1. **main.jsx**  
   - Render `<App />` trong `createRoot`.  
   - Bọc bởi: `StrictMode` → `BrowserRouter` → `AuthProvider`.  
   - Import global: `index.css`, `App.css`, Bootstrap, FontAwesome, ReactToastify.

2. **App.jsx**  
   - Chỉ render `<AppRouter />` và `<ToastContainer />`.

3. **AppRouter.jsx**  
   - Định nghĩa toàn bộ **Routes**:
     - Auth: `/login`, `/register` (không layout).
     - User: bọc bởi `<UserLayout />` (Header + Outlet + Footer): `/`, `/clubs`, `/clubs/:id`, `/events`, `/profile`, …
     - Dashboard: bọc bởi `<MainLayout />`: `/clubs/:id/dashboard`, `/events`, …
     - Admin: bọc bởi `<ProtectedRoute requiredRole="admin">` + `<AdminLayout />`: `/admin`, `/admin/list-clubs`, …
   - Trang không khớp route → `<NotFound />`.

4. **Layout (ví dụ UserLayout)**  
   - Render: `<Header />` → `<main><Outlet /></main>` → `<Footer />`.  
   - `Outlet` = nội dung của route con (ví dụ `ClubDetail`, `ListOfClubs`).

5. **Trang (ví dụ ClubDetail)**  
   - Dùng `useParams()` lấy `id`, `useState` cho data, `useEffect` gọi API khi mount/cập nhật `id`.  
   - Gọi hàm từ `api/clubApi.js` (ví dụ `getClubById(id)`), xử lý `response.data`/`response.success`.  
   - Báo lỗi bằng `toast.error(...)`.  
   - Thêm body class cho trang (ví dụ `clubdetail-body`) trong `useEffect` để CSS trang áp dụng đúng.

6. **Auth**  
   - `AuthContext`: lưu `user`, `loading`, `isLoggedIn`, `login`, `logout`, `updateUser`.  
   - Khi load app: đọc `localStorage` (accessToken, user), set `user` nếu có.  
   - Trang bảo vệ: `<ProtectedRoute>` kiểm tra `user` và `requiredRole`, không đủ thì redirect `/login` hoặc `/`.

---

## 4. API layer – format và cách thêm mới

### 4.1 Hai kiểu dùng trong dự án

- **Instance chung** (`api.js`): baseURL = `VITE_API_URL`, có interceptors gắn Bearer token và refresh token. Dùng cho auth, user (và có thể dùng cho club nếu đổi lại).
- **Instance riêng** (ví dụ `clubApi.js`): `axios.create({ baseURL: '.../api/clubs', headers: { 'Content-Type': 'application/json' } })`, có thể gắn token trong request interceptor.

### 4.2 Format hàm API (chuẩn dự án)

- **Tên:** camelCase, động từ + danh từ (getClubById, createClub, getEventsByClub).
- **Trả về:** `return response.data` trong try.
- **Lỗi:** `throw error.response?.data || { message: error.message || 'Thông báo tiếng Việt' };`, kèm `console.error` tùy chọn.

Ví dụ:

```js
export const getClubById = async (id) => {
  try {
    const response = await clubAPI.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get club by id error:', error);
    throw error.response?.data || { message: error.message || 'Không thể lấy thông tin câu lạc bộ' };
  }
};
```

### 4.3 Thêm API mới (làm tương tự)

1. Mở file đúng domain (ví dụ `src/api/clubApi.js`).
2. Thêm hàm async, dùng `clubAPI.get/post/put/delete` với URL và body/params đúng.
3. Return `response.data`, catch throw như trên.
4. Ở trang/component: `import { getXxx } from '../../api/clubApi';` rồi gọi trong `useEffect` hoặc handler, xử lý `res.success` và `res.data` theo đúng format BE.

---

## 5. Styling (CSS)

- **Global:** `index.css` – `:root` (màu, font), reset cơ bản.
- **Từng trang/component:** file riêng trong `src/styles/`, import trong file JSX tương ứng.
- **Biến theo trang:** trong file CSS của trang, ví dụ `ClubDetail.css`:

  ```css
  :root {
    --clubdetail-hot-pink: #ffafcc;
    --clubdetail-ink: #1f2a44;
  }
  ```

- **Body class:** trang thêm/xóa class cho `document.body` (ví dụ `clubdetail-body`) trong `useEffect` để nền/ layout trang không ảnh hưởng trang khác.
- **Glassmorphism:** dùng chung class ví dụ `.glass-panel`: `background: rgba(255,255,255,0.28)`, `backdrop-filter: blur(18px)`, `border-radius: 22px`.

---

## 6. Làm tính năng mới “tương tự”

Áp dụng đúng format và luồng trên:

1. **Route:** Trong `AppRouter.jsx`, thêm `<Route path="/path-moi" element={<TrangMoi />} />` (bên trong layout phù hợp, ví dụ `UserLayout`).
2. **Trang:** Tạo `src/pages/TenTrang.jsx` (hoặc trong thư mục con như `ClubPages/`).  
   - Import hooks (useState, useEffect, useParams nếu cần), router, API, toast, layout/components.  
   - Thêm body class trong useEffect nếu cần.  
   - Gọi API trong useEffect (hoặc khi submit), set state, render theo `loading` / `data` / `error`.  
   - Dùng `toast.error` khi lỗi.
3. **CSS:** Tạo `src/styles/TenTrang.css`, import trong `TenTrang.jsx`, dùng class có tiền tố (ví dụ `tentrang-container`) và biến trong `:root` nếu cần.
4. **API:** Nếu endpoint mới thuộc domain có sẵn thì thêm hàm vào `authApi.js` / `clubApi.js` / `userApi.js` theo đúng format trên; nếu domain mới thì tạo file `xxxApi.js` và instance axios (hoặc dùng chung `api` từ `api.js`).
5. **Bảo vệ route:** Nếu chỉ user đăng nhập (hoặc role) mới vào được, bọc route bằng `<ProtectedRoute requiredRole="...">` hoặc logic tương tự.

Làm đúng các bước này thì code mới sẽ đồng bộ với format và cách vận hành hiện tại của dự án.
