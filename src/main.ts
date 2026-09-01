import './styles/tokens.css';
import './styles/neobrutalism.css';
import './styles/animations.css';
import './styles/app.css';

import { TabId } from './types/portal.types';
import { stateStore } from './store/stateStore';
import { renderHeader } from './components/Header';
import { renderSidebar, toggleSidebar } from './components/Sidebar';
import { initRouter } from './app/Router';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ScheduleView } from './views/ScheduleView';
import { GradesView } from './views/GradesView';
import { RegistrationView } from './views/RegistrationView';
import { FinanceView } from './views/FinanceView';
import { ProfileView } from './views/ProfileView';
import { NotificationsView } from './views/NotificationsView';
import { CurriculumView } from './views/CurriculumView';
import { ExamScheduleView } from './views/ExamScheduleView';
import { ServicesView } from './views/ServicesView';
import { fetchAndApplyLiveSTUData, startAutoSyncPolling, stopAutoSyncPolling } from './services/stuLiveService';

// Hủy đăng ký toàn bộ Service Worker cũ trên localhost:3000
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

let currentAuthStatus: boolean | null = null;
let activeLoginView: LoginView | null = null;

function renderAppShell(app: HTMLElement): void {
  app.innerHTML = '';
  app.className = 'app';

  const sidebar = renderSidebar();
  const header = renderHeader(() => toggleSidebar());

  const main = document.createElement('main');
  main.className = 'app__main';

  app.append(sidebar, header, main);

  initRouter(main, {
    [TabId.Dashboard]: () => new DashboardView(),
    [TabId.Notifications]: () => new NotificationsView(),
    [TabId.Curriculum]: () => new CurriculumView(),
    [TabId.Schedule]: () => new ScheduleView(),
    [TabId.ExamSchedule]: () => new ExamScheduleView(),
    [TabId.Grades]: () => new GradesView(),
    [TabId.Registration]: () => new RegistrationView(),
    [TabId.Finance]: () => new FinanceView(),
    [TabId.Services]: () => new ServicesView(),
    [TabId.Profile]: () => new ProfileView(),
    [TabId.Feedback]: () => new NotificationsView(),
  });

  const authUser = localStorage.getItem('stu_amis_auth_user');
  if (authUser) {
    fetchAndApplyLiveSTUData(authUser).catch(() => {});
  }
}

function renderLoginScreen(app: HTMLElement): void {
  app.innerHTML = '';
  app.className = 'login-screen';

  activeLoginView = new LoginView();
  activeLoginView.mount(app);
}

function bootstrap(): void {
  stateStore.loadFromStorage();
  const state = stateStore.getState();
  document.documentElement.dataset.theme = state.theme;

  const app = document.getElementById('app');
  if (!app) return;

  const updateViewForAuth = (isAuth: boolean) => {
    if (currentAuthStatus === isAuth) return;
    currentAuthStatus = isAuth;

    if (isAuth) {
      if (activeLoginView) {
        activeLoginView.unmount();
        activeLoginView = null;
      }
      renderAppShell(app);
      startAutoSyncPolling(15);
    } else {
      stopAutoSyncPolling();
      renderLoginScreen(app);
    }
  };

  updateViewForAuth(state.isAuthenticated);

  stateStore.subscribe(s => {
    document.documentElement.dataset.theme = s.theme;
    updateViewForAuth(s.isAuthenticated);
  });
}

bootstrap();
