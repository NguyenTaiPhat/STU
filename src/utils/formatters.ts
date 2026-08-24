const PERIOD_START_TIMES: Record<number, string> = {
  1: '07:00', 2: '07:50', 3: '08:40', 4: '09:35', 5: '10:25', 6: '11:15',
  7: '12:35', 8: '13:25', 9: '14:15', 10: '15:10', 11: '16:00', 12: '16:50',
  13: '17:45', 14: '18:35', 15: '19:25'
};

const PERIOD_END_TIMES: Record<number, string> = {
  1: '07:50', 2: '08:40', 3: '09:30', 4: '10:25', 5: '11:15', 6: '12:05',
  7: '13:25', 8: '14:15', 9: '15:05', 10: '16:00', 11: '16:50', 12: '17:40',
  13: '18:35', 14: '19:25', 15: '20:15'
};

const DAY_NAMES: Record<number, string> = {
  1: 'Chủ nhật', 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4',
  5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7',
};

const RANK_THRESHOLDS: Array<[number, string]> = [
  [3.6, 'Xuất sắc'], [3.2, 'Giỏi'], [2.5, 'Khá'], [2.0, 'Trung bình'], [0, 'Yếu'],
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return `${time} - ${formatDate(dateStr)}`;
}

export function periodToTime(start: number, end: number): string {
  return `${PERIOD_START_TIMES[start] ?? '07:00'} - ${PERIOD_END_TIMES[end] ?? '11:15'}`;
}

export function getPeriodStartTime(period: number): string {
  return PERIOD_START_TIMES[period] ?? '00:00';
}

export function getPeriodEndTime(period: number): string {
  return PERIOD_END_TIMES[period] ?? '00:00';
}

export function getDayName(day: number): string {
  return DAY_NAMES[day] ?? '';
}

export function getAcademicRank(gpa4: number): string {
  for (const [threshold, rank] of RANK_THRESHOLDS) {
    if (gpa4 >= threshold) return rank;
  }
  return 'Yếu';
}

export function getGradeLetter(total10: number): string {
  if (total10 >= 9.0) return 'A+';
  if (total10 >= 8.5) return 'A';
  if (total10 >= 8.0) return 'B+';
  if (total10 >= 7.0) return 'B';
  if (total10 >= 6.5) return 'C+';
  if (total10 >= 5.5) return 'C';
  if (total10 >= 5.0) return 'D+';
  if (total10 >= 4.0) return 'D';
  return 'F';
}

export function getGradeColor(grade4: number): string {
  if (grade4 >= 3.5) return 'var(--neo-lime)';
  if (grade4 >= 2.5) return 'var(--neo-primary)';
  if (grade4 >= 2.0) return 'var(--neo-cyan)';
  return 'var(--neo-coral)';
}

export function getScoreColor(total10: number): string {
  if (total10 >= 8.5) return 'var(--neo-lime)';
  if (total10 >= 7.0) return 'var(--neo-primary)';
  if (total10 >= 5.0) return 'var(--neo-text)';
  return 'var(--neo-coral)';
}

export function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 1 : jsDay + 1;
}

export function padZero(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
