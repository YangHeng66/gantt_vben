<!--
 * @Author: 甘特图组件
 * @Description: 基于Vue3的甘特图实现
-->
<template>
  <div 
    class="gantt-chart-container"
    :class="{ 
      'gantt-view-day': props.viewMode === 'day', 
      'gantt-view-week': props.viewMode === 'week', 
      'gantt-view-month': props.viewMode === 'month'
    }"
  >
    <div class="gantt-side" :style="{ width: `${props.taskListWidth}px` }">
      <!-- 左上角表头占位 -->
      <div class="gantt-side-header" :style="{ height: `${props.headerHeight}px` }">
        <slot name="header-left">
          <div class="gantt-header-title">任务名称</div>
        </slot>
      </div>
      
      <!-- 左侧任务列表 -->
      <div class="gantt-side-content" ref="taskListRef">
        <slot name="task-list">
          <gantt-task-list 
            :tasks="flattenedTasks" 
            :indent-width="20"
            @toggle-expand="handleToggleExpand"
          />
        </slot>
      </div>
    </div>
    
    <div class="gantt-content">
      <!-- 时间轴表头 -->
      <div class="gantt-timeline-header" :style="{ height: `${props.headerHeight}px` }" ref="timelineHeaderRef">
        <slot name="timeline-header">
          <gantt-timeline-header 
            :start-date="ganttStartDate" 
            :end-date="ganttEndDate"
            :view-mode="props.viewMode"
            :cell-width="props.cellWidth"
          />
        </slot>
      </div>
      
      <!-- 甘特图主体内容 -->
      <div class="gantt-timeline-content" ref="timelineContentRef" @scroll="handleContentScroll">
        <slot name="timeline-grid">
          <gantt-timeline-grid 
            :dates="timelineDates" 
            :cell-width="props.cellWidth"
            :cell-height="props.cellHeight"
            :highlight-weekends="props.highlightWeekends"
            :show-today-line="props.showTodayLine"
          />
        </slot>
        
        <slot name="timeline-bars">
          <gantt-bars 
            :tasks="flattenedTasks" 
            :start-date="ganttStartDate" 
            :cell-width="props.cellWidth"
            :cell-height="props.cellHeight"
            :draggable="props.dragable"
            @task-click="handleTaskClick"
            @task-dblclick="handleTaskDblClick"
            @task-drag="handleTaskDrag"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick, defineProps, defineEmits } from 'vue';
import { GanttProps, GanttTaskItem, GanttInstance } from './types';
import { 
  getDatesBetween, 
  calculateDateRange, 
  flattenTasks,
  findTaskById,
  normalizeDate
} from './utils';

// 导入子组件
import GanttTaskList from './components/GanttTaskList.vue';
import GanttTimelineHeader from './components/GanttTimelineHeader.vue';
import GanttTimelineGrid from './components/GanttTimelineGrid.vue';
import GanttBars from './components/GanttBars.vue';

// 定义组件属性
const props = withDefaults(defineProps<GanttProps>(), {
  dataId: 'id',
  startKey: 'startDate',
  endKey: 'endDate',
  expandAll: true,
  showExpand: true,
  dragable: true,
  viewMode: 'day',
  cellWidth: 40,
  cellHeight: 40,
  showTodayLine: true,
  highlightWeekends: true,
  headerHeight: 60,
  taskListWidth: 300,
});

// 定义事件
const emit = defineEmits<{
  // 任务点击事件
  (e: 'task-click', task: GanttTaskItem): void;
  // 任务双击事件
  (e: 'task-dblclick', task: GanttTaskItem): void;
  // 任务拖拽事件
  (e: 'task-drag', task: GanttTaskItem, 
     newStartDate: Date, newEndDate: Date): void;
  // 任务展开/折叠事件
  (e: 'task-expand', task: GanttTaskItem, expanded: boolean): void;
  // 视图日期范围变化事件
  (e: 'date-range-change', startDate: Date, endDate: Date): void;
}>();

// DOM引用
const taskListRef = ref<HTMLElement | null>(null);
const timelineHeaderRef = ref<HTMLElement | null>(null);
const timelineContentRef = ref<HTMLElement | null>(null);

// 内部数据
const internalData = ref<GanttTaskItem[]>([]);
const ganttStartDate = ref<Date>(new Date());
const ganttEndDate = ref<Date>(new Date());

// 扁平化任务列表（用于渲染）
const flattenedTasks = computed(() => flattenTasks(internalData.value));

// 时间轴上的所有日期
const timelineDates = computed(() => 
  getDatesBetween(ganttStartDate.value, ganttEndDate.value)
);

// 初始化数据和日期范围
const initializeData = () => {
  // 深拷贝数据，避免直接修改原始数据
  const clonedData = JSON.parse(JSON.stringify(props.data));
  
  // 如果需要默认展开所有节点
  if (props.expandAll) {
    const expandAllNodes = (tasks: GanttTaskItem[]) => {
      tasks.forEach(task => {
        task.expanded = true;
        if (task.children && task.children.length > 0) {
          expandAllNodes(task.children);
        }
      });
    };
    expandAllNodes(clonedData);
  }
  
  internalData.value = clonedData;
  
  // 计算日期范围
  const { startDate, endDate } = calculateDateRange(clonedData);
  ganttStartDate.value = startDate;
  ganttEndDate.value = endDate;
  
  // 触发日期范围变化事件
  emit('date-range-change', startDate, endDate);
};

// 处理内容滚动同步
const handleContentScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  if (timelineHeaderRef.value) {
    timelineHeaderRef.value.scrollLeft = target.scrollLeft;
  }
  if (taskListRef.value) {
    taskListRef.value.scrollTop = target.scrollTop;
  }
};

// 处理任务展开/折叠
const handleToggleExpand = (task: GanttTaskItem) => {
  const originalTask = findTaskById(internalData.value, task.id);
  if (originalTask) {
    originalTask.expanded = !originalTask.expanded;
    emit('task-expand', originalTask, !!originalTask.expanded);
  }
};

// 处理任务点击
const handleTaskClick = (task: GanttTaskItem) => {
  emit('task-click', task);
};

// 处理任务双击
const handleTaskDblClick = (task: GanttTaskItem) => {
  emit('task-dblclick', task);
};

// 处理任务拖拽
const handleTaskDrag = (task: GanttTaskItem, newStartDate: Date, newEndDate: Date) => {
  // 查找并更新原始任务数据中的日期
  const originalTask = findTaskById(internalData.value, task.id);
  if (originalTask) {
    originalTask.startDate = newStartDate;
    originalTask.endDate = newEndDate;
    emit('task-drag', originalTask, newStartDate, newEndDate);
  }
};

// 更新甘特图数据
const updateData = (data: GanttTaskItem[]) => {
  props.data.length = 0;
  props.data.push(...data);
  initializeData();
};

// 滚动到指定任务
const scrollToTask = (taskId: string | number) => {
  nextTick(() => {
    const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskEl && timelineContentRef.value) {
      taskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};

// 展开所有任务
const expandAll = () => {
  const expandAllNodes = (tasks: GanttTaskItem[]) => {
    tasks.forEach(task => {
      task.expanded = true;
      if (task.children && task.children.length > 0) {
        expandAllNodes(task.children);
      }
    });
  };
  expandAllNodes(internalData.value);
};

// 折叠所有任务
const collapseAll = () => {
  const collapseAllNodes = (tasks: GanttTaskItem[]) => {
    tasks.forEach(task => {
      task.expanded = false;
      if (task.children && task.children.length > 0) {
        collapseAllNodes(task.children);
      }
    });
  };
  collapseAllNodes(internalData.value);
};

// 根据条件过滤任务
const filterTasks = (filterFn: (task: GanttTaskItem) => boolean) => {
  // 此处实现任务过滤逻辑
  console.log('过滤任务', filterFn);
};

// 设置日期范围
const setDateRange = (startDate: Date, endDate: Date) => {
  ganttStartDate.value = normalizeDate(startDate);
  ganttEndDate.value = normalizeDate(endDate);
  emit('date-range-change', ganttStartDate.value, ganttEndDate.value);
};

// 切换视图模式
const setViewMode = (mode: 'day' | 'week' | 'month') => {
  // 此处实现视图模式切换逻辑
  console.log('切换视图模式', mode);
};

// 监听数据变化
watch(() => props.data, () => {
  initializeData();
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
  initializeData();
});

// 对外暴露方法
defineExpose<GanttInstance>({
  updateData,
  scrollToTask,
  expandAll,
  collapseAll,
  filterTasks,
  setDateRange,
  setViewMode,
});
</script>

<style lang="less" scoped>
.gantt-chart-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  
  .gantt-side {
    flex-shrink: 0;
    border-right: 1px solid #e0e0e0;
    background-color: #f9f9f9;
    
    .gantt-side-header {
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f5f5f5;
      font-weight: 500;
      
      .gantt-header-title {
        font-weight: bold;
      }
    }
    
    .gantt-side-content {
      height: calc(100% - 60px); // 减去表头高度
      overflow: hidden auto;
    }
  }
  
  .gantt-content {
    flex: 1;
    overflow: hidden;
    
    .gantt-timeline-header {
      overflow: hidden;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .gantt-timeline-content {
      position: relative;
      height: calc(100% - 60px); // 减去表头高度
      overflow: auto;
      
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: #c1c1c1;
      }
      
      &::-webkit-scrollbar-track {
        background-color: #f1f1f1;
      }
    }
  }
}

// 不同视图模式下的样式调整
.gantt-view-day {
  .gantt-cell {
    min-width: 40px;
  }
}

.gantt-view-week {
  .gantt-cell {
    min-width: 100px;
  }
}

.gantt-view-month {
  .gantt-cell {
    min-width: 200px;
  }
}
</style> 