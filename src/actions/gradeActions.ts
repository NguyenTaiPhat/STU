import { type AppState, type GradeRecord } from '../types/portal.types';
import { stateStore } from '../store/stateStore';

export function setSimulatedGrade(courseCode: string, grade4: number): void {
  const s = stateStore.getState();
  stateStore.setState({
    simulatedGrades: { ...s.simulatedGrades, [courseCode]: grade4 },
  });
}

export function clearSimulations(): void {
  stateStore.setState({ simulatedGrades: {} });
}

export function getCumulativeCredits(grades: GradeRecord[]): number {
  return grades.reduce((sum, sem) => sum + sem.creditsEarned, 0);
}

export function getCumulativeGPA4(grades: GradeRecord[]): number {
  let totalWeighted = 0;
  let totalCredits = 0;
  for (const sem of grades) {
    for (const c of sem.courses) {
      totalWeighted += c.grade4 * c.credits;
      totalCredits += c.credits;
    }
  }
  return totalCredits === 0 ? 0 : totalWeighted / totalCredits;
}

export function getProjectedGPA(state: AppState): number {
  let totalWeighted = 0;
  let totalCredits = 0;

  for (const sem of state.grades) {
    for (const c of sem.courses) {
      totalWeighted += c.grade4 * c.credits;
      totalCredits += c.credits;
    }
  }

  for (const [code, grade4] of Object.entries(state.simulatedGrades)) {
    const course = state.allCourses.find(c => c.code === code);
    if (course) {
      totalWeighted += grade4 * course.credits;
      totalCredits += course.credits;
    }
  }

  return totalCredits === 0 ? 0 : totalWeighted / totalCredits;
}

export function getTargetGPA(
  currentGPA: number,
  currentCredits: number,
  remainingCredits: number,
  targetGPA: number
): number | null {
  if (remainingCredits <= 0) return null;
  const needed =
    (targetGPA * (currentCredits + remainingCredits) - currentGPA * currentCredits) /
    remainingCredits;
  return needed > 4.0 ? null : Math.max(0, needed);
}
