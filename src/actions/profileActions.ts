import { stateStore } from '../store/stateStore';

export function updateContactInfo(email: string, phone: string): { ok: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^0\d{9}$/;

  if (!emailRegex.test(email)) return { ok: false, error: 'Email không hợp lệ' };
  if (phone.trim() !== '' && !phoneRegex.test(phone.trim())) {
    return { ok: false, error: 'Số điện thoại phải có 10 chữ số, bắt đầu bằng 0' };
  }

  const s = stateStore.getState();
  stateStore.setState({
    profile: { ...s.profile, email: email.trim(), phone: phone.trim() },
  });
  return { ok: true };
}

export function exportStateAsJSON(): void {
  const data = JSON.stringify(stateStore.getState(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stu_amis_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
