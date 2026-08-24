# Kế hoạch Triển khai Hệ thống Cổng Thông tin Sinh viên STU AMIS Neobrutalism

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng Cổng thông tin Sinh viên STU AMIS thế hệ mới theo phong cách Neobrutalism độc lập, tốc độ cao, có 6 phân hệ tương tác hoàn chỉnh (Dashboard, Lịch học, Bảng điểm & Giả lập GPA, Đăng ký học phần, Học phí VietQR, Hồ sơ cá nhân) với LocalStorage state sync.

**Architecture:** Standalone Single-Page Application sử dụng Vite và TypeScript thuần khiết, kiến trúc Reactive Observable Store (thin store + domain actions) đồng bộ LocalStorage, hash-based Router độc lập, và hệ thống Neobrutalism CSS Engine tùy biến hoàn toàn (zero CSS framework bloat).

**Tech Stack:** TypeScript, Vite, Vanilla CSS (Neobrutalism Tokens, Flex/Grid), HTML5 Semantic, SVG Icons, LocalStorage API.

## Global Constraints
- 100% Tiếng Việt trên toàn bộ giao diện và dữ liệu.
- Hoàn toàn KHÔNG DÙNG EMOJI. Tất cả biểu tượng phải dùng SVG vector chuẩn.
- Tuân thủ nghiêm ngặt bảng màu và phong cách Neobrutalism: Viền đen `2.5px solid #121212`, bóng đổ cứng `4px 4px 0px #121212`, màu pop tươi sáng (`#FFE600`, `#00F0FF`, `#22C55E`, `#FF495C`, `#A78BFA`), font `JetBrains Mono` và `Plus Jakarta Sans`.
- Responsive hoàn hảo trên Desktop (1440px), Laptop (1024px), Tablet (768px) và Mobile (375px).
- Mọi hàm < 20 dòng. Mọi file < 200 dòng. Không dùng `any`. Không dùng magic string/number - dùng enum và const.
- Không viết comment trong code. Code phải tự giải thích qua naming.

## Kiến trúc Thư mục

```
src/
├── main.ts
├── app/
│   ├── Router.ts
│   └── ViewLifecycle.ts
├── types/
│   └── portal.types.ts
├── data/
│   └── stuMockData.ts
├── store/
│   └── stateStore.ts
├── actions/
│   ├── courseActions.ts
│   ├── gradeActions.ts
│   ├── financeActions.ts
│   └── profileActions.ts
├── utils/
│   ├── svgIcons.ts
│   ├── formatters.ts
│   ├── icsExporter.ts
│   ├── gpaCalculator.ts
│   └── vietQr.ts
├── components/
│   ├── Toast.ts
│   ├── Modal.ts
│   ├── Header.ts
│   ├── Sidebar.ts
│   └── SvgChart.ts
├── views/
│   ├── DashboardView.ts
│   ├── ScheduleView.ts
│   ├── GradesView.ts
│   ├── RegistrationView.ts
│   ├── FinanceView.ts
│   └── ProfileView.ts
├── styles/
│   ├── tokens.css
│   ├── neobrutalism.css
│   └── app.css
```

---

### Task 1: Thiết lập Cấu hình Dự án & Build Pipeline (Scaffolding)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

**Interfaces:**
- Produces: Môi trường build Vite + TypeScript sẵn sàng chạy `npm run dev` và `npm run build`.

- [ ] **Step 1: Cấu hình `package.json` với script Vite và TypeScript**
  - `name`: `stu-amis-portal`
  - Scripts: `dev`, `build`, `preview`
  - Dependencies: `typescript`, `vite` (devDependencies only)
- [ ] **Step 2: Cấu hình `tsconfig.json` với strict mode và ESNext target**
  - `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
  - `target: ESNext`, `module: ESNext`, `moduleResolution: bundler`
- [ ] **Step 3: Cấu hình `vite.config.ts` cho local dev server**
  - Port `3000`, open browser tự động
- [ ] **Step 4: Tạo file `index.html`**
  - Thẻ meta SEO: title, description, viewport, charset
  - Liên kết Google Fonts: `Plus Jakarta Sans`, `Outfit`, `JetBrains Mono`
  - `<div id="app"></div>` và `<script type="module" src="/src/main.ts"></script>`
- [ ] **Step 5: Cài đặt dependencies và kiểm tra build pipeline**

**Verification:** Chạy `npm run dev` thành công, trình duyệt mở trang trắng không lỗi console.

---

### Task 2: Xây dựng Hệ thống Design Tokens & Neobrutalism CSS Engine

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/neobrutalism.css`
- Create: `src/styles/app.css`

**Interfaces:**
- Produces: Toàn bộ CSS custom properties và component classes: `.neo-card`, `.neo-btn`, `.neo-btn--primary`, `.neo-btn--danger`, `.neo-badge`, `.neo-input`, `.neo-table`, `.neo-tag`, `.neo-progress`, `.neo-slider`, Grid layout, Sidebar, Header, Responsive breakpoints, Dark/Light mode toggle.

- [ ] **Step 1: Định nghĩa CSS custom properties trong `tokens.css`**
  - Bảng màu Light/Dark mode dùng `[data-theme="light"]` và `[data-theme="dark"]` trên `:root`
  - `--neo-border`: `2.5px solid #121212`
  - `--neo-shadow`: `4px 4px 0px #121212`
  - `--neo-shadow-hover`: `6px 6px 0px #121212`
  - `--neo-radius`: `10px` / `14px`
  - `--neo-primary`: `#FFE600`, `--neo-cyan`: `#00F0FF`, `--neo-coral`: `#FF495C`, `--neo-lime`: `#22C55E`, `--neo-lavender`: `#A78BFA`
  - `--neo-bg-light`: `#FFFDF6`, `--neo-bg-dark`: `#121316`
  - Font stacks: `--font-heading`, `--font-mono`, `--font-body`
  - Spacing scale: `--space-xs` đến `--space-3xl`
- [ ] **Step 2: Tạo `neobrutalism.css` chứa các component classes**
  - `.neo-card` với border, shadow, hover transform `translate(-2px, -2px)`, active transform `translate(2px, 2px)` và `box-shadow: 0`
  - `.neo-btn` có 4 variants: `--primary` (vàng), `--danger` (đỏ coral), `--success` (xanh lime), `--ghost` (trong suốt)
  - `.neo-badge`, `.neo-tag` với background màu pop
  - `.neo-input`, `.neo-select` với focus ring vàng
  - `.neo-table` với hàng xen kẽ sáng/tối, header đậm
  - `.neo-progress` thanh tiến trình có họa tiết sọc chéo (CSS `repeating-linear-gradient`)
  - `.neo-slider` thanh trượt custom
  - `.neo-checkbox` custom checkbox neobrutalism
  - Transition cho tất cả interactive: `transition: transform 0.15s ease, box-shadow 0.15s ease`
- [ ] **Step 3: Tạo `app.css` xử lý layout tổng thể**
  - Layout 2 cột: Sidebar cố định 260px bên trái + Main content scrollable bên phải
  - Header cố định 64px trên cùng
  - Dark mode: `[data-theme="dark"]` override toàn bộ biến màu
  - Responsive breakpoints:
    - `@media (max-width: 1024px)`: Sidebar thu gọn 72px (chỉ icon)
    - `@media (max-width: 768px)`: Sidebar ẩn hoàn toàn, hiện hamburger menu, overlay drawer
    - `@media (max-width: 375px)`: Single column, padding giảm
  - Animation keyframes: `fadeIn`, `slideUp`, `slideInLeft` cho view transitions
- [ ] **Step 4: Kiểm tra trực quan CSS bằng HTML test tạm**

**Verification:** Tạo 1 trang HTML test chứa mỗi component class, xác nhận hover/active effects hoạt động, dark mode toggle chuyển màu đúng.

---

### Task 3: Định nghĩa TypeScript Contracts, Dữ liệu Mock STU & Reactive State Store

**Files:**
- Create: `src/types/portal.types.ts`
- Create: `src/data/stuMockData.ts`
- Create: `src/store/stateStore.ts`

**Interfaces:**
- Produces:
  - `portal.types.ts`: `StudentProfile`, `Course`, `GradeRecord`, `GradeCourseEntry`, `InvoiceItem`, `Notification`, `TodoItem`, `ScheduleViewMode` (enum), `TabId` (enum), `ThemeMode` (enum), `InvoiceStatus` (enum), `CourseType` (enum), `AppState`.
  - `stuMockData.ts`: Dữ liệu sinh viên STU (`DH5260789`, Lớp `DH22PM01`, Khoa CNTT), 12+ môn học phân bổ 7 ngày/tuần, điểm số 4 học kỳ đầy đủ (CC/GK/TH/CK), 4+ hóa đơn học phí, 5+ thông báo, 3+ việc cần làm.
  - `stateStore.ts`: Thin reactive store chỉ chứa:
    - `getState(): AppState`
    - `setState(partial: Partial<AppState>): void`
    - `subscribe(listener: (state: AppState) => void): () => void` (trả về unsubscribe function)
    - `loadFromStorage(): void`
    - `saveToStorage(): void`
    - `resetToDefault(): void`
    - LocalStorage key: `stu_amis_portal_state_v2`
    - Auto-save sau mỗi `setState` call

**Lưu ý thiết kế Store:**
- Store KHÔNG chứa business logic. Chỉ là container reactive cho state + localStorage sync.
- Mọi business logic (đăng ký môn, tính GPA, thanh toán) nằm trong `src/actions/`.
- `subscribe` trả về hàm `unsubscribe` để view cleanup khi unmount.
- `setState` thực hiện shallow merge và notify tất cả subscribers.
- Khi load từ localStorage, validate schema version. Nếu schema không khớp hoặc JSON corrupt -> fallback về default data, log warning ra console.

- [ ] **Step 1: Viết toàn bộ TypeScript types và enums trong `src/types/portal.types.ts`**
  - Dùng enum cho: `TabId`, `ThemeMode`, `ScheduleViewMode`, `InvoiceStatus`, `CourseType`
  - Dùng branded type cho `StudentId` (string) và `CourseId` (string) nếu cần
  - Interface `AppState` tổng hợp toàn bộ state shape
- [ ] **Step 2: Tạo bộ dữ liệu Mock thực tế chuẩn Đại học STU trong `src/data/stuMockData.ts`**
  - Profile: Nguyễn Văn Phát, DH5260789, DH22PM01, Khoa CNTT, GVCN Nguyễn Thị Minh Tâm
  - Courses: 12+ môn trải đều Thứ 2-7, tiết 1-12, đa dạng phòng học (A301, B205, LAB-C102...)
  - Grades: 4 học kỳ (HK1 22-23 đến HK2 23-24), mỗi kỳ 5-6 môn với điểm đa dạng
  - Invoices: Học phí tín chỉ, BHYT, Phí dịch vụ - mix PAID/UNPAID/OVERDUE
  - Available courses cho đăng ký: 15+ môn chưa đăng ký (có vài môn cố tình trùng lịch để test conflict detection)
- [ ] **Step 3: Viết `src/store/stateStore.ts` theo Observable Pattern**
  - Thin store: chỉ `getState`, `setState`, `subscribe`, `loadFromStorage`, `saveToStorage`, `resetToDefault`
  - `setState` shallow merge + auto-save + notify subscribers
  - `loadFromStorage` có try-catch, nếu JSON parse fail -> `resetToDefault()`
  - Schema version check: nếu `state.__version !== CURRENT_VERSION` -> reset
- [ ] **Step 4: Kiểm tra logic Store (subscribe/unsubscribe, setState trigger listeners, localStorage round-trip)**

**Verification:** Gọi `setState` -> subscribers nhận state mới -> reload trang -> `loadFromStorage` trả về state đã lưu. Test corrupt localStorage -> app không crash, fallback về default.

---

### Task 4: Xây dựng Actions, Utilities & Shared UI Components

**Files:**
- Create: `src/actions/courseActions.ts`
- Create: `src/actions/gradeActions.ts`
- Create: `src/actions/financeActions.ts`
- Create: `src/actions/profileActions.ts`
- Create: `src/utils/svgIcons.ts`
- Create: `src/utils/formatters.ts`
- Create: `src/utils/icsExporter.ts`
- Create: `src/utils/gpaCalculator.ts`
- Create: `src/utils/vietQr.ts`
- Create: `src/components/Toast.ts`
- Create: `src/components/Modal.ts`
- Create: `src/components/Header.ts`
- Create: `src/components/Sidebar.ts`
- Create: `src/components/SvgChart.ts`
- Create: `src/app/Router.ts`
- Create: `src/app/ViewLifecycle.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`
- Produces:
  - **Actions:** Các hàm thuần (pure functions đọc/ghi store) cho từng domain:
    - `courseActions.ts`: `registerCourse(courseId)`, `dropCourse(courseId)`, `hasScheduleConflict(course, registeredCourses): Course | null`
    - `gradeActions.ts`: `setSimulatedGrade(courseCode, grade4)`, `clearSimulations()`, `getProjectedGPA(state): number`
    - `financeActions.ts`: `payInvoice(invoiceId)`, `getTotalDebt(state): number`, `generateReceiptData(invoice): ReceiptData`
    - `profileActions.ts`: `updateContactInfo(email, phone)`, `exportStateAsJSON(): string`
  - **Utils:** SVG icons, formatters, .ics exporter, GPA calculator, VietQR generator
  - **Components:** Toast, Modal, Header, Sidebar, SvgChart (tái dùng cho Dashboard và Grades)
  - **Router:** Hash-based router điều hướng `#dashboard`, `#schedule`, `#grades`, `#registration`, `#finance`, `#profile`
  - **ViewLifecycle:** Interface `ViewModule { mount(container: HTMLElement): void; unmount(): void }` để quản lý cleanup (unsubscribe, clearInterval)

- [ ] **Step 1: Viết `src/app/ViewLifecycle.ts`**
  - Export interface `ViewModule` với `mount(container: HTMLElement): void` và `unmount(): void`
  - `unmount` chịu trách nhiệm: unsubscribe store listeners, clear timers, remove event listeners
- [ ] **Step 2: Viết `src/app/Router.ts`**
  - Lắng nghe `hashchange` event
  - Map hash -> `TabId` enum
  - Gọi `currentView.unmount()` trước khi mount view mới
  - Default route: `#dashboard`
  - Export: `initRouter(viewMap: Record<TabId, () => ViewModule>): void`
- [ ] **Step 3: Viết `src/actions/courseActions.ts`**
  - `registerCourse(courseId)`: Kiểm tra conflict trước, nếu không conflict -> thêm vào `registeredCourseIds` và tạo invoice mới
  - `dropCourse(courseId)`: Xóa khỏi `registeredCourseIds` và xóa invoice tương ứng
  - `hasScheduleConflict(newCourse, existingCourses)`: So sánh `dayOfWeek` + overlap `startPeriod..endPeriod`, trả về course bị trùng hoặc null
- [ ] **Step 4: Viết `src/actions/gradeActions.ts`**
  - `setSimulatedGrade(courseCode, grade4)`: Lưu vào `simulatedGrades` map trong state
  - `getProjectedGPA(state)`: Tính GPA tích lũy mới = (tổng điểm cũ * tín chỉ cũ + tổng điểm mô phỏng * tín chỉ mới) / tổng tín chỉ
- [ ] **Step 5: Viết `src/actions/financeActions.ts`**
  - `payInvoice(invoiceId)`: Đổi status sang `PAID`, gán `paidAt` = now, tạo `transactionRef` ngẫu nhiên
  - `getTotalDebt(state)`: Tổng amount của invoices có status `UNPAID` hoặc `OVERDUE`
- [ ] **Step 6: Viết `src/actions/profileActions.ts`**
  - `updateContactInfo(email, phone)`: Validate email format và phone regex trước khi lưu
  - `exportStateAsJSON()`: `JSON.stringify(store.getState(), null, 2)` và trigger download
- [ ] **Step 7: Tạo `src/utils/svgIcons.ts`**
  - Mỗi icon là hàm trả về SVG string, nhận `size` và `color` làm tham số
  - Icons cần: Dashboard, Calendar, GraduationCap, BookOpen, CreditCard, User, Sun, Moon, Download, Search, Check, AlertTriangle, Info, ChevronLeft, ChevronRight, Plus, Minus, Trash, Filter, Menu, X (close), Clock, MapPin, Mail, Phone, FileText, QrCode, RefreshCw
- [ ] **Step 8: Viết `src/utils/formatters.ts`**
  - `formatCurrency(amount: number): string` -> "12.500.000 VND" (dùng `Intl.NumberFormat('vi-VN')`)
  - `formatDate(dateStr: string): string` -> "24/08/2026"
  - `formatTime(period: number): string` -> "07:00" (map tiết -> giờ)
  - `getAcademicRank(gpa4: number): string` -> "Giỏi" / "Khá" / "Xuất sắc"
  - `getGradeLetter(total10: number): string` -> "A" / "B+" / "B" / ...
- [ ] **Step 9: Viết `src/utils/gpaCalculator.ts`**
  - `calculateSemesterGPA(courses: GradeCourseEntry[]): { gpa10: number, gpa4: number }`
  - `calculateCumulativeGPA(allSemesters: GradeRecord[]): { gpa10: number, gpa4: number, totalCredits: number }`
  - `convertScale10to4(score10: number): number` (theo thang điểm chuẩn: >= 8.5 -> 4.0, >= 8.0 -> 3.5, ...)
  - `getTargetGPAForHonor(currentGPA: number, currentCredits: number, remainingCredits: number, targetGPA: number): number` -> điểm trung bình cần đạt các kỳ còn lại
- [ ] **Step 10: Viết `src/utils/icsExporter.ts`**
  - Tạo chuỗi iCalendar chuẩn RFC 5545 từ danh sách `Course[]`
  - Mỗi course -> 1 VEVENT với DTSTART, DTEND, RRULE (weekly), SUMMARY, LOCATION, DESCRIPTION
  - Trigger download file `.ics` qua Blob + URL.createObjectURL
- [ ] **Step 11: Viết `src/utils/vietQr.ts`**
  - Kỹ thuật: Gọi API `https://img.vietqr.io/image/{bankBin}-{accountNo}-{template}.png?amount={amount}&addInfo={memo}&accountName={name}` để lấy ảnh QR
  - Fallback: Nếu offline hoặc API fail, hiển thị thông tin chuyển khoản dạng text (STK, Ngân hàng, Số tiền, Nội dung CK)
  - Bank info: Ngân hàng Vietcombank, STK `1234567890`, Tên `TRUONG DAI HOC CONG NGHE SAI GON`
  - Memo format: `[MSSV] DH5260789 - HK2 25-26`
  - Export: `generateVietQRUrl(amount: number, studentId: string, semester: string): string`
  - Export: `renderVietQRFallback(amount: number, studentId: string, semester: string): HTMLElement`
- [ ] **Step 12: Xây dựng `src/components/Toast.ts`**
  - Neobrutalism toast: viền đen, bóng đổ, 4 variants (success/error/warning/info)
  - Auto-dismiss sau 4 giây với CSS animation slideOut
  - Stack tối đa 3 toasts, cái cũ nhất bị đẩy ra
  - Export: `showToast(message: string, type: ToastType): void`
- [ ] **Step 13: Xây dựng `src/components/Modal.ts`**
  - Overlay backdrop mờ + card trung tâm neobrutalism
  - Đóng bằng click backdrop, nút X, hoặc phím Escape
  - Focus trap: Tab key chỉ xoay vòng trong modal
  - Export: `openModal(title: string, content: HTMLElement, options?: ModalOptions): void`, `closeModal(): void`
- [ ] **Step 14: Xây dựng `src/components/Header.ts`**
  - Logo/Tên app bên trái: "STU AMIS"
  - Bên phải: Nút toggle Dark/Light mode (icon Sun/Moon), Tên sinh viên, Nút hamburger (chỉ hiện trên mobile)
  - Subscribe store để reactive cập nhật theme icon
  - Export: `renderHeader(): HTMLElement` và `destroyHeader(): void`
- [ ] **Step 15: Xây dựng `src/components/Sidebar.ts`**
  - 6 nav items tương ứng 6 TabId, mỗi item có icon SVG + label text
  - Highlight active tab bằng background vàng primary
  - Responsive: desktop full width 260px, tablet chỉ icon 72px, mobile overlay drawer
  - Subscribe store `currentTab` để reactive highlight
  - Export: `renderSidebar(): HTMLElement` và `destroySidebar(): void`
- [ ] **Step 16: Xây dựng `src/components/SvgChart.ts`**
  - Biểu đồ cột (Bar Chart) vẽ bằng SVG thuần
  - Input: `Array<{ label: string, value: number, color: string }>`
  - Tự tính tỷ lệ scale theo giá trị max
  - Hover mỗi cột hiển thị tooltip (div absolutely positioned, không dùng SVG title)
  - Transition khi mount: mỗi cột animate chiều cao từ 0 lên giá trị thực (CSS transition trên `height`)
  - Export: `renderBarChart(data: ChartDataPoint[], options: ChartOptions): HTMLElement`

**Verification:** Import từng action/util/component vào main.ts tạm, gọi thử và kiểm tra output trên console hoặc DOM. Đặc biệt test: `hasScheduleConflict` với 2 môn trùng tiết, `generateVietQRUrl` trả URL hợp lệ, Toast hiện và tự biến mất.

---

### Task 5: Xây dựng View Tổng quan (Dashboard View)

**Files:**
- Create: `src/views/DashboardView.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`, `svgIcons.ts`, `formatters.ts`, `gpaCalculator.ts`, `SvgChart.ts`, `courseActions.ts`
- Produces: `DashboardView` implements `ViewModule` (`mount` và `unmount`)

- [ ] **Step 1: Tạo 4 Hero KPI Cards layout grid 2x2 (desktop) / 1 cột (mobile)**
  - Card 1: GPA Tích lũy - số lớn `JetBrains Mono`, badge xếp loại màu lime/vàng, nền gradient nhẹ
  - Card 2: Tín chỉ Tích lũy - `88 / 140 TC`, progress bar `.neo-progress` sọc chéo, phần trăm
  - Card 3: Lịch học hôm nay - số môn, live countdown `setInterval(1000)` đếm ngược HH:MM:SS đến tiết tiếp theo. **Timer phải được clear trong `unmount()`**
  - Card 4: Tình trạng Học phí - số tiền nợ, badge trạng thái PAID/UNPAID
- [ ] **Step 2: Tạo Widget "Lịch học Hôm nay & Ngày mai"**
  - Lọc courses theo `dayOfWeek === today` và `dayOfWeek === tomorrow`
  - Mỗi môn: neo-card nhỏ với mã màu theo CourseType, icon MapPin + phòng học, icon Clock + thời gian
- [ ] **Step 3: Tạo Widget "Biểu đồ GPA các kỳ" dùng `SvgChart`**
  - Data: 4 học kỳ, value = GPA hệ 4, color theo mức (>= 3.2 lime, >= 2.5 vàng, < 2.5 coral)
  - Tooltip hiển thị: "HK1 22-23: 3.45 / 4.0 - Giỏi"
- [ ] **Step 4: Tạo Widget "Thông báo & Việc cần làm"**
  - Danh sách notifications (5 mục gần nhất) với icon theo loại
  - Checklist todo items với `.neo-checkbox`, click toggle -> `setState` cập nhật `todos`
- [ ] **Step 5: Gắn click handlers trên KPI cards**
  - Click GPA card -> `location.hash = '#grades'`
  - Click Tín chỉ card -> `location.hash = '#grades'`
  - Click Lịch học card -> `location.hash = '#schedule'`
  - Click Học phí card -> `location.hash = '#finance'`
- [ ] **Step 6: Implement `unmount()` cleanup**
  - Clear countdown interval
  - Unsubscribe tất cả store listeners
  - Remove tất cả event listeners

**Verification:** Mount DashboardView, xác nhận 4 KPI cards hiển thị đúng dữ liệu, countdown đếm ngược chạy, chart render, click card chuyển tab. Unmount rồi mount lại -> không bị duplicate interval.

---

### Task 6: Xây dựng View Thời khóa biểu Tương tác (Schedule View)

**Files:**
- Create: `src/views/ScheduleView.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`, `svgIcons.ts`, `icsExporter.ts`, `formatters.ts`, `Modal.ts`
- Produces: `ScheduleView` implements `ViewModule`

- [ ] **Step 1: Tạo thanh công cụ phía trên**
  - 3 nút toggle chế độ hiển thị: Week Grid / Day Timeline / List (dùng `ScheduleViewMode` enum)
  - Dropdown chọn học kỳ
  - 3 nút lọc loại môn: Lý thuyết / Thực hành / Đồ án (toggle on/off, có thể chọn nhiều)
  - Nút "Xuất lịch .ics" bên phải
- [ ] **Step 2: Xây dựng Week Grid (7 cột, Thứ 2 - Chủ nhật)**
  - Grid CSS: cột = ngày, hàng = tiết (1-12)
  - Mỗi môn = neo-card nhỏ positioned theo `startPeriod..endPeriod`, màu nền theo CourseType:
    - Lý thuyết: Lavender, Thực hành: Cyan, Đồ án: vàng primary
  - Hiển thị: Tên môn (rút gọn), Phòng, Tiết
- [ ] **Step 3: Xây dựng Day Timeline và List View**
  - Day Timeline: Cột đơn theo trục thời gian dọc, mỗi môn = card chiều cao tỷ lệ số tiết
  - List View: Bảng `.neo-table` đơn giản: STT, Mã môn, Tên, Thứ, Tiết, Phòng, GV
- [ ] **Step 4: Tích hợp xuất file `.ics`**
  - Gọi `icsExporter.exportToICS(registeredCourses)` -> trigger download
  - Hiển thị Toast success sau khi tải
- [ ] **Step 5: Modal chi tiết môn học khi click vào thẻ**
  - Hiển thị đầy đủ: Mã môn, Tên đầy đủ, Số tín chỉ, Loại, Giảng viên, Email GV, Phòng, Thứ/Tiết, Học phí

**Verification:** Chuyển đổi 3 chế độ hiển thị mượt mà, bộ lọc ẩn/hiện đúng loại môn, xuất .ics tải được file, click môn mở modal chi tiết.

---

### Task 7: Xây dựng View Bảng điểm & Bộ Giả lập GPA (Grades View)

**Files:**
- Create: `src/views/GradesView.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`, `svgIcons.ts`, `gpaCalculator.ts`, `gradeActions.ts`, `formatters.ts`, `SvgChart.ts`
- Produces: `GradesView` implements `ViewModule`

- [ ] **Step 1: Tạo Summary Header**
  - Card lớn: GPA tích lũy hệ 4 (số lớn mono), GPA hệ 10, Tổng tín chỉ, Xếp loại
  - Biểu đồ phân bố điểm chữ (A/B+/B/C+/C/D/F) dùng `SvgChart` bar chart ngang
- [ ] **Step 2: Bảng điểm chi tiết theo từng học kỳ**
  - Accordion/Collapse cho mỗi học kỳ, mặc định mở kỳ gần nhất
  - `.neo-table`: Mã môn (mono), Tên môn, Tín chỉ, CC, GK, TH, CK, Tổng 10, Chữ, Hệ 4
  - Tô màu ô điểm: >= 8.5 lime, >= 7.0 vàng, >= 5.0 mặc định, < 5.0 coral đỏ
  - Footer mỗi kỳ: GPA kỳ, Tín chỉ đạt
- [ ] **Step 3: Bộ giả lập GPA (GPA Simulator)**
  - Section tách biệt với title "Giả lập GPA"
  - Danh sách các môn đang học kỳ hiện tại
  - Mỗi môn: tên + `.neo-slider` (range 0-4, step 0.5) + hiển thị giá trị điểm hệ 4
  - Nút "Xóa mô phỏng" reset tất cả slider
- [ ] **Step 4: Real-time GPA projection**
  - Khi kéo bất kỳ slider -> gọi `gradeActions.setSimulatedGrade()` -> subscribe state change -> recalculate:
    - GPA kỳ mô phỏng
    - GPA tích lũy dự kiến (bao gồm cả điểm mô phỏng)
  - Hiển thị delta: "+0.12" hoặc "-0.05" so với GPA hiện tại, màu lime/coral tương ứng
- [ ] **Step 5: Mục tiêu tốt nghiệp**
  - Gọi `getTargetGPAForHonor()` tính điểm TB cần đạt cho các kỳ còn lại
  - Hiển thị 3 mục tiêu: Xuất sắc (>= 3.6), Giỏi (>= 3.2), Khá (>= 2.5)
  - Nếu mục tiêu không khả thi (cần > 4.0) -> hiển thị "Không khả thi" màu coral

**Verification:** Bảng điểm hiển thị đúng 4 kỳ, kéo slider GPA simulator -> GPA tích lũy dự kiến thay đổi real-time, mục tiêu tốt nghiệp tính toán chính xác.

---

### Task 8: Xây dựng View Đăng ký Học phần & Phát hiện Trùng lịch (Registration View)

**Files:**
- Create: `src/views/RegistrationView.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`, `svgIcons.ts`, `formatters.ts`, `courseActions.ts`, `Toast.ts`
- Produces: `RegistrationView` implements `ViewModule`

- [ ] **Step 1: Thanh tìm kiếm và bộ lọc**
  - `.neo-input` tìm kiếm theo tên/mã môn (debounce 300ms, không dùng thư viện)
  - Dropdown lọc theo Khoa
  - Dropdown lọc theo số tín chỉ (2/3/4)
  - Badge hiển thị số kết quả tìm thấy
- [ ] **Step 2: Danh sách lớp học phần mở**
  - Grid cards hoặc table (tuỳ viewport): Mã môn, Tên, Tín chỉ, Loại, GV, Thứ/Tiết, Phòng
  - Nút "Đăng ký" trên mỗi card/row
  - Môn đã đăng ký: nút chuyển thành "Đã đăng ký" (disabled, badge lime)
  - Môn bị trùng lịch: viền đỏ coral, badge "Trùng lịch với [Tên môn]"
- [ ] **Step 3: Conflict Detection Engine**
  - Khi render danh sách, với mỗi môn chưa đăng ký, gọi `hasScheduleConflict(course, registeredCourses)`
  - Nếu conflict: viền card chuyển sang coral, thêm badge warning, nút Đăng ký bị disabled
  - Khi click "Đăng ký" 1 môn conflict (nếu bằng cách nào đó bypass) -> Toast error
- [ ] **Step 4: Giỏ đăng ký (Registration Cart)**
  - Panel bên phải (desktop) hoặc bottom sheet (mobile)
  - Liệt kê các môn đã đăng ký kỳ này với nút "Hủy" (icon Trash)
  - Footer: Tổng tín chỉ đăng ký, Học phí ước tính (tổng `tuitionFee` các môn)
- [ ] **Step 5: Xử lý Đăng ký / Hủy môn**
  - Click "Đăng ký" -> `courseActions.registerCourse(id)` -> Toast success -> re-render view
  - Click "Hủy" -> `courseActions.dropCourse(id)` -> Toast info -> re-render view
  - Cả 2 đều tự động cập nhật Store -> ScheduleView và FinanceView sẽ reactive cập nhật khi mount

**Verification:** Tìm kiếm lọc đúng, môn trùng lịch hiển thị viền đỏ + badge, đăng ký thành công -> môn xuất hiện trong cart + thời khóa biểu + học phí tăng. Hủy -> đảo ngược.

---

### Task 9: Xây dựng View Học phí & Thanh toán VietQR (Finance View)

**Files:**
- Create: `src/views/FinanceView.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`, `svgIcons.ts`, `formatters.ts`, `financeActions.ts`, `vietQr.ts`, `Modal.ts`, `Toast.ts`
- Produces: `FinanceView` implements `ViewModule`

- [ ] **Step 1: Thẻ tổng quan tài chính (3 KPI cards)**
  - Tổng học phí: số tiền lớn mono
  - Đã thanh toán: badge lime
  - Còn nợ: badge coral (nếu > 0) hoặc lime (nếu = 0)
- [ ] **Step 2: Bảng kê chi tiết từng khoản thu**
  - `.neo-table` phân nhóm theo học kỳ
  - Cột: STT, Khoản thu, Số tiền, Hạn nộp, Trạng thái (badge PAID/UNPAID/OVERDUE), Hành động
  - Nút "Thanh toán" trên mỗi row UNPAID/OVERDUE
- [ ] **Step 3: VietQR Payment Flow**
  - Click "Thanh toán" -> Modal mở ra chứa:
    - Ảnh QR từ `generateVietQRUrl()` (tag `<img>` với src là URL API VietQR)
    - Fallback text nếu ảnh load fail (`onerror` handler -> hiển thị `renderVietQRFallback()`)
    - Thông tin chuyển khoản text: Ngân hàng, STK, Số tiền, Nội dung
    - Nút "Tôi đã thanh toán (Mô phỏng)"
- [ ] **Step 4: Xử lý mô phỏng thanh toán**
  - Click "Mô phỏng" -> `financeActions.payInvoice(id)` -> đóng Modal -> Toast success
  - Row trong bảng chuyển trạng thái sang "PAID" real-time
  - KPI cards cập nhật lại số liệu
- [ ] **Step 5: Biên lai điện tử (E-Receipt)**
  - Sau khi thanh toán, row xuất hiện nút "Xem biên lai"
  - Click -> Modal hiển thị biên lai format: Logo STU, Thông tin SV, Khoản thu, Số tiền, Ngày thanh toán, Mã giao dịch
  - Nút "In biên lai" gọi `window.print()` với CSS `@media print` ẩn mọi thứ trừ modal content

**Verification:** Bảng kê hiển thị đúng, QR code load từ API, click mô phỏng thanh toán -> status chuyển PAID -> biên lai xem được -> nút In hoạt động.

---

### Task 10: Xây dựng View Hồ sơ Sinh viên (Profile View)

**Files:**
- Create: `src/views/ProfileView.ts`

**Interfaces:**
- Consumes: `stateStore.ts`, `portal.types.ts`, `svgIcons.ts`, `profileActions.ts`, `Toast.ts`
- Produces: `ProfileView` implements `ViewModule`

- [ ] **Step 1: Thẻ lý lịch sinh viên**
  - Avatar: Hình tròn viền đen neobrutalism, bên trong SVG icon User lớn (không dùng ảnh thật)
  - Thông tin grid 2 cột: MSSV (mono), Họ tên, Ngày sinh, Giới tính, Lớp, Ngành, Khoa, Khóa, Cố vấn
  - Badge xếp loại học lực cạnh tên
- [ ] **Step 2: Lịch sử Điểm rèn luyện**
  - Bảng nhỏ: Học kỳ | Điểm rèn luyện | Xếp loại
  - Có 4 kỳ tương ứng dữ liệu mock (điểm 75-95 range)
- [ ] **Step 3: Form chỉnh sửa thông tin liên hệ**
  - 2 trường `.neo-input`: Email và Số điện thoại
  - Pre-fill từ state hiện tại
  - Nút "Lưu thay đổi" -> validate -> `profileActions.updateContactInfo()` -> Toast success
  - Validation: email regex, phone 10 chữ số bắt đầu bằng 0
- [ ] **Step 4: Các nút tiện ích**
  - "Xuất dữ liệu JSON" -> `profileActions.exportStateAsJSON()` -> download file `stu_amis_backup.json`
  - "Khôi phục dữ liệu gốc" -> Confirm dialog (Modal) -> `store.resetToDefault()` -> Toast info -> reload toàn bộ views

**Verification:** Thông tin SV hiển thị chính xác, sửa email/phone -> lưu -> reload trang -> dữ liệu vẫn còn. Export JSON -> file hợp lệ. Factory reset -> tất cả về mặc định.

---

### Task 11: Khởi tạo Ứng dụng & Kiểm thử Toàn diện

**Files:**
- Create: `src/main.ts`
- Test: Toàn bộ luồng người dùng trên trình duyệt

**Interfaces:**
- Consumes: Tất cả Views, Components, Store, Router
- Produces: Hoàn thiện toàn bộ ứng dụng Cổng thông tin sinh viên STU AMIS Neobrutalism.

- [ ] **Step 1: Viết `src/main.ts`**
  - Import và inject CSS files (tokens, neobrutalism, app)
  - `stateStore.loadFromStorage()`
  - Render Header và Sidebar
  - Khởi tạo Router với viewMap: `{ [TabId.Dashboard]: () => new DashboardView(), ... }`
  - Apply theme từ state: `document.documentElement.dataset.theme = state.theme`
  - Subscribe theme changes để toggle `data-theme`
- [ ] **Step 2: Chạy `npm run dev` và kiểm tra 6 views**
  - Mỗi view mount/unmount không lỗi console
  - Navigation sidebar highlight đúng tab
  - Dark/Light mode toggle mượt mà
- [ ] **Step 3: Kiểm tra Responsive Layout**
  - 1440px: Layout 2 cột đầy đủ, grid cards 2x2
  - 1024px: Sidebar thu gọn icon only
  - 768px: Sidebar ẩn, hamburger menu hoạt động, grid cards 1 cột
  - 375px: Mọi thứ 1 cột, font size vừa đọc, không tràn ngang
- [ ] **Step 4: Kiểm tra chuỗi đồng bộ State xuyên suốt**
  - Đăng ký 1 môn mới (Registration) -> Chuyển sang Schedule -> Môn mới xuất hiện -> Chuyển sang Finance -> Học phí tăng đúng số tiền
  - Thử đăng ký môn trùng lịch -> Cảnh báo conflict hiện -> Không cho đăng ký
  - Kéo slider GPA Simulator -> GPA tích lũy dự kiến cập nhật real-time
  - Mô phỏng thanh toán VietQR -> Trạng thái hóa đơn chuyển "PAID" -> Biên lai xuất hiện
  - Xuất file .ics -> Mở file kiểm tra format iCalendar
  - Reload trang -> Mọi dữ liệu vẫn nguyên (localStorage persist)
- [ ] **Step 5: Build production `npm run build` xác nhận zero errors**
