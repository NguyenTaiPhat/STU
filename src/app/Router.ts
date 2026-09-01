import { TabId, type ViewModule } from '../types/portal.types';
import { stateStore } from '../store/stateStore';

type ViewFactory = () => ViewModule;
type ViewMap = Record<TabId, ViewFactory>;

let currentView: ViewModule | null = null;
let mainContainer: HTMLElement | null = null;
let viewMap: ViewMap | null = null;

const HASH_TO_TAB: Record<string, TabId> = {
  '#dashboard': TabId.Dashboard,
  '#home': TabId.Dashboard,
  '#notifications': TabId.Notifications,
  '#xemthongbao': TabId.Notifications,
  '#curriculum': TabId.Curriculum,
  '#ctdt': TabId.Curriculum,
  '#registration': TabId.Registration,
  '#dangkymonhoc': TabId.Registration,
  '#finance': TabId.Finance,
  '#hocphi': TabId.Finance,
  '#hoadondientu': TabId.Finance,
  '#schedule': TabId.Schedule,
  '#tkb-tuan': TabId.Schedule,
  '#tkb-hocky': TabId.Schedule,
  '#exam_schedule': TabId.ExamSchedule,
  '#lich-thi': TabId.ExamSchedule,
  '#grades': TabId.Grades,
  '#diem': TabId.Grades,
  '#services': TabId.Services,
  '#dich-vu': TabId.Services,
  '#profile': TabId.Profile,
  '#capnhatlylich': TabId.Profile,
  '#feedback': TabId.Notifications,
};

function getTabFromHash(): TabId {
  return HASH_TO_TAB[location.hash] ?? TabId.Dashboard;
}

function navigateTo(tab: TabId): void {
  if (!mainContainer || !viewMap) return;

  if (currentView) {
    currentView.unmount();
    currentView = null;
  }

  mainContainer.innerHTML = '';
  mainContainer.classList.remove('view-transition-enter');
  void mainContainer.offsetWidth; // Trigger reflow để kích hoạt lại animation
  mainContainer.classList.add('view-transition-enter');

  stateStore.setState({ currentTab: tab });

  const factory = viewMap[tab];
  if (factory) {
    currentView = factory();
    currentView.mount(mainContainer);
  }
}

function onHashChange(): void {
  const tab = getTabFromHash();
  navigateTo(tab);
}

export function initRouter(
  container: HTMLElement,
  views: ViewMap
): void {
  mainContainer = container;
  viewMap = views;

  window.addEventListener('hashchange', onHashChange);

  if (!location.hash) {
    location.hash = '#dashboard';
  } else {
    onHashChange();
  }
}

export function destroyRouter(): void {
  window.removeEventListener('hashchange', onHashChange);
  if (currentView) {
    currentView.unmount();
    currentView = null;
  }
  mainContainer = null;
  viewMap = null;
}
