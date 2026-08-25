import { CourseType, InvoiceStatus, type AppState, type Course, type InvoiceItem, type GradeRecord, type GradeCourseEntry } from '../types/portal.types';
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
    tuition?: any;
    grades?: any;
    notifications?: any;
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
    const u = localStorage.getItem('stu_amis_auth_user');
    const p = localStorage.getItem('stu_user_password');
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
  const u = username || localStorage.getItem('stu_amis_auth_user') || '';
  const p = password || localStorage.getItem('stu_user_password') || '';
  if (!u) return false;

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

  const profile = {
    ...s.profile,
    id: live.user.id || s.profile.id,
    fullName: live.user.fullName || s.profile.fullName,
    dob: live.user.dob || s.profile.dob,
    gender: parseGender(live.user.gender),
    citizenId: live.user.citizenId || s.profile.citizenId,
    status: (live.user as any).status || s.profile.status || 'Đang học',
    classCode: live.user.classCode || s.profile.classCode,
    blockCode: (live.user as any).blockCode || s.profile.blockCode || 'D26_TH',
    major: live.user.major || s.profile.major,
    faculty: live.user.faculty || s.profile.faculty,
    degreeLevel: live.user.degreeLevel || s.profile.degreeLevel,
    academicYear: live.user.academicYear || s.profile.academicYear,
    semesterIn: (live.user as any).semesterIn || s.profile.semesterIn,
    semesterOut: (live.user as any).semesterOut || s.profile.semesterOut,
    universityName: (live.user as any).universityName || s.profile.universityName,
    universityCode: (live.user as any).universityCode || s.profile.universityCode,
    advisor: live.user.advisor || s.profile.advisor,
    email: (live.user as any).email && !(live.user as any).email.includes('@domain.com')
      ? (live.user as any).email
      : `${(live.user.id || s.profile.id).toLowerCase()}@student.stu.edu.vn`,
    email2: (live.user as any).email2 || '',
    studentEmail: `${(live.user.id || s.profile.id).toLowerCase()}@student.stu.edu.vn`,
  };

  // 1. Phân tích hóa đơn học phí của sinh viên đó từ STU API
  const rawTuition = live.rawLive?.tuition?.data?.ds_phieu_bao_hp || [];
  let mappedInvoices: InvoiceItem[] = s.invoices;

  if (Array.isArray(rawTuition) && rawTuition.length > 0) {
    mappedInvoices = rawTuition.map((item: any, idx: number): InvoiceItem => {
      const amount = Number(item.hoc_phi || item.phai_thu || 0);
      const isPaid = Number(item.con_no || 0) === 0;
      return {
        id: `live-inv-${idx + 1}`,
        semesterId: item.hoc_ky || 'HK1',
        semesterName: item.ten_hoc_ky || 'Học kỳ 1 - Năm học 2026 - 2027',
        title: `Học phí ${item.ten_hoc_ky || 'Học kỳ'}`,
        amount,
        dueDate: '2026-09-15',
        status: isPaid ? InvoiceStatus.Paid : InvoiceStatus.Unpaid,
        paidAt: isPaid ? '2026-08-20T10:00:00' : null,
        transactionRef: `HD-${item.so_phieu || 12941}`
      };
    });
  }

  // 2. Phân tích kết quả học tập từ STU API
  const rawGrades = live.rawLive?.grades?.data?.ds_diem_hoc_ky || [];
  let mappedGrades: GradeRecord[] = s.grades;

  if (Array.isArray(rawGrades) && rawGrades.length > 0) {
    mappedGrades = rawGrades.map((sem: any, sIdx: number): GradeRecord => {
      const courses: GradeCourseEntry[] = (sem.ds_mon_hoc || []).map((c: any): GradeCourseEntry => ({
        courseCode: c.ma_mon || '',
        courseName: c.ten_mon || '',
        credits: Number(c.so_tin_chi || 0),
        attendance: Number(c.diem_chuyen_can || 0),
        midterm: Number(c.diem_giua_ky || 0),
        practical: c.diem_thuc_hanh != null ? Number(c.diem_thuc_hanh) : null,
        final: Number(c.diem_cuoi_ky || 0),
        total10: Number(c.diem_tong_ket || 0),
        gradeLetter: c.diem_chu || 'C',
        grade4: Number(c.diem_he_4 || 0),
        isPassed: c.ket_qua === 'Đạt' || Number(c.diem_tong_ket || 0) >= 4.0
      }));

      return {
        semesterId: sem.hoc_ky || `HK${sIdx + 1}`,
        semesterName: sem.ten_hoc_ky || `Học kỳ ${sIdx + 1}`,
        courses,
        gpaSemester10: Number(sem.dtb_hk_he10 || 0),
        gpaSemester4: Number(sem.dtb_hk_he4 || 0),
        creditsEarned: Number(sem.so_tin_chi_dat_hk || 0)
      };
    });
  }

  stateStore.setState({
    profile,
    invoices: mappedInvoices,
    grades: mappedGrades,
    serverTime: live.serverTime || live.rawLive?.serverTime?.thoigianht || s.serverTime,
    rawLiveSchedule: live.rawLive?.schedule || s.rawLiveSchedule,
    isLiveConnected: true
  });
}
