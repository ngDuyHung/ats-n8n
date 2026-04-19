# ATS Platform — Kế hoạch nâng cấp (v2)

> Dựa trên codebase hiện tại: Next.js 16, React 19, MongoDB/Mongoose, n8n webhook tự động chấm CV + gửi email qua Gemini & SMTP.

---

## 0. Ghi chú: Email notification đã có sẵn trong n8n ✅

Kiểm tra `ats_auton8n.json` xác nhận n8n đã xử lý **đầy đủ 3 loại email**:
- **Phase 1** — "Send an Email": Xác nhận ứng tuyển thành công (gửi ngay sau khi nộp CV)
- **Phase 2** — "Send an Email - Đậu": Chúc mừng PASSED + thông báo HR sẽ liên hệ phỏng vấn
- **Phase 2** — "Send an Email - Từ chối": Cảm ơn và từ chối lịch sự cho FAILED

→ **Không cần làm thêm gì** về email phía Next.js.

---

## 1. Tổng quan hệ thống mới — 3 Role

```
Người dùng
├── admin   → Quản trị hệ thống: duyệt HR request, quản lý user, xem tổng quan toàn bộ
├── hr      → Nhà tuyển dụng: đăng tin, xem ứng viên theo job của mình, chốt sổ
└── client  → Ứng viên: xem tin, nộp CV, theo dõi kết quả + có thể xin nâng lên HR
```

### Luồng nâng role Client → HR
```
Client đăng ký tài khoản (role=client)
  └─► Vào trang "Trở thành Nhà Tuyển Dụng" → điền thông tin công ty
        └─► Admin nhận yêu cầu tại /admin/hr-requests
              ├─► Duyệt → role tự động đổi thành 'hr'
              └─► Từ chối → giữ nguyên 'client'
```

---

## 2. Tech Stack bổ sung

| Thứ gì | Package |
|--------|---------|
| Authentication | `next-auth@5` (Auth.js v5 — tương thích Next.js 16 App Router) |
| Hash mật khẩu | `bcryptjs` + `@types/bcryptjs` |
| Form validation | `zod` |
| UI toast/notify | `sonner` |
| Upload file (CV) | Giữ multipart gửi thẳng sang n8n như hiện tại |

---

## 3. Data Models mới / thay đổi

### 3.1 Model `User` (mới)
```ts
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'hr' | 'client',
  company?: String,             // Dành cho HR
  avatar?: String,
  created_at: Date
}
```

### 3.2 Model `HrRequest` (mới) — Yêu cầu trở thành HR
```ts
{
  user_id: ObjectId → User,
  company_name: String,
  company_website?: String,
  reason: String,               // Lý do muốn trở thành HR
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  reviewed_by?: ObjectId → User (admin),
  created_at: Date
}
```

### 3.3 Model `Job` (mới)
```ts
{
  title: String,
  description: String,          // Nội dung JD đầy đủ
  department: String,
  location: String,
  salary_range?: String,
  deadline: Date,
  status: 'OPEN' | 'CLOSED',
  quota: Number,                // Số lượng cần tuyển
  created_by: ObjectId → User,  // HR tạo job
  created_at: Date
}
```

### 3.4 Model `Application` (cập nhật — thêm vào schema hiện tại)
```ts
  job_ref: ObjectId → Job,      // Thay thế string job_id
  candidate_name: String,
  candidate_id?: ObjectId → User,
  cv_filename: String,
```

---

## 4. Cấu trúc file / route mới

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx           # Mặc định role=client
│   ├── (client)/
│   │   ├── jobs/
│   │   │   ├── page.tsx                # Danh sách tin tuyển dụng (public)
│   │   │   └── [jobId]/
│   │   │       ├── page.tsx            # Chi tiết JD
│   │   │       └── apply/page.tsx      # Form nộp CV (JD tự động điền)
│   │   ├── my-applications/page.tsx    # Lịch sử ứng tuyển
│   │   └── become-hr/page.tsx          # Form đăng ký trở thành HR
│   ├── hr/                             # Khu vực dành riêng cho HR
│   │   ├── page.tsx                    # HR Dashboard
│   │   ├── jobs/
│   │   │   ├── page.tsx                # Danh sách job của HR này
│   │   │   ├── new/page.tsx            # Đăng tin mới
│   │   │   └── [jobId]/
│   │   │       ├── page.tsx            # Chi tiết job + bảng ứng viên
│   │   │       └── edit/page.tsx       # Chỉnh sửa tin
│   │   └── applications/page.tsx       # Tất cả ứng viên của HR này
│   ├── admin/                          # Khu vực dành riêng cho Admin
│   │   ├── page.tsx                    # Admin Dashboard (tổng quan toàn hệ thống)
│   │   ├── users/page.tsx              # Quản lý tất cả users
│   │   ├── hr-requests/page.tsx        # Duyệt yêu cầu trở thành HR
│   │   ├── jobs/page.tsx               # Xem tất cả jobs (read-only)
│   │   └── applications/page.tsx       # Xem tất cả ứng viên
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── actions/
│   ├── ats-actions.ts                  # Cập nhật: bỏ NEXT_PUBLIC_, thêm job_ref
│   ├── auth-actions.ts                 # register, login
│   ├── job-actions.ts                  # CRUD jobs (HR)
│   └── hr-request-actions.ts           # Tạo / duyệt / từ chối HR request
├── components/
│   ├── admin/
│   │   ├── HrRequestTable.tsx          # Bảng duyệt HR request
│   │   ├── UserTable.tsx               # Bảng quản lý users
│   │   └── StatsCard.tsx
│   ├── hr/
│   │   ├── FinalizeButton.tsx          # Nâng cấp từ FinalizeButton cũ
│   │   ├── JobForm.tsx
│   │   └── ApplicationTable.tsx
│   ├── shared/
│   │   ├── Navbar.tsx                  # Role-aware: client / hr / admin menu
│   │   └── JobCard.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── lib/
│   ├── db.ts
│   └── auth.ts                         # NextAuth config (3 roles)
├── models/
│   ├── Application.ts                  # Cập nhật
│   ├── Job.ts
│   ├── User.ts
│   └── HrRequest.ts
└── middleware.ts                       # Bảo vệ /hr/* và /admin/*
```

---

## 5. Luồng chức năng chi tiết

### 5.1 Auth — Đăng ký / Đăng nhập
- `/register`: Name, Email, Password → role mặc định `client`
- `/login`: email + password → NextAuth session cookie
- Seed script tạo sẵn 1 tài khoản `admin` khi deploy lần đầu

### 5.2 Client — Xin trở thành HR (`/become-hr`)
1. Điền form: Tên công ty, Website, Lý do
2. Tạo `HrRequest` với `status: PENDING`
3. Không thể nộp thêm nếu đã có request đang chờ

### 5.3 Admin — Duyệt HR Request (`/admin/hr-requests`)
- Bảng: Tên user | Email | Công ty | Lý do | Ngày gửi | Hành động
- Nút **"Duyệt"** → `user.role = 'hr'`, `request.status = 'APPROVED'`
- Nút **"Từ chối"** → `request.status = 'REJECTED'`

### 5.4 Admin — Quản lý Users (`/admin/users`)
- Danh sách tất cả users: Tên | Email | Role | Ngày tạo
- Có thể **đổi role** trực tiếp (nâng/hạ)
- Có thể **xoá user** (soft delete hoặc hard)

### 5.5 Admin — Dashboard tổng quan (`/admin`)
- **Stat cards**: Tổng users | Tổng HR | Tổng jobs đang mở | Tổng ứng viên
- **Bảng nhanh**: HR requests đang chờ duyệt

### 5.6 HR — Dashboard (`/hr`)
- **Stat cards**: Jobs đang mở | Tổng ứng viên | Đã chốt | Tỷ lệ pass
- **Bảng nhanh**: 5 ứng viên mới nhất trong các job của HR này

### 5.7 HR — Quản lý job (`/hr/jobs`)
- Tạo job mới: tiêu đề, JD, địa điểm, mức lương, deadline, quota
- Danh sách: Tên job | Trạng thái | Số ứng viên | Deadline | Sửa / Đóng
- Đóng job → `status: CLOSED` (ứng viên không nộp được nữa)

### 5.8 HR — Chi tiết job + Chốt sổ (`/hr/jobs/[jobId]`)
- Thông tin JD + bảng ứng viên đã nộp
- Điểm AI, feedback Gemini, PASSED / FAILED / CHỜ DUYỆT
- Nút **"Chốt sổ"** → tự điền `job_id` và `quota` từ DB → gọi n8n → n8n tự gửi email

### 5.9 Client — Xem & nộp CV
1. `/jobs`: duyệt tin OPEN, filter theo địa điểm / từ khoá
2. `/jobs/[jobId]`: xem JD → nút "Ứng tuyển ngay"
3. `/jobs/[jobId]/apply`: upload CV — JD tự điền, ứng viên chỉ cần nhập tên + email (nếu chưa đăng nhập)
4. n8n nhận CV → chấm điểm → gửi email xác nhận → lưu MongoDB

### 5.10 Client — Theo dõi kết quả (`/my-applications`)
- Bảng: Tên job | Ngày nộp | Điểm AI | Kết quả
- PASSED: badge xanh — "Chúc mừng! HR sẽ liên hệ phỏng vấn"
- FAILED: badge đỏ — "Cảm ơn bạn đã ứng tuyển"
- CHỜ DUYỆT: badge xám

---

## 6. Bảo vệ route (Middleware)

```
/admin/*        → role === 'admin'
/hr/*           → role === 'hr' hoặc role === 'admin'
/my-applications → đã đăng nhập (bất kỳ role)
/become-hr      → đã đăng nhập + role === 'client'
/jobs/*         → public
```

---

## 7. Flow n8n — Trạng thái hiện tại ✅ Đầy đủ

| Phase | Node | Mô tả | Trạng thái |
|-------|------|-------|------------|
| 1 | Webhook `analyze-cv` | Nhận CV + JD | ✅ Có |
| 1 | Extract from File | Đọc nội dung PDF | ✅ Có |
| 1 | Gemini `models/gemini-2.5-flash` | Chấm điểm, trả JSON `{score, feedback}` | ✅ Có |
| 1 | Insert documents | Lưu vào MongoDB `applications` | ✅ Có |
| 1 | Send an Email | Xác nhận ứng tuyển → ứng viên | ✅ Có |
| 2 | Webhook `chot-so-cv` | Nhận `job_id` + `so_luong_tuyen` | ✅ Có |
| 2 | Code JS | Sort theo score, gán PASSED/FAILED | ✅ Có |
| 2 | Update documents | Ghi `ket_qua_cuoi` + `status=PROCESSED` | ✅ Có |
| 2 | Send an Email - Đậu | Email chúc mừng PASSED | ✅ Có |
| 2 | Send an Email - Từ chối | Email từ chối FAILED | ✅ Có |

→ **Không cần sửa n8n.** Chỉ cần đảm bảo Next.js gửi đúng field `job_id` và `so_luong_tuyen`.

---

## 8. Thứ tự thực hiện (Sprint)

### Sprint 1 — Auth & 3-Role System
- [ ] Cài `next-auth@5`, `bcryptjs`, `zod`, `sonner`
- [ ] Model `User` (3 roles)
- [ ] Trang `/login`, `/register`
- [ ] `lib/auth.ts` — NextAuth config với credentials provider
- [ ] `middleware.ts` — bảo vệ `/admin/*` và `/hr/*`
- [ ] `Navbar` role-aware (client / hr / admin)
- [ ] Seed script tạo tài khoản admin mặc định

### Sprint 2 — HR Request Flow
- [ ] Model `HrRequest`
- [ ] `hr-request-actions.ts`
- [ ] `/become-hr` — form đăng ký
- [ ] `/admin/hr-requests` — bảng duyệt request
- [ ] `/admin/users` — quản lý user, đổi role

### Sprint 3 — Job Management (HR)
- [ ] Model `Job`
- [ ] `job-actions.ts` (create, list, update, close)
- [ ] `/hr/jobs` — danh sách job của HR
- [ ] `/hr/jobs/new` — form tạo job
- [ ] `/hr/jobs/[jobId]` — chi tiết + bảng ứng viên + Chốt sổ
- [ ] `/hr/jobs/[jobId]/edit` — chỉnh sửa job
- [ ] `FinalizeButton` nâng cấp (auto `job_id` + `quota`)

### Sprint 4 — Client Flow
- [ ] `/jobs` — danh sách tin OPEN (filter địa điểm / từ khoá)
- [ ] `/jobs/[jobId]` — chi tiết JD
- [ ] `/jobs/[jobId]/apply` — form nộp CV, JD auto-fill
- [ ] Cập nhật `submitCV` action (bỏ `NEXT_PUBLIC_`, thêm `job_ref`)
- [ ] `/my-applications` — lịch sử ứng tuyển
- [ ] Cập nhật `Application` model (thêm `job_ref`, `candidate_id`)

### Sprint 5 — Dashboard & Polish
- [ ] `/admin` dashboard — stat cards toàn hệ thống
- [ ] `/hr` dashboard — stat cards theo HR
- [ ] Phân trang (pagination) bảng ứng viên
- [ ] Tìm kiếm / lọc ứng viên theo điểm, trạng thái, job
- [ ] Filter job theo địa điểm / từ khoá ở trang `/jobs`
- [ ] `ApplicationTable` tách thành component riêng (dùng chung hr + admin)

---

## 9. Biến môi trường (`.env.local`)

```env
# Hiện có — đổi sang server-only (bỏ NEXT_PUBLIC_)
MONGODB_URI=...
N8N_ANALYZE_WEBHOOK=...        # Đổi từ NEXT_PUBLIC_N8N_ANALYZE_WEBHOOK
N8N_CHOT_SO_WEBHOOK=...        # Đổi từ NEXT_PUBLIC_N8N_CHOT_SO_WEBHOOK

# Thêm mới
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000

# Tài khoản admin seed mặc định
ADMIN_SEED_EMAIL=admin@ats.local
ADMIN_SEED_PASSWORD=<strong-password>
```

---

> **Lưu ý bảo mật:** Bỏ prefix `NEXT_PUBLIC_` khỏi các biến N8N webhook — URL này chỉ được gọi từ Server Actions, không cần expose ra browser.
