# Hệ thống Cổng Thông tin Sinh viên Thế hệ mới STU AMIS (Neobrutalism Redesign)

- **Hệ thống:** STU AMIS Next-Gen Student Portal
- **Phiên bản:** 2.0.0
- **Ngày:** 2026-08-24
- **Phong cách Thiết kế:** Neobrutalism (High-Contrast, Hard Drop Shadows, Pop Colors, JetBrains Mono & Plus Jakarta Sans)
- **Kiến trúc Kỹ thuật:** Standalone Single Page Application (Vite + TypeScript + Neobrutalism CSS Engine + Reactive Observable Store)

---

## 1. Bối cảnh & Mục tiêu Hệ thống

### 1.1 Vấn đề của hệ thống cũ (STU AMIS Legacy)
- Giao diện bảng biểu thô kệch, không có phân cấp thị giác.
- Trải nghiệm trên thiết bị di động (Mobile) bị vỡ giao diện và khó tương tác.
- Thiếu các công cụ phân tích học tập thời gian thực (Dự báo GPA, tiến độ tín chỉ).
- Thiếu khả năng tích hợp và đồng bộ (Không xuất được lịch học sang Google Calendar/Apple Calendar, thanh toán học phí không có mã VietQR động).

### 1.2 Mục tiêu của bản Redesign (Phương án B: Standalone Re-architecture)
- Xây dựng một ứng dụng web độc lập hoàn chỉnh với trải nghiệm người dùng cao cấp, phản hồi < 16ms (60-120 FPS).
- Áp dụng triệt để ngôn ngữ thiết kế **Neobrutalism** độc đáo, cá tính và sắc sảo.
- Cung cấp đầy đủ 6 phân hệ cốt lõi: Dashboard, Thời khóa biểu, Bảng điểm & Bộ giả lập GPA, Đăng ký học phần, Học phí & VietQR, Hồ sơ sinh viên.
- Toàn bộ dữ liệu hiển thị, thao tác người dùng được đồng bộ tự động vào `localStorage`.

---

## 2. Ngôn ngữ Thiết kế (Design Tokens)

### 2.1 Tokens & Biến CSS
- **Borders & Shadows:**
  - Viền: `2.5px solid #121212`
  - Bóng đổ cứng (Hard Shadows): `4px 4px 0px #121212`
  - Hover Interaction: `transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #121212;`
  - Active Interaction: `transform: translate(2px, 2px); box-shadow: 0px 0px 0px #121212;`
  - Bo góc (Border Radius): `10px` / `14px`
- **Bảng màu Pop Tương phản cao:**
  - Nền chính (Light Mode): `#FFFDF6` (Kem ấm Retro)
  - Nền chính (Dark Mode): `#121316` (Đen sâu Graphite)
  - Màu chủ đạo (Primary): `#FFE600` (Electric Yellow)
  - Màu phụ trợ (Accents):
    - Cyan: `#00F0FF` (Thông tin, Mã môn học, Tín chỉ)
    - Coral Pink: `#FF495C` (Cảnh báo, Học phí nợ)
    - Lime Green: `#22C55E` (Điểm cao, Đã hoàn thành)
    - Lavender: `#A78BFA` (Thời khóa biểu, Đăng ký môn)
    - Mực viết (Ink Text): `#121212` trên Light Mode, `#F4F4F5` trên Dark Mode
- **Typography:**
  - Headings: `Plus Jakarta Sans` / `Outfit`
  - Data / Grades / Codes: `JetBrains Mono`
  - Body: `Plus Jakarta Sans` / `Inter`
- **Iconography:**
  - 100% SVG Vector thuần khiết, tuyệt đối không dùng Emoji.

---

## 3. Kiến trúc Chi tiết 6 Phân hệ Chức năng

### 3.1 Bảng điều khiển Trung tâm (Dashboard)
- **4 Hero KPI Cards:**
  - GPA Tích lũy (`3.48 / 4.0` - Hạng Giỏi).
  - Tín chỉ Tích lũy (`88 / 140 TC` - 62.8% có Progress bar họa tiết sọc chéo).
  - Lịch học hôm nay (`2 môn` - Live countdown đếm ngược đến tiết học tiếp theo).
  - Tình trạng học phí (`0 VNĐ Nợ`).
- **Widget Lịch học Hôm nay & Ngày mai:** Hiển thị trực quan môn học, phòng học, giảng viên và thời gian.
- **Widget Biểu đồ GPA qua các kỳ:** Biểu đồ cột SVG tương tác có tooltip.
- **Widget Thông báo & Nhiệm vụ cần làm:** To-do checklist với checkbox lưu trạng thái.

### 3.2 Thời khóa biểu Tương tác (Interactive Schedule)
- **3 Chế độ hiển thị:** Lịch tuần (Week Grid 7 cột), Lịch ngày (Day Timeline), Danh sách (List View).
- **Bộ lọc đa chiều:** Lọc theo loại môn (Lý thuyết / Thực hành / Đồ án), lọc theo ngày.
- **Tính năng Xuất lịch (`.ics` Generator):** Tạo file iCalendar chuẩn RFC 5545 cho Google Calendar / Apple Calendar / Outlook.
- **Modal chi tiết môn học:** Xem thông tin phòng học, giảng viên, email, số tiết, tài liệu môn.

### 3.3 Bảng điểm & Bộ Giả lập GPA (Grades & GPA Simulator)
- **Bảng điểm chuẩn tín chỉ:** Hiển thị điểm CC, GK, TH, CK, Tổng kết hệ 10, Điểm chữ và Điểm hệ 4 cho từng kỳ.
- **Bộ giả lập GPA thời gian thực (GPA Simulator):**
  - Kéo thanh trượt hoặc chỉnh điểm số dự kiến các môn đang học kỳ này.
  - Tự động tính toán lại GPA học kỳ và GPA tích lũy toàn khóa ngay lập tức.
  - Đưa ra mục tiêu điểm số cần đạt cho các kỳ tiếp theo để đạt danh hiệu Tốt nghiệp Giỏi/Xuất sắc.

### 3.4 Đăng ký Học phần Thông minh (Course Registration)
- **Danh sách môn mở trong kỳ:** Tìm kiếm nhanh, lọc theo Khoa, số tín chỉ, giảng viên.
- **Thuật toán Phát hiện Trùng lịch (Conflict Detection Engine):** Cảnh báo viền đỏ và thông báo ngay lập tức nếu môn chọn bị xung đột thứ/tiết với môn đã có trong thời khóa biểu.
- **Giỏ đăng ký học phần (Registration Cart):**
  - Tính tổng số tín chỉ đăng ký và ước tính học phí học kỳ ngay lập tức.
  - Đăng ký / Hủy môn tức thì và tự động đồng bộ sang Thời khóa biểu và Bảng kê học phí.

### 3.5 Học phí & Thanh toán VietQR (Finance & Checkout)
- **Bảng kê tài chính chi tiết:** Danh sách các khoản thu từng kỳ (Học phí tín chỉ, Bảo hiểm y tế, Phí dịch vụ đào tạo).
- **Trình tạo mã VietQR chuẩn:**
  - Sinh mã QR thanh toán ngân hàng chính xác với STK Đại học STU, cú pháp chuyển khoản `[MSSV] DH5260789 - HK2 25-26`.
  - Nút "Mô phỏng xác nhận thanh toán" -> Cập nhật trạng thái tức thì sang "Đã thanh toán" và xuất **Biên lai học phí điện tử (E-Receipt)** dạng PDF/Printable.

### 3.6 Hồ sơ Sinh viên (Student Profile)
- Thông tin học vụ chuẩn sinh viên STU: Mã SV `DH5260789`, Lớp `DH22PM01`, Khoa `Công nghệ Thông tin`, Cố vấn học tập.
- Lịch sử rèn luyện & Điểm rèn luyện qua các học kỳ.
- Form cập nhật thông tin liên lạc cá nhân (Email, Số điện thoại) có lưu vào State.

---

## 4. Kiến trúc Dữ liệu & State Management

### 4.1 TypeScript Data Contracts (`src/types/portal.types.ts`)
```typescript
export interface StudentProfile {
  id: string;
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  classCode: string;
  major: string;
  faculty: string;
  academicYear: string;
  advisor: string;
  trainingPoints: number;
  email: string;
  phone: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'Lý thuyết' | 'Thực hành' | 'Đồ án';
  lecturer: string;
  lecturerEmail: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  timeString: string;
  room: string;
  semesterId: string;
  tuitionFee: number;
}

export interface GradeRecord {
  semesterId: string;
  semesterName: string;
  courses: Array<{
    courseCode: string;
    courseName: string;
    credits: number;
    attendance: number;
    midterm: number;
    practical?: number;
    final: number;
    total10: number;
    gradeLetter: string;
    grade4: number;
    isPassed: boolean;
  }>;
  gpaSemester10: number;
  gpaSemester4: number;
  creditsEarned: number;
}

export interface InvoiceItem {
  id: string;
  semesterId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  paidAt?: string;
  transactionRef?: string;
}
```

### 4.2 Reactive State Store (`src/store/stateStore.ts`)
- Quản lý toàn bộ State: Profile, Courses, RegisteredCourseIds, Grades, SimulatedGrades, Invoices, CurrentTab, Theme, Notifications.
- Cung cấp Subscription Listener để các View re-render phản ứng khi có thay đổi.
- Lưu trữ liên tục vào `localStorage` key `stu_amis_portal_state_v1`.
- Cung cấp phương thức `resetToDefault()` để khôi phục dữ liệu ban đầu.

---

## 5. Kế hoạch Kiểm thử & Xác minh (Verification)

1. **Kiểm tra Tương thích Giao diện:** Kiểm tra hiển thị responsive trên Desktop (1440px), Laptop (1024px), Tablet (768px) và Mobile (375px).
2. **Kiểm tra State Reactivity:**
   - Đăng ký 1 môn mới trong "Đăng ký học phần" -> Kiểm tra thời khóa biểu có xuất hiện môn đó không, học phí có tăng không.
   - Thử đăng ký môn trùng lịch -> Kiểm tra cảnh báo xung đột có kích hoạt không.
   - Kéo slider mô phỏng GPA -> Kiểm tra GPA tích lũy có nhảy số chính xác theo công thức không.
   - Xác nhận thanh toán VietQR -> Kiểm tra trạng thái hóa đơn có chuyển sang "PAID" và hiển thị biên lai không.
   - Xuất file `.ics` -> Mở và kiểm tra cấu trúc định dạng chuẩn iCalendar.
