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
const NOTIFICATIONS: Notification[] = [];
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
