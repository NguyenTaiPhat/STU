import { type Course } from '../types/portal.types';
import { getDayName, getPeriodStartTime, getPeriodEndTime } from './formatters';

function formatICSDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}00`;
}

function getNextDateForDay(dayOfWeek: number): Date {
  const now = new Date();
  const jsTarget = dayOfWeek === 1 ? 0 : dayOfWeek - 1;
  const jsNow = now.getDay();
  const diff = (jsTarget - jsNow + 7) % 7 || 7;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  return target;
}

function buildVEvent(course: Course): string {
  const startTime = getPeriodStartTime(course.startPeriod);
  const endTime = getPeriodEndTime(course.endPeriod);
  const dateRef = getNextDateForDay(course.dayOfWeek);

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  const dtStart = new Date(dateRef);
  dtStart.setHours(sh, sm, 0);
  const dtEnd = new Date(dateRef);
  dtEnd.setHours(eh, em, 0);

  const uid = `${course.id}@stu-amis-portal`;
  const dayName = getDayName(course.dayOfWeek);

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${formatICSDate(dtStart)}`,
    `DTEND:${formatICSDate(dtEnd)}`,
    `RRULE:FREQ=WEEKLY;COUNT=18`,
    `SUMMARY:${course.name} (${course.code})`,
    `LOCATION:${course.room}`,
    `DESCRIPTION:GV: ${course.lecturer} | ${dayName} | Tiet ${course.startPeriod}-${course.endPeriod}`,
    'END:VEVENT',
  ];
  return lines.join('\r\n');
}

export function generateICSContent(courses: Course[]): string {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//STU AMIS Portal//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lich hoc STU AMIS',
  ].join('\r\n');

  const events = courses.map(buildVEvent).join('\r\n');
  return `${header}\r\n${events}\r\nEND:VCALENDAR`;
}

export function downloadICS(courses: Course[]): void {
  const content = generateICSContent(courses);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stu_amis_schedule.ics';
  a.click();
  URL.revokeObjectURL(url);
}
