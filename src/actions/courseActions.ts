import { type Course, InvoiceStatus } from '../types/portal.types';
import { stateStore } from '../store/stateStore';

function generateTransactionRef(): string {
  const now = new Date();
  const ts = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VCB-${ts}-${rand}`;
}

export function hasScheduleConflict(
  candidate: Course,
  registered: Course[]
): Course | null {
  for (const existing of registered) {
    if (existing.dayOfWeek !== candidate.dayOfWeek) continue;
    const overlaps =
      candidate.startPeriod <= existing.endPeriod &&
      candidate.endPeriod >= existing.startPeriod;
    if (overlaps) return existing;
  }
  return null;
}

export function registerCourse(courseId: string): { ok: boolean; conflict?: Course } {
  const s = stateStore.getState();
  const course = s.availableCourses.find(c => c.id === courseId);
  if (!course) return { ok: false };

  const registeredCourses = s.allCourses.filter(c =>
    s.registeredCourseIds.includes(c.id)
  );

  const conflicting = hasScheduleConflict(course, registeredCourses);
  if (conflicting) return { ok: false, conflict: conflicting };

  const newInvoice = {
    id: `inv-reg-${courseId}`,
    semesterId: course.semesterId,
    semesterName: 'HK1 2024-2025',
    title: `Học phí: ${course.name} (${course.credits} TC)`,
    amount: course.tuitionFee,
    dueDate: '2024-09-15',
    status: InvoiceStatus.Unpaid as const,
    paidAt: null,
    transactionRef: null,
  };

  stateStore.setState({
    registeredCourseIds: [...s.registeredCourseIds, courseId],
    allCourses: [...s.allCourses, course],
    invoices: [...s.invoices, newInvoice],
  });

  return { ok: true };
}

export function dropCourse(courseId: string): void {
  const s = stateStore.getState();
  stateStore.setState({
    registeredCourseIds: s.registeredCourseIds.filter(id => id !== courseId),
    allCourses: s.allCourses.filter(c => c.id !== courseId),
    invoices: s.invoices.filter(inv => inv.id !== `inv-reg-${courseId}`),
  });
}

export function payInvoice(invoiceId: string): void {
  const s = stateStore.getState();
  stateStore.setState({
    invoices: s.invoices.map(inv =>
      inv.id === invoiceId
        ? { ...inv, status: InvoiceStatus.Paid, paidAt: new Date().toISOString(), transactionRef: generateTransactionRef() }
        : inv
    ),
  });
}

export function getTotalDebt(): number {
  const s = stateStore.getState();
  return s.invoices
    .filter(inv => inv.status !== InvoiceStatus.Paid)
    .reduce((sum, inv) => sum + inv.amount, 0);
}
