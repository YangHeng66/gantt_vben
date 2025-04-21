/**
 * 甘特图组件类型声明
 */

declare module '/@/components/GanttChart' {
  import { GanttTaskItem, GanttProps, GanttInstance } from '../components/GanttChart/src/types';
  import { DefineComponent } from 'vue';

  const GanttChart: DefineComponent<GanttProps>;

  export { GanttTaskItem, GanttProps, GanttInstance };
  export default GanttChart;
}

declare module '/@/components/GanttChart/src/types' {
  export interface GanttTaskItem {
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

  export interface GanttProps {
    // 数据源
    data: GanttTaskItem[];
    // 数据中唯一标识的键名
    dataId?: string;
    // 开始日期的键名
    startKey?: string;
    // 结束日期的键名
    endKey?: string;
    // 是否默认展开所有节点
    expandAll?: boolean;
    // 是否显示展开/折叠控件
    showExpand?: boolean;
    // 是否可拖动调整任务时间
    dragable?: boolean;
    // 视图类型: 日视图、周视图、月视图等
    viewMode?: 'day' | 'week' | 'month';
    // 甘特图单元格宽度
    cellWidth?: number;
    // 甘特图单元格高度
    cellHeight?: number;
    // 当前日期线
    showTodayLine?: boolean;
    // 周末特殊显示
    highlightWeekends?: boolean;
    // 表头高度
    headerHeight?: number;
    // 左侧任务列表宽度
    taskListWidth?: number;
    // 自定义格式化日期函数
    dateFormatter?: (date: Date) => string;
  }

  export interface GanttInstance {
    // 更新甘特图数据
    updateData: (data: GanttTaskItem[]) => void;
    // 滚动到指定任务
    scrollToTask: (taskId: string | number) => void;
    // 展开所有任务
    expandAll: () => void;
    // 折叠所有任务
    collapseAll: () => void;
    // 根据条件过滤任务
    filterTasks: (filterFn: (task: GanttTaskItem) => boolean) => void;
    // 设置日期范围
    setDateRange: (startDate: Date, endDate: Date) => void;
    // 切换视图模式
    setViewMode: (mode: 'day' | 'week' | 'month') => void;
  }
}
