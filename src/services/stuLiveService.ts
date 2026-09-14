import { CourseType, InvoiceStatus, type AppState, type Course, type InvoiceItem, type GradeRecord, type GradeCourseEntry, type Notification } from '../types/portal.types';
import { stateStore } from '../store/stateStore';

export interface LiveSyncResult {
  success: boolean;
  syncedAt: string;
  serverTime?: string;
  user: {
    id: string;
    fullName: string;
    principal: string;
    roles: string;
    rawId: string;
    dob?: string;
    gender?: string;
    citizenId?: string;
    classCode?: string;
    major?: string;
    faculty?: string;
    degreeLevel?: string;
    academicYear?: string;
    advisor?: string;
  };
  rawLive: {
    info?: any;
    schedule?: any;
    semesterSchedule?: any;
    tuition?: any;
    tuitionSummary?: any;
    tuitionDetail?: any;
    grades?: any;
    notifications?: any;
    registeredCourses?: any;
    curriculum?: any;
    attendance?: any;
    serverTime?: any;
  };
}

let autoSyncTimer: any = null;

export function parseGender(raw: any): 'Nam' | 'Nữ' {
  if (raw === undefined || raw === null || raw === '') return 'Nam';
  const str = String(raw).trim().toLowerCase();
  if (str === '0' || str === 'nữ' || str === 'nu' || str === 'female' || str === 'gái' || raw === false) {
    return 'Nữ';
  }
  return 'Nam';
}

export function startAutoSyncPolling(intervalSeconds: number = 15): void {
  stopAutoSyncPolling();
  const intervalMs = Math.max(5000, intervalSeconds * 1000);
  autoSyncTimer = setInterval(() => {
    const s = stateStore.getState();
    if (!s.isAuthenticated || s.isLiveSyncing) return;
    const u = localStorage.getItem('stu_amis_auth_user') || 'DH05260789';
    const p = localStorage.getItem('stu_user_password') || '23122008';
    if (u && p) {
      fetchAndApplyLiveSTUData(u, p).catch(() => {});
    }
  }, intervalMs);
}

export function stopAutoSyncPolling(): void {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
}

export async function fetchAndApplyLiveSTUData(
  username?: string,
  password?: string
): Promise<boolean> {
  const u = username || localStorage.getItem('stu_amis_auth_user') || 'DH05260789';
  const p = password || localStorage.getItem('stu_user_password') || '23122008';
  if (!u) return false;

  if (p) {
    localStorage.setItem('stu_user_password', p);
  }
  if (u) {
    localStorage.setItem('stu_amis_auth_user', u);
  }

  stateStore.setState({ isLiveSyncing: true });

  try {
    const res = await fetch('/stu-api/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    const data: LiveSyncResult = await res.json();
    applyLivePayloadToStore(data);
    stateStore.setState({
      isLiveSyncing: false,
      isLiveConnected: true,
      lastSyncedAt: data.syncedAt
    });
    return true;
  } catch (err: any) {
    stateStore.setState({ isLiveSyncing: false, isLiveConnected: false });
    return false;
  }
}

function applyLivePayloadToStore(live: LiveSyncResult): void {
  const s = stateStore.getState();
  const svInfo = live.rawLive?.info;

  const profile = {
    ...s.profile,
    id: live.user.id || s.profile.id,
    fullName: live.user.fullName || s.profile.fullName,
    dob: live.user.dob || s.profile.dob,
    gender: parseGender(live.user.gender),
    citizenId: live.user.citizenId || svInfo?.so_cmnd || s.profile.citizenId || '051208000136',
    status: (live.user as any).status || svInfo?.hien_dien_sv || s.profile.status || 'Đang học',
    classCode: live.user.classCode || svInfo?.lop || s.profile.classCode,
    blockCode: (live.user as any).blockCode || svInfo?.khoi || s.profile.blockCode || 'D26_TH',
    major: live.user.major || svInfo?.nganh || s.profile.major,
    faculty: live.user.faculty || svInfo?.khoa || s.profile.faculty,
    degreeLevel: live.user.degreeLevel || svInfo?.bac_he_dao_tao || s.profile.degreeLevel,
    academicYear: live.user.academicYear || svInfo?.nien_khoa || s.profile.academicYear,
    semesterIn: (live.user as any).semesterIn || svInfo?.str_nhhk_vao || s.profile.semesterIn,
    semesterOut: (live.user as any).semesterOut || svInfo?.str_nhhk_ra || s.profile.semesterOut,
    universityName: (live.user as any).universityName || svInfo?.ten_truong || s.profile.universityName,
    universityCode: (live.user as any).universityCode || svInfo?.ma_truong || s.profile.universityCode,
    advisor: live.user.advisor || svInfo?.ho_ten_cvht || s.profile.advisor,
    email: (live.user as any).email && !(live.user as any).email.includes('@domain.com')
      ? (live.user as any).email
      : (svInfo?.email || 'DH05260789@student.stu.edu.vn'),
    email2: (live.user as any).email2 || svInfo?.email2 || '',
    phone: svInfo?.dien_thoai || s.profile.phone || '0793479747',
    officialNotice: (live.user as any).officialNotice || s.profile.officialNotice || ''
  };

  // 1. Phân tích Thời khóa biểu học kỳ & môn học đăng ký từ STU API
  const rawToHoc = live.rawLive?.semesterSchedule?.data?.ds_nhom_to || live.rawLive?.semesterSchedule?.data?.ds_to_hoc || [];
  let mappedCourses: Course[] = s.allCourses;
  let registeredIds: string[] = s.registeredCourseIds;

  if (Array.isArray(rawToHoc) && rawToHoc.length > 0) {
    mappedCourses = rawToHoc.map((item: any, idx: number): Course => {
      const startPeriod = Number(item.tbd || 1);
      const periodCount = Number(item.so_tiet || 3);
      const isPractice = (item.so_tiet_th && Number(item.so_tiet_th) > 0) ||
        String(item.ten_mon).toLowerCase().includes('thực hành') ||
        String(item.ten_mon).toLowerCase().includes('thí nghiệm');

      return {
        id: String(item.id_to_hoc || `course-${idx + 1}`),
        code: item.ma_mon || '',
        name: item.ten_mon || '',
        credits: Number(item.so_tc || 0),
        type: isPractice ? CourseType.Practice : CourseType.Theory,
        lecturer: item.gv || 'Chưa phân công',
        lecturerEmail: item.dt_gv ? `SĐT: ${item.dt_gv}` : '',
        dayOfWeek: Number(item.thu || 2),
        startPeriod,
        endPeriod: startPeriod + periodCount - 1,
        room: item.phong ? `${item.phong} (Dãy ${item.day_phong_hk || ''})` : 'Chưa xếp phòng',
        semesterId: '20261',
        tuitionFee: Number(item.so_tc || 0) * 1538000,
        faculty: 'Công nghệ Thông tin'
      };
    });
    registeredIds = mappedCourses.map(c => c.id);
  }

  // 2. Phân tích hóa đơn học phí thực tế từ STU API (rms/w-locdstonghophocphisv)
  const rawSummary = live.rawLive?.tuitionSummary?.data?.ds_hoc_phi_hoc_ky || [];
  let mappedInvoices: InvoiceItem[] = s.invoices;

  if (Array.isArray(rawSummary) && rawSummary.length > 0) {
    mappedInvoices = rawSummary.map((item: any, idx: number): InvoiceItem => {
      const amount = Number(item.hoc_phi || 21535000);
      const isPaid = Number(item.con_no || 0) === 0;
      return {
        id: `live-inv-${idx + 1}`,
        semesterId: String(item.nhhk || '20261'),
        semesterName: item.ten_hoc_ky || 'Học kỳ 1 - Năm học 2026 - 2027',
        title: item.ten_nhom_ct || 'Thu Học Phí',
        amount,
        dueDate: '2026-09-15',
        status: isPaid ? InvoiceStatus.Paid : InvoiceStatus.Unpaid,
        paidAt: isPaid ? '2026-08-20T11:30:24' : null,
        transactionRef: 'BL2161.26'
      };
    });
  }

  // 3. Phân tích kết quả học tập từ STU API (srm/w-locdsdiemsinhvien)
  const rawGrades = live.rawLive?.grades?.data?.ds_diem_hocky || [];
  let mappedGrades: GradeRecord[] = s.grades;

  if (Array.isArray(rawGrades) && rawGrades.length > 0) {
    mappedGrades = rawGrades.map((sem: any, sIdx: number): GradeRecord => {
      const courses: GradeCourseEntry[] = (sem.ds_diem_mon_hoc || []).map((c: any): GradeCourseEntry => ({
        courseCode: c.ma_mon || '',
        courseName: c.ten_mon || '',
        credits: Number(c.so_tin_chi || 0),
        attendance: c.diem_chuyen_can ? Number(c.diem_chuyen_can) : (null as any),
        midterm: c.diem_giua_ky ? Number(c.diem_giua_ky) : (null as any),
        practical: c.diem_thuc_hanh != null && c.diem_thuc_hanh !== '' ? Number(c.diem_thuc_hanh) : null,
        final: c.diem_thi ? Number(c.diem_thi) : (null as any),
        total10: c.diem_tk ? Number(c.diem_tk) : (null as any),
        gradeLetter: c.diem_tk_chu || '-',
        grade4: c.diem_tk_so ? Number(c.diem_tk_so) : (null as any),
        isPassed: c.ket_qua === 'Đạt' || c.ket_qua === 1 || Number(c.diem_tk || 0) >= 4.0
      }));

      return {
        semesterId: String(sem.hoc_ky || `HK${sIdx + 1}`),
        semesterName: sem.ten_hoc_ky || `Học kỳ ${sIdx + 1}`,
        courses,
        gpaSemester10: Number(sem.so_tin_chi_dat_hk || 0),
        gpaSemester4: 0,
        creditsEarned: Number(sem.so_tin_chi_dat_tich_luy || 0)
      };
    });
  }

  // 4. Phân tích thông báo từ STU API hoặc fallback về danh sách thông báo chính thức STU
  const rawNotifs = live.rawLive?.notifications?.data?.ds_thong_bao || live.rawLive?.notifications?.data || live.rawLive?.notifications;
  let mappedNotifs: Notification[] = s.notifications && s.notifications.length > 0 ? s.notifications : [];

  if (Array.isArray(rawNotifs) && rawNotifs.length > 0) {
    mappedNotifs = rawNotifs.map((n: any, i: number): Notification => ({
      id: `live-notif-${i + 1}`,
      title: n.tieu_de || n.ten_thong_bao || 'Thông báo từ Nhà trường STU',
      message: n.noi_dung || n.ghi_chu || n.noi_dung_tom_tat || '',
      type: 'info',
      date: n.ngay_dang || n.ngay_gui || '01/09/2026',
      isRead: false
    }));
  }

  if (!mappedNotifs || mappedNotifs.length === 0) {
    const defState = stateStore.getState();
    mappedNotifs = defState.notifications && defState.notifications.length > 0
      ? defState.notifications
      : [
          {
            id: 'notif-01',
            title: 'Thông báo Thời khóa biểu Tân sinh viên Khóa 2026 (Lớp D26_TH03)',
            message: '[Tân sinh viên khóa 2026 không cần thực hiện đăng ký môn học; thời khóa biểu sẽ được thông báo trong thời gian từ ngày 01/09/2026 đến ngày 05/09/2026]. Tất cả sinh viên theo dõi cập nhật trên Cổng AMIS STU.',
            type: 'warning',
            date: '01/09/2026',
            isRead: false
          },
          {
            id: 'notif-02',
            title: 'Khung giờ Hoạt động Cổng ĐKMH STU',
            message: 'Cổng Đăng ký môn học & Tra cứu dữ liệu AMIS STU mở cửa phục vụ sinh viên từ 07:00 đến 19:00 hàng ngày. Ngoài khung giờ này hệ thống máy chủ STU tạm khóa các cổng đăng ký học vụ.',
            type: 'info',
            date: '01/09/2026',
            isRead: false
          },
          {
            id: 'notif-03',
            title: 'Kế hoạch Nộp Học phí & Cổng Thanh toán VietQR STU',
            message: 'Sinh viên thực hiện nộp học phí Học kỳ 1 qua cổng Chuyển khoản ngân hàng VietQR STU hoặc nộp trực tiếp tại Phòng Kế hoạch - Tài chính (Phòng A105). Thông tin tài khoản ACB, MB, BIDV, Vietcombank đã cập nhật tại mục Học phí.',
            type: 'success',
            date: '28/08/2026',
            isRead: true
          },
          {
            id: 'notif-04',
            title: 'Tuần sinh hoạt công dân đầu khóa K2026 & Nhận Thẻ Sinh viên',
            message: 'Tất cả Tân sinh viên Khóa 2026 thuộc Khoa Công nghệ Thông tin tập trung tại Hội trường A lúc 08:00 ngày 08/09/2026 để nhận Thẻ sinh viên tích hợp ATM và tham gia Tuần sinh hoạt công dân.',
            type: 'info',
            date: '25/08/2026',
            isRead: true
          }
        ];
  }

  stateStore.setState({
    profile,
    allCourses: mappedCourses,
    registeredCourseIds: registeredIds,
    invoices: mappedInvoices,
    grades: mappedGrades,
    serverTime: live.serverTime || live.rawLive?.serverTime?.thoigianht || s.serverTime,
    rawLiveCurriculum: live.rawLive?.curriculum || s.rawLiveCurriculum,
    rawLiveSchedule: live.rawLive?.schedule || s.rawLiveSchedule,
    rawLiveSemesterSchedule: live.rawLive?.semesterSchedule || s.rawLiveSemesterSchedule,
    rawLiveRegisteredCourses: live.rawLive?.registeredCourses || s.rawLiveRegisteredCourses,
    rawLiveTuitionSummary: live.rawLive?.tuitionSummary || s.rawLiveTuitionSummary,
    rawLiveTuitionDetail: live.rawLive?.tuitionDetail || s.rawLiveTuitionDetail,
    rawLiveGrades: live.rawLive?.grades || s.rawLiveGrades,
    rawLiveAttendance: live.rawLive?.attendance || s.rawLiveAttendance,
    notifications: mappedNotifs,
    officialNotice: profile.officialNotice,
    isLiveConnected: true
  });
}
