import { type ViewModule, type AppState } from '../types/portal.types';
import { stateStore } from '../store/stateStore';
import { icons } from '../utils/svgIcons';
import { padZero } from '../utils/formatters';
import { getCumulativeGPA4, getCumulativeCredits } from '../actions/gradeActions';
import { animateCountUp, staggerEntrance } from '../utils/animationEngine';

export class DashboardView implements ViewModule {
  private container: HTMLElement | null = null;
  private unsub: (() => void) | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    this.render(stateStore.getState());
    this.unsub = stateStore.subscribe(s => this.render(s));
  }

  unmount(): void {
    this.unsub?.();
    this.unsub = null;
    this.container = null;
  }

  private render(s: AppState): void {
    if (!this.container) return;

    const gpa4 = getCumulativeGPA4(s.grades);
    const totalCredits = getCumulativeCredits(s.grades);

    const now = new Date();
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dateStr = `${dayNames[now.getDay()]}, ngày ${padZero(now.getDate())} tháng ${padZero(now.getMonth() + 1)} năm ${now.getFullYear()}`;

    this.container.innerHTML = `
      <div class="neo-card anim-fade-in-scale" style="margin-bottom:var(--space-2xl);background:linear-gradient(135deg, #0284C7 0%, #0369A1 100%);color:#FFFFFF;border:none;box-shadow:0 10px 25px -5px rgba(2,132,199,0.3)">
        <div class="flex items-center justify-between flex-wrap gap-md">
          <div>
            <div class="flex items-center gap-sm" style="margin-bottom:var(--space-xs)">
              <span class="neo-badge anim-breathe" style="background:rgba(255,255,255,0.2);color:#FFF;border:none">Tân sinh viên</span>
              <span style="opacity:0.8;font-size:12.5px">${dateStr}</span>
            </div>
            <h1 class="text-heading text-2xl text-bold" style="color:#FFF;letter-spacing:-0.5px">
              Xin chào, ${s.profile.fullName}!
            </h1>
            <p style="opacity:0.9;font-size:13.5px;margin-top:4px">
              Chào mừng bạn đến với Cổng thông tin học vụ Trường Đại học Công nghệ Sài Gòn (STU).
            </p>
          </div>
          <div class="flex items-center gap-sm">
            <span class="neo-badge" style="background:#FFFFFF;color:#0369A1;font-weight:700;border:none;padding:6px 14px">
              Niên khóa: ${s.profile.academicYear}
            </span>
          </div>
        </div>
      </div>

      <div class="kpi-grid" id="dashboard-kpi-grid">
        <div class="neo-card neo-card--interactive kpi-card" onclick="location.hash='#grades'">
          <div class="kpi-card__icon" style="background:var(--neo-lime-light);color:var(--neo-lime)">${icons.award(20)}</div>
          <div class="kpi-card__value" id="kpi-gpa-val">0.00</div>
          <div class="text-sm text-secondary">Chưa có điểm thi</div>
          <div class="kpi-card__label">GPA Tích lũy</div>
        </div>
        <div class="neo-card neo-card--interactive kpi-card" onclick="location.hash='#registration'">
          <div class="kpi-card__icon" style="background:var(--neo-primary-light);color:var(--neo-primary)">${icons.bookOpen(20)}</div>
          <div class="kpi-card__value">0 / 14</div>
          <div class="text-sm text-secondary">Kế hoạch HK1: 14 TC</div>
          <div class="kpi-card__label">Tín chỉ Tích lũy</div>
        </div>
        <div class="neo-card neo-card--interactive kpi-card" onclick="location.hash='#schedule'">
          <div class="kpi-card__icon" style="background:var(--neo-lavender-light);color:var(--neo-lavender)">${icons.calendar(20)}</div>
          <div class="kpi-card__value">0 môn</div>
          <div class="text-sm text-secondary">Khai giảng 14/09/2026</div>
          <div class="kpi-card__label">Lịch học Hôm nay</div>
        </div>
        <div class="neo-card neo-card--interactive kpi-card" onclick="location.hash='#finance'">
          <div class="kpi-card__icon" style="background:var(--neo-cyan-light);color:var(--neo-cyan)">${icons.creditCard(20)}</div>
          <div class="kpi-card__value">0 VNĐ</div>
          <div class="text-sm text-secondary">Đã thu 21.535.000 VNĐ</div>
          <div class="kpi-card__label">Học phí Còn nợ</div>
        </div>
      </div>

      <div class="grid grid-2 gap-xl" id="dashboard-info-grid" style="margin-bottom:var(--space-2xl)">
        <div class="neo-card anim-fade-in-up anim-delay-3">
          <h3 class="text-heading text-bold flex items-center gap-sm" style="margin-bottom:var(--space-lg);font-size:15px">
            ${icons.user(16, 'var(--neo-primary)')} Thông tin sinh viên
          </h3>
          <div class="profile-info-grid">
            <div class="profile-info-item"><span class="profile-info-item__label">Mã sinh viên</span><span class="profile-info-item__value text-mono text-bold">${s.profile.id}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Họ và tên</span><span class="profile-info-item__value text-bold">${s.profile.fullName}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Ngày sinh</span><span class="profile-info-item__value">${s.profile.dob}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Giới tính</span><span class="profile-info-item__value">${s.profile.gender}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Số CCCD</span><span class="profile-info-item__value text-mono">${s.profile.citizenId || '051208000136'}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Trạng thái</span><span class="profile-info-item__value"><span class="neo-badge neo-badge--lime">Đang học</span></span></div>
          </div>
        </div>

        <div class="neo-card anim-fade-in-up anim-delay-4">
          <h3 class="text-heading text-bold flex items-center gap-sm" style="margin-bottom:var(--space-lg);font-size:15px">
            ${icons.graduationCap(16, 'var(--neo-primary)')} Thông tin đào tạo
          </h3>
          <div class="profile-info-grid">
            <div class="profile-info-item"><span class="profile-info-item__label">Lớp sinh hoạt</span><span class="profile-info-item__value text-mono text-bold">${s.profile.classCode}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Ngành học</span><span class="profile-info-item__value text-bold">${s.profile.major}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Khoa chuyên môn</span><span class="profile-info-item__value">${s.profile.faculty}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Bậc đào tạo</span><span class="profile-info-item__value">${s.profile.degreeLevel || 'Đại học chính quy'}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Khóa học</span><span class="profile-info-item__value text-mono">${s.profile.academicYear}</span></div>
            <div class="profile-info-item"><span class="profile-info-item__label">Email sinh viên</span><span class="profile-info-item__value text-mono text-sm">${s.profile.email}</span></div>
          </div>
        </div>
      </div>

      <div class="grid grid-2 gap-xl" id="dashboard-widgets-grid">
        <div class="neo-card anim-fade-in-up anim-delay-5">
          <h3 class="text-heading text-bold flex items-center gap-sm" style="margin-bottom:var(--space-md);font-size:15px">
            ${icons.bell(16, 'var(--neo-primary)')} Thông báo nhập học
          </h3>
          <div class="flex flex-col gap-md">
            ${s.notifications.map(n => `
              <div style="padding:var(--space-sm) 0;border-bottom:1px solid var(--neo-bg-secondary)">
                <div class="text-bold text-sm" style="color:var(--neo-text)">${n.title}</div>
                <div class="text-secondary text-sm" style="margin-top:2px;line-height:1.4">${n.message}</div>
                <div class="text-xs text-secondary" style="margin-top:4px;opacity:0.7">${n.date}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="neo-card anim-fade-in-up anim-delay-6">
          <h3 class="text-heading text-bold flex items-center gap-sm" style="margin-bottom:var(--space-md);font-size:15px">
            ${icons.check(16, 'var(--neo-lime)')} Việc cần làm
          </h3>
          <div class="flex flex-col gap-sm">
            ${s.todos.map(todo => `
              <label class="neo-checkbox ${todo.completed ? 'neo-checkbox--checked' : ''}">
                <div class="neo-checkbox__box">${todo.completed ? icons.check(12) : ''}</div>
                <span class="neo-checkbox__label">${todo.title}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    staggerEntrance(this.container.querySelector('#dashboard-kpi-grid'), '.kpi-card', 'anim-fade-in-up', 60, 40);

    const gpaEl = this.container.querySelector('#kpi-gpa-val') as HTMLElement;
    if (gpaEl && gpa4 > 0) {
      animateCountUp(gpaEl, 0, gpa4, 700, val => val.toFixed(2));
    } else if (gpaEl) {
      gpaEl.textContent = '0.00';
    }
  }
}
