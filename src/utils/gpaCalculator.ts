import { type GradeCourseEntry, type GradeRecord } from '../types/portal.types';

const SCALE_MAP: Array<[number, number]> = [
  [9.0, 4.0], [8.5, 4.0], [8.0, 3.5], [7.0, 3.0],
  [6.5, 2.5], [5.5, 2.0], [5.0, 1.5], [4.0, 1.0], [0, 0],
];

export function convertScale10to4(score10: number): number {
  for (const [threshold, grade4] of SCALE_MAP) {
    if (score10 >= threshold) return grade4;
  }
  return 0;
}

export function calculateSemesterGPA(courses: GradeCourseEntry[]): { gpa10: number; gpa4: number } {
  let w10 = 0, w4 = 0, tc = 0;
  for (const c of courses) {
    w10 += c.total10 * c.credits;
    w4 += c.grade4 * c.credits;
    tc += c.credits;
  }
  return { gpa10: tc ? w10 / tc : 0, gpa4: tc ? w4 / tc : 0 };
}

export function calculateCumulativeGPA(semesters: GradeRecord[]): {
  gpa10: number; gpa4: number; totalCredits: number;
} {
  let w10 = 0, w4 = 0, tc = 0;
  for (const sem of semesters) {
    for (const c of sem.courses) {
      w10 += c.total10 * c.credits;
      w4 += c.grade4 * c.credits;
      tc += c.credits;
    }
  }
  return { gpa10: tc ? w10 / tc : 0, gpa4: tc ? w4 / tc : 0, totalCredits: tc };
}

export function getGradeDistribution(
  semesters: GradeRecord[]
): Record<string, number> {
  const dist: Record<string, number> = { 'A/A+': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D+/D': 0, 'F': 0 };
  for (const sem of semesters) {
    for (const c of sem.courses) {
      const l = c.gradeLetter;
      if (l === 'A+' || l === 'A') dist['A/A+']++;
      else if (l === 'B+') dist['B+']++;
      else if (l === 'B') dist['B']++;
      else if (l === 'C+') dist['C+']++;
      else if (l === 'C') dist['C']++;
      else if (l === 'D+' || l === 'D') dist['D+/D']++;
      else dist['F']++;
    }
  }
  return dist;
}
