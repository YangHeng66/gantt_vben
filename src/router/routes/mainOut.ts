/*
 * @Author: YangHeng66 yangheng66@gmail.com
 * @Date: 2025-04-21 13:42:03
 * @LastEditors: YangHeng66 yangheng66@gmail.com
 * @LastEditTime: 2025-04-21 18:09:55
 * @FilePath: \vue3-gantt\src\router\routes\mainOut.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
The routing of this file will not show the layout.
It is an independent new page.
the contents of the file still need to log in to access
 */
import type { AppRouteModule } from '@/router/types';

// test
// http:ip:port/main-out
export const mainOutRoutes: AppRouteModule[] = [
  {
    path: '/main-out',
    name: 'MainOut',
    component: () => import('@/views/new-gantt/index.vue'),
    meta: {
      title: 'MainOut',
      ignoreAuth: true,
    },
  },
];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
