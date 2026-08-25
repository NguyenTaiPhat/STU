export enum TabId {
  Dashboard = 'dashboard',
  Notifications = 'notifications',
  Registration = 'registration',
  Finance = 'finance',
  Schedule = 'schedule',
  Grades = 'grades',
  Profile = 'profile',
  Feedback = 'feedback'
}

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark'
}

export enum ScheduleViewMode {
  WeekGrid = 'week',
  DayTimeline = 'day',
  ListView = 'list'
}

export enum InvoiceStatus {
  Paid = 'PAID',
  Unpaid = 'UNPAID',
  Overdue = 'OVERDUE'
}

export enum CourseType {
  Theory = 'LT',
  Practice = 'TH',
  Project = 'DA'
}

export interface StudentProfile {
  id: string;
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  citizenId?: string;
  status?: string;
  classCode: string;
  major: string;
  faculty: string;
  degreeLevel?: string;
  academicYear: string;
  advisor: string;
  trainingPoints: Record<string, number>;
  email: string;
  phone: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: CourseType;
  lecturer: string;
  lecturerEmail: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  room: string;
  semesterId: string;
  tuitionFee: number;
  faculty: string;
}

export interface GradeCourseEntry {
  courseCode: string;
  courseName: string;
  credits: number;
  attendance: number;
  midterm: number;
  practical: number | null;
  final: number;
  total10: number;
  gradeLetter: string;
  grade4: number;
  isPassed: boolean;
}

export interface GradeRecord {
  semesterId: string;
  semesterName: string;
  courses: GradeCourseEntry[];
  gpaSemester10: number;
  gpaSemester4: number;
  creditsEarned: number;
}

export interface InvoiceItem {
  id: string;
  semesterId: string;
  semesterName: string;
  title: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt: string | null;
  transactionRef: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  isRead: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
  tooltip?: string;
}

export interface AppState {
  __version: number;
  profile: StudentProfile;
  allCourses: Course[];
  availableCourses: Course[];
  registeredCourseIds: string[];
  grades: GradeRecord[];
  simulatedGrades: Record<string, number>;
  invoices: InvoiceItem[];
  notifications: Notification[];
  todos: TodoItem[];
  currentTab: TabId;
  theme: ThemeMode;
  scheduleViewMode: ScheduleViewMode;
  isAuthenticated: boolean;
  isLiveSyncing?: boolean;
  isLiveConnected?: boolean;
  lastSyncedAt?: string;
  serverTime?: string;
  rawLiveSchedule?: any;
  isSidebarCollapsed?: boolean;
}

export interface ViewModule {
  mount(container: HTMLElement): void;
  unmount(): void;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type StateListener = (state: AppState) => void;
