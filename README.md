<div align="center">
  <h1>Vue3 甘特图组件</h1>
  <p>基于Vue3的可交互甘特图组件，支持任务拖拽、展开/折叠、里程碑等丰富功能</p>
</div>

![甘特图预览](./public/gaqntetu.png.png)

## 项目介绍

这是一个基于VbenAdmin开发的甘特图组件，提供了项目计划和任务进度的可视化管理。拥有多种视图模式（日、周、月）、支持任务拖拽调整、里程碑标记、进度展示等功能，界面美观，交互友好。

## 功能特性

- ✨ **树形结构展示**: 支持任务多级嵌套，父子关系清晰
- 🔄 **多视图模式**: 支持日视图、周视图、月视图切换
- 📏 **时间线**: 显示日期表头、当前日期线、周末高亮
- 🖱️ **拖拽交互**: 支持拖拽调整任务日期和持续时间
- 🔍 **展开/折叠**: 支持任务树的展开和折叠
- 🏆 **里程碑**: 特殊标记里程碑节点
- 📊 **进度条**: 直观显示任务完成进度
- 🎨 **自定义样式**: 支持自定义颜色和样式
- 🌈 **响应式设计**: 适应不同屏幕尺寸

## 安装使用

### 在项目中使用

该甘特图组件是在本项目中直接开发的，无需单独安装。您可以直接导入组件并使用：

```vue
<template>
  <gantt-chart
    :data="taskList"
    data-id="id"
    :viewMode="viewMode"
    :cell-width="40"
    :cell-height="40"
    @task-click="handleTaskClick"
  />
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import GanttChart from '/@/components/GanttChart';
  import { GanttTaskItem } from '/@/components/GanttChart/src/types';

  // 视图模式
  const viewMode = ref<'day' | 'week' | 'month'>('day');

  // 任务数据
  const taskList = reactive<GanttTaskItem[]>([
    {
      id: 1,
      title: '项目初始化',
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: 'project',
      progress: 30,
      expanded: true,
      children: [
        {
          id: 2,
          title: '需求分析',
          startDate: new Date(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          progress: 60,
          type: 'task',
          children: [],
        },
        {
          id: 3,
          title: '项目立项',
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          type: 'milestone',
          progress: 0,
          children: [],
        },
      ],
    },
  ]);

  // 处理任务点击
  const handleTaskClick = (task: GanttTaskItem) => {
    console.log('任务点击:', task);
  };
</script>
```

如果使用相对路径导入：

```js
import GanttChart from '@/components/GanttChart';
// 或者
import GanttChart from '../components/GanttChart';
```

### 在其他项目中使用

如果想在其他项目中使用此组件，您可以：

1. 将整个 `src/components/GanttChart` 目录复制到您的项目中
2. 导入并使用组件

## 组件属性

| 属性名            | 类型                       | 默认值      | 说明                   |
| ----------------- | -------------------------- | ----------- | ---------------------- |
| data              | GanttTaskItem[]            | []          | 任务数据               |
| dataId            | string                     | 'id'        | 数据唯一标识字段名     |
| startKey          | string                     | 'startDate' | 开始日期字段名         |
| endKey            | string                     | 'endDate'   | 结束日期字段名         |
| expandAll         | boolean                    | true        | 是否默认展开所有节点   |
| showExpand        | boolean                    | true        | 是否显示展开/折叠控件  |
| dragable          | boolean                    | true        | 是否可拖动调整任务时间 |
| viewMode          | 'day' \| 'week' \| 'month' | 'day'       | 视图模式               |
| cellWidth         | number                     | 40          | 单元格宽度             |
| cellHeight        | number                     | 40          | 单元格高度             |
| showTodayLine     | boolean                    | true        | 是否显示当前日期线     |
| highlightWeekends | boolean                    | true        | 是否高亮周末           |
| headerHeight      | number                     | 60          | 表头高度               |
| taskListWidth     | number                     | 300         | 左侧任务列表宽度       |

## 组件事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| task-click | (task: GanttTaskItem) | 任务点击事件 |
| task-dblclick | (task: GanttTaskItem) | 任务双击事件 |
| task-drag | (task: GanttTaskItem, newStartDate: Date, newEndDate: Date) | 任务拖拽事件 |
| task-expand | (task: GanttTaskItem, expanded: boolean) | 任务展开/折叠事件 |
| date-range-change | (startDate: Date, endDate: Date) | 日期范围变化事件 |

## 暴露方法

| 方法名       | 参数                                         | 返回值 | 说明             |
| ------------ | -------------------------------------------- | ------ | ---------------- |
| updateData   | (data: GanttTaskItem[])                      | void   | 更新甘特图数据   |
| scrollToTask | (taskId: string \| number)                   | void   | 滚动到指定任务   |
| expandAll    | ()                                           | void   | 展开所有任务     |
| collapseAll  | ()                                           | void   | 折叠所有任务     |
| filterTasks  | (filterFn: (task: GanttTaskItem) => boolean) | void   | 根据条件过滤任务 |
| setDateRange | (startDate: Date, endDate: Date)             | void   | 设置日期范围     |
| setViewMode  | (mode: 'day' \| 'week' \| 'month')           | void   | 切换视图模式     |

## 数据类型

```typescript
// 甘特图任务项接口
interface GanttTaskItem {
  // 唯一标识
  id: string | number;
  // 任务标题
  title: string;
  // 开始日期 (YYYY-MM-DD 格式或 Date 对象)
  startDate: string | Date;
  // 结束日期 (YYYY-MM-DD 格式或 Date 对象)
  endDate: string | Date;
  // 进度 (0-100)
  progress?: number;
  // 颜色标记
  color?: string;
  // 子任务
  children?: GanttTaskItem[];
  // 任务类型 (里程碑、普通任务等)
  type?: 'task' | 'milestone' | 'project';
  // 可展开状态
  expanded?: boolean;
  // 自定义数据
  [key: string]: any;
}
```

## 开发相关

### 技术栈

- Vue 3
- TypeScript
- Vite
- Less

### 项目结构

```
src/components/GanttChart/
├── index.ts                 # 组件入口
└── src/
    ├── GanttChart.vue       # 主组件
    ├── types.ts             # 类型定义
    ├── utils.ts             # 工具函数
    └── components/          # 子组件
        ├── GanttBars.vue    # 任务条组件
        ├── GanttTaskList.vue # 任务列表组件
        ├── GanttTimelineGrid.vue # 时间线网格组件
        └── GanttTimelineHeader.vue # 时间线表头组件
```

## 浏览器支持

支持所有现代浏览器，不支持 IE。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| --- | --- | --- | --- |
| 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 | 最近 2 个版本 |

## 许可证

[MIT](./LICENSE)
