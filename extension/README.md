# STU AMIS Auto Login - Browser Extension (Manifest V3)

Tiện ích mở rộng dành cho Google Chrome, Microsoft Edge, Cốc Cốc, Brave hỗ trợ tự động điền thông tin và đăng nhập vào Cổng thông tin sinh viên STU AMIS (`http://amis01.stu.edu.vn`).

---

## 1. Cấu trúc tệp

- `manifest.json`: Bản đặc tả cấu hình Manifest V3, phân quyền `storage` và phạm vi hoạt động trên miền `amis01.stu.edu.vn`.
- `content.js`: Script tiêm trực tiếp vào trang web trường, tương thích với Angular Reactive Form, tự động kích hoạt sự kiện input/change và nhấn nút Đăng nhập an toàn.
- `popup.html`, `popup.css`, `popup.js`: Giao diện quản lý tài khoản theo phong cách Neobrutalism tối giản, hỗ trợ bật/tắt Auto-Login và đổi mật khẩu cục bộ.
- `icons/`: Bộ icon kích thước 16x16, 48x48, 128x128.

---

## 2. Hướng dẫn cài đặt

1. Mở trình duyệt Chrome, Edge hoặc Cốc Cốc.
2. Truy cập vào trang quản lý tiện ích:
   - Google Chrome / Cốc Cốc: `chrome://extensions`
   - Microsoft Edge: `edge://extensions`
3. Gạt công tắc **Developer mode** (Chế độ cho nhà phát triển) ở góc trên bên phải sang **BẬT**.
4. Nhấn nút **Load unpacked** (Tải tiện ích đã giải nén).
5. Điều hướng và chọn thư mục: `d:\PROJECT\AMIS01\extension`.
6. Tiện ích **STU AMIS Auto Login** sẽ xuất hiện trên thanh công cụ trình duyệt.

---

## 3. Cơ chế hoạt động

1. Mặc định tài khoản được nạp sẵn:
   - Mã sinh viên: `DH05260789`
   - Mật khẩu: `23122008`
   - Trạng thái: Bật tự động đăng nhập.
2. Mỗi khi truy cập `http://amis01.stu.edu.vn/#/home`, tiện ích sẽ tự động nhận diện form đăng nhập Angular, điền thông tin và nhấn nút Đăng nhập trong vòng 350ms.
3. Cơ chế chống vòng lặp (Anti-Loop): Giới hạn tối đa 3 lần thử trong một phiên làm việc để bảo vệ an toàn tài khoản sinh viên. Khi sinh viên đã đăng nhập thành công, tiện ích tự động dừng thực thi.
