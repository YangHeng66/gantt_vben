import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const dashboard: AppRouteModule = {
  path: '/dashboard',
  name: 'Dashboard',
  component: LAYOUT,
  redirect: '/dashboard/new-gantt',
  meta: {
    orderNo: 10,
    icon: 'ion:grid-outline',
    title: t('routes.dashboard.dashboard'),
  },
  children: [
    {
      path: 'new-gantt',
      name: 'NewGantt',
      component: () => import('@/views/new-gantt/index.vue'),
      meta: {
        title: t('routes.dashboard.newGantt'),
      },
    },
  ],
};

export default dashboard;
