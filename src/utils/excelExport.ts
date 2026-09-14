import * as XLSX from 'xlsx';
import { stateStore } from '../store/stateStore';

function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}

export function exportScheduleExcel(customStudentId?: string): void {
  const s = stateStore.getState();
  const studentId = customStudentId || s.profile.id || 'DH05260789';
  const fullName = s.profile.fullName || 'Nguyễn Tài Phát';
  const classCode = s.profile.classCode || 'D26_TH03';
  const filename = `ThoiKhoaBieuHocKy_${studentId}.xlsx`;

  const rawToHoc: any[] = s.rawLiveSemesterSchedule?.data?.ds_nhom_to || s.rawLiveSemesterSchedule?.data?.ds_to_hoc || [];

  const aoa: (string | number)[][] = [
    ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN - CỔNG THÔNG TIN SINH VIÊN (AMIS)'],
    ['THỜI KHÓA BIỂU HỌC KỲ - HỌC KỲ 1 NĂM HỌC 2026 - 2027'],
    [`Sinh viên: ${fullName} | MSSV: ${studentId} | Lớp: ${classCode} | Ngành: ${s.profile.major || 'Công nghệ Thông tin'}`],
    [''],
    ['STT', 'Mã MH', 'Tên môn học', 'Ghi chú', 'Nhóm tổ', 'Số TC', 'Lớp', 'Thứ', 'Tiết BĐ', 'Số tiết', 'Phòng', 'Giảng viên', 'SĐT GV', 'Thời gian học']
  ];

  let totalTC = 0;

  if (rawToHoc.length > 0) {
    rawToHoc.forEach((c, i) => {
      const tc = Number(c.so_tc || 0);
      totalTC += tc;
      aoa.push([
        i + 1,
        c.ma_mon || '',
        c.ten_mon || '',
        c.gc_to_hoc || '',
        c.nhom_to || '',
        tc,
        c.lop || '',
        `Thứ ${c.thu || ''}`,
        Number(c.tbd || 1),
        Number(c.so_tiet || 3),
        c.phong || '',
        c.gv || '',
        c.dt_gv || '',
        c.tkb || ''
      ]);
    });
  } else if (s.allCourses.length > 0) {
    s.allCourses.forEach((c, i) => {
      totalTC += c.credits;
      aoa.push([
        i + 1,
        c.code,
        c.name,
        '',
        '01',
        c.credits,
        classCode,
        `Thứ ${c.dayOfWeek}`,
        c.startPeriod,
        c.endPeriod - c.startPeriod + 1,
        c.room,
        c.lecturer,
        c.lecturerEmail || '',
        'Học kỳ 1'
      ]);
    });
  }

  aoa.push(['']);
  aoa.push(['', '', 'TỔNG CỘNG TÍN CHỈ HỌC KỲ:', '', '', totalTC || 14, '', '', '', '', '', '', '', '']);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 12 }, // Mã MH
    { wch: 32 }, // Tên môn
    { wch: 10 }, // Ghi chú
    { wch: 10 }, // Nhóm tổ
    { wch: 8 },  // Số TC
    { wch: 14 }, // Lớp
    { wch: 10 }, // Thứ
    { wch: 10 }, // Tiết BĐ
    { wch: 10 }, // Số tiết
    { wch: 14 }, // Phòng
    { wch: 22 }, // Giảng viên
    { wch: 15 }, // SĐT GV
    { wch: 26 }  // Thời gian
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TKB_HocKy');
  downloadWorkbook(wb, filename);
}

export function exportScheduleWeekExcel(customStudentId?: string, weekNumber = 1): void {
  const s = stateStore.getState();
  const studentId = customStudentId || s.profile.id || 'DH05260789';
  const filename = `ThoiKhoaBieuTuan_${studentId}_Tuan${weekNumber}.xlsx`;

  const rawWeeks: any[] = s.rawLiveSchedule?.data?.ds_tuan_tkb || [];
  const currentWeek = rawWeeks.find(w => w.tuan_hoc_ky === weekNumber) || rawWeeks[0];
  const classes: any[] = currentWeek?.ds_thoi_khoa_bieu || [];

  const aoa: (string | number)[][] = [
    ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN - CỔNG THÔNG TIN SINH VIÊN (AMIS)'],
    [`THỜI KHÓA BIỂU TUẦN ${weekNumber} (${currentWeek?.ngay_bat_dau || ''} - ${currentWeek?.ngay_ket_thuc || ''})`],
    [`Sinh viên: ${s.profile.fullName || 'Nguyễn Tài Phát'} | MSSV: ${studentId} | Lớp: ${s.profile.classCode}`],
    [''],
    ['STT', 'Mã MH', 'Tên môn học', 'Nhóm tổ', 'Số TC', 'Thứ', 'Tiết BĐ', 'Số tiết', 'Phòng', 'Giảng viên', 'Lớp học']
  ];

  classes.forEach((c, idx) => {
    aoa.push([
      idx + 1,
      c.ma_mon || '',
      c.ten_mon || '',
      c.ma_nhom || '',
      Number(c.so_tin_chi || 0),
      `Thứ ${c.thu_kieu_so || ''}`,
      Number(c.tiet_bat_dau || 1),
      Number(c.so_tiet || 3),
      c.ma_phong || '',
      c.ten_giang_vien || '',
      c.ma_lop || s.profile.classCode
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 32 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tuan_${weekNumber}`);
  downloadWorkbook(wb, filename);
}

export function exportTuitionExcel(customStudentId?: string): void {
  const s = stateStore.getState();
  const studentId = customStudentId || s.profile.id || 'DH05260789';
  const filename = `BangTongHopHocPhi_${studentId}.xlsx`;

  const aoa: (string | number)[][] = [
    ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN - PHÒNG KẾ HOẠCH TÀI CHÍNH'],
    ['BẢNG TỔNG HỢP HỌC PHÍ VÀ LỆ PHÍ SINH VIÊN'],
    [`Sinh viên: ${s.profile.fullName || 'Nguyễn Tài Phát'} | MSSV: ${studentId} | Lớp: ${s.profile.classCode}`],
    [''],
    ['Stt', 'Niên học học kỳ', 'Khoản thu chi tiết', 'Học phí chưa giảm', 'Miễn giảm', 'Phải thu', 'Đã thu', 'Còn nợ', 'Số phiếu thu', 'Ngày nộp'],
    [1, 'Học kỳ 1 (2026 - 2027)', 'Học phí chính khóa (14 Tín chỉ)', 21025000, 0, 21025000, 21025000, 0, 'BL2161.26', '20/08/2026 11:30:24'],
    [2, 'Học kỳ 1 (2026 - 2027)', 'Lệ phí hồ sơ nhập học', 300000, 0, 300000, 300000, 0, 'BL2161.26', '20/08/2026 11:30:24'],
    [3, 'Học kỳ 1 (2026 - 2027)', 'Life (BrE) (VNEd) A1-A2 Student Book', 210000, 0, 210000, 210000, 0, 'BL2161.26', '20/08/2026 11:30:24'],
    [''],
    ['TỔNG CỘNG', '', '', 21535000, 0, 21535000, 21535000, 0, 'BL2161.26', 'Đã quyết toán']
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 38 },
    { wch: 18 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TongHopHocPhi');
  downloadWorkbook(wb, filename);
}

export function exportCTDTExcel(customStudentId?: string): void {
  const s = stateStore.getState();
  const studentId = customStudentId || s.profile.id || 'DH05260789';
  const filename = `ChuongTrinhDaoTao_${studentId}.xlsx`;

  const aoa: (string | number)[][] = [
    ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN - KHOA CÔNG NGHỆ THÔNG TIN'],
    ['CHƯƠNG TRÌNH ĐÀO TẠO CHUẨN ĐẠI HỌC CHÍNH QUY (145 TÍN CHỈ)'],
    [`Sinh viên: ${s.profile.fullName || 'Nguyễn Tài Phát'} | MSSV: ${studentId} | Niên khóa: ${s.profile.academicYear}`],
    [''],
    ['STT', 'MÃ MH', 'TÊN MÔN HỌC', 'SỐ TC', 'MÔN BẮT BUỘC', 'TỔNG TIẾT', 'LÝ THUYẾT', 'THỰC HÀNH', 'HỌC KỲ DỰ KIẾN'],
    [1, 'GS19007', 'Tiếng Anh 1', 2, 'Bắt buộc', 45, 15, 0, 'Học kỳ 1 (2026 - 2027)'],
    [2, 'GS33001', 'Toán A1 (Hàm 1 biến, chuỗi)', 4, 'Bắt buộc', 60, 45, 0, 'Học kỳ 1 (2026 - 2027)'],
    [3, 'GS43001', 'Vật lý 1', 3, 'Bắt buộc', 45, 30, 0, 'Học kỳ 1 (2026 - 2027)'],
    [4, 'GS49004', 'Thí nghiệm Vật lý_Phần 1', 1, 'Bắt buộc', 15, 0, 15, 'Học kỳ 1 (2026 - 2027)'],
    [5, 'GS59001', 'Tin học đại cương', 2, 'Bắt buộc', 30, 30, 0, 'Học kỳ 1 (2026 - 2027)'],
    [6, 'GS59002', 'Thực hành Tin học đại cương', 2, 'Bắt buộc', 45, 0, 30, 'Học kỳ 1 (2026 - 2027)'],
    [7, 'GS33002', 'Toán A2 (Phép tính vi tích phân)', 3, 'Bắt buộc', 45, 45, 0, 'Học kỳ 2 (2026 - 2027)'],
    [8, 'CS03001', 'Kỹ thuật lập trình', 3, 'Bắt buộc', 45, 30, 15, 'Học kỳ 2 (2026 - 2027)']
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 34 },
    { wch: 8 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'CTDT_CNTT');
  downloadWorkbook(wb, filename);
}

export function exportGradesExcel(customStudentId?: string, customFullName?: string): void {
  const s = stateStore.getState();
  const studentId = customStudentId || s.profile.id || 'DH05260789';
  const fullName = customFullName || s.profile.fullName || 'Nguyễn Tài Phát';
  const filename = `BangDiem_${studentId}.xlsx`;

  const sem = s.grades[0];
  const courses = sem?.courses || [];

  const aoa: (string | number)[][] = [
    ['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ SÀI GÒN - PHÒNG ĐÀO TẠO'],
    ['KẾT QUẢ HỌC TẬP VÀ ĐIỂM DANH SINH VIÊN'],
    [`Sinh viên: ${fullName} | MSSV: ${studentId} | Lớp: ${s.profile.classCode}`],
    [''],
    ['STT', 'Mã MH', 'Tên môn học', 'Số TC', 'Điểm quá trình', 'Điểm giữa kỳ', 'Điểm thi', 'Điểm TK (10)', 'Điểm chữ', 'Điểm (4)', 'Trạng thái']
  ];

  if (courses.length > 0) {
    courses.forEach((c, idx) => {
      aoa.push([
        idx + 1,
        c.courseCode,
        c.courseName,
        c.credits,
        c.attendance != null ? c.attendance : '-',
        c.midterm != null ? c.midterm : '-',
        c.final != null ? c.final : '-',
        c.total10 != null ? c.total10 : '-',
        c.gradeLetter || '-',
        c.grade4 != null ? c.grade4 : '-',
        c.total10 != null ? (c.isPassed ? 'Đạt' : 'Chưa đạt') : 'Đang học'
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 34 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BangDiem');
  downloadWorkbook(wb, filename);
}
