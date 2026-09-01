import {
  type StudentProfile, type Course, type GradeRecord, type InvoiceItem,
  type Notification, type TodoItem, type AppState,
  CourseType, InvoiceStatus, TabId, ThemeMode, ScheduleViewMode
} from '../types/portal.types';

const EMPTY_PROFILE: StudentProfile = {
  id: '',
  fullName: '',
  dob: '',
  gender: 'Nam',
  citizenId: '',
  status: 'Đang học',
  classCode: '',
  major: '',
  faculty: '',
  degreeLevel: 'Đại học chính quy',
  academicYear: '',
  advisor: '',
  trainingPoints: {},
  email: '',
  phone: ''
};

const REGISTERED_COURSES: Course[] = [];

const AVAILABLE_COURSES: Course[] = [
  { id: 'a01', code: 'CS03038', name: 'Lập trình cho thiết bị di động', credits: 3, type: CourseType.Theory, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 2, startPeriod: 7, endPeriod: 9, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 4615000, faculty: 'Công nghệ Thông tin' },
  { id: 'a02', code: 'CS0304', name: 'Thực hành Lập trình cho thiết bị di động', credits: 2, type: CourseType.Practice, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 2, startPeriod: 10, endPeriod: 12, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 3077000, faculty: 'Công nghệ Thông tin' },
  { id: 'a03', code: 'GS19007', name: 'Tiếng Anh 1', credits: 2, type: CourseType.Theory, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 3076000, faculty: 'Ngoại ngữ' },
  { id: 'a04', code: 'GS33001', name: 'Toán A1 (Hàm 1 biến, chuỗi)', credits: 4, type: CourseType.Theory, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 3, startPeriod: 1, endPeriod: 4, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 6153000, faculty: 'Khoa học Cơ bản' },
  { id: 'a05', code: 'GS43001', name: 'Vật lý 1', credits: 3, type: CourseType.Theory, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 4, startPeriod: 1, endPeriod: 3, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 4615000, faculty: 'Khoa học Cơ bản' },
  { id: 'a06', code: 'GS49004', name: 'Thí nghiệm Vật lý_Phần 1', credits: 1, type: CourseType.Practice, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 4, startPeriod: 7, endPeriod: 9, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 1538000, faculty: 'Khoa học Cơ bản' },
  { id: 'a07', code: 'GS59001', name: 'Tin học đại cương', credits: 2, type: CourseType.Theory, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 5, startPeriod: 1, endPeriod: 3, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 3076000, faculty: 'Công nghệ Thông tin' },
  { id: 'a08', code: 'GS59002', name: 'Thực hành Tin học đại cương', credits: 2, type: CourseType.Practice, lecturer: 'Chưa phân công', lecturerEmail: '', dayOfWeek: 6, startPeriod: 1, endPeriod: 5, room: 'Chưa xếp phòng', semesterId: 'HK26.1', tuitionFee: 3077000, faculty: 'Công nghệ Thông tin' },
];

const GRADES: GradeRecord[] = [];
const INVOICES: InvoiceItem[] = [];
const NOTIFICATIONS: Notification[] = [
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
const TODOS: TodoItem[] = [];

export function createDefaultState(): AppState {
  return {
    __version: 11,
    profile: EMPTY_PROFILE,
    allCourses: REGISTERED_COURSES,
    availableCourses: AVAILABLE_COURSES,
    registeredCourseIds: [],
    grades: GRADES,
    simulatedGrades: {},
    invoices: INVOICES,
    notifications: NOTIFICATIONS,
    todos: TODOS,
    currentTab: TabId.Dashboard,
    theme: ThemeMode.Light,
    scheduleViewMode: ScheduleViewMode.WeekGrid,
    isAuthenticated: Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('stu_amis_auth_user')),
  };
}
