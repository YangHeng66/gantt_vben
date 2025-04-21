<!--
 * @Description: 甘特图任务条组件
 * @Author: 甘特图组件
-->
<template>
  <div class="gantt-bars">
    <div
      v-for="(task, index) in tasks"
      :key="task.id"
      class="gantt-bar-row"
      :style="{ height: `${cellHeight}px` }"
    >
      <!-- 任务条 -->
      <div
        v-if="isValidTask(task)"
        :data-task-id="task.id"
        class="gantt-bar"
        :class="{
          'gantt-bar-milestone': task.type === 'milestone',
          'gantt-bar-project': task.type === 'project',
          'gantt-bar-draggable': draggable,
        }"
        :style="getTaskStyle(task)"
        @click="handleTaskClick(task)"
        @dblclick="handleTaskDblClick(task)"
        @mousedown="draggable && handleMouseDown($event, task)"
      >
        <!-- 里程碑形状 -->
        <template v-if="task.type === 'milestone'">
          <div class="gantt-milestone-diamond"></div>
        </template>

        <!-- 普通任务条 -->
        <template v-else>
          <!-- 任务标题 -->
          <div class="gantt-bar-label" :title="task.title">{{ task.title }}</div>

          <!-- 进度条 -->
          <div
            v-if="task.progress !== undefined"
            class="gantt-bar-progress"
            :style="{ width: `${task.progress || 0}%` }"
          ></div>

          <!-- 拖拽手柄 -->
          <div v-if="draggable" class="gantt-bar-handle gantt-bar-handle-left"></div>
          <div v-if="draggable" class="gantt-bar-handle gantt-bar-handle-right"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, defineEmits, computed } from 'vue';
  import { GanttTaskItem } from '../types';
  import { normalizeDate, calculateTaskPosition } from '../utils';

  // 定义组件属性
  const props = withDefaults(
    defineProps<{
      tasks: GanttTaskItem[]; // 任务列表
      startDate: Date; // 甘特图开始日期
      cellWidth: number; // 单元格宽度
      cellHeight: number; // 单元格高度
      draggable?: boolean; // 是否可拖拽
    }>(),
    {
      cellWidth: 40,
      cellHeight: 40,
      draggable: true,
    },
  );

  // 定义事件
  const emit = defineEmits<{
    (e: 'task-click', task: GanttTaskItem): void;
    (e: 'task-dblclick', task: GanttTaskItem): void;
    (e: 'task-drag', task: GanttTaskItem, newStartDate: Date, newEndDate: Date): void;
  }>();

  // 检查任务的日期是否有效
  const isValidTask = (task: GanttTaskItem): boolean => {
    return !!(task.startDate && task.endDate);
  };

  // 获取任务条样式
  const getTaskStyle = (task: GanttTaskItem) => {
    // 计算任务位置和宽度
    const { left, width } = calculateTaskPosition(task, props.startDate, props.cellWidth);

    // 设置任务颜色
    const backgroundColor =
      task.color ||
      (task.type === 'milestone' ? '#f5222d' : task.type === 'project' ? '#1890ff' : '#52c41a');

    // 里程碑特殊处理
    if (task.type === 'milestone') {
      return {
        left: `${left - 5}px`,
        backgroundColor,
      };
    }

    return {
      left: `${left}px`,
      width: `${width}px`,
      backgroundColor,
    };
  };

  // 任务点击事件
  const handleTaskClick = (task: GanttTaskItem) => {
    emit('task-click', task);
  };

  // 任务双击事件
  const handleTaskDblClick = (task: GanttTaskItem) => {
    emit('task-dblclick', task);
  };

  // 拖拽相关变量
  let isDragging = false;
  let dragStartX = 0;
  let originalLeft = 0;
  let originalWidth = 0;
  let dragType = ''; // 'move', 'left', 'right'
  let currentTask: GanttTaskItem | null = null;

  // 处理鼠标按下事件
  const handleMouseDown = (e: MouseEvent, task: GanttTaskItem) => {
    e.preventDefault();

    // 判断拖拽类型
    const target = e.target as HTMLElement;
    if (target.classList.contains('gantt-bar-handle-left')) {
      dragType = 'left';
    } else if (target.classList.contains('gantt-bar-handle-right')) {
      dragType = 'right';
    } else {
      dragType = 'move';
    }

    isDragging = true;
    currentTask = task;
    dragStartX = e.clientX;

    // 获取任务条位置信息
    const taskEl = e.currentTarget as HTMLElement;
    const rect = taskEl.getBoundingClientRect();
    originalLeft = rect.left;
    originalWidth = rect.width;

    // 添加全局鼠标事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !currentTask) return;

    const deltaX = e.clientX - dragStartX;
    let newLeft = originalLeft;
    let newWidth = originalWidth;

    // 根据拖拽类型处理位置变化
    if (dragType === 'move') {
      newLeft += deltaX;
    } else if (dragType === 'left') {
      newLeft += deltaX;
      newWidth -= deltaX;
    } else if (dragType === 'right') {
      newWidth += deltaX;
    }

    // 计算新的开始和结束日期
    const leftDays = Math.round((newLeft - originalLeft) / props.cellWidth);
    const widthDays = Math.round((newWidth - originalWidth) / props.cellWidth);

    const originalStart = normalizeDate(currentTask.startDate);
    const originalEnd = normalizeDate(currentTask.endDate);

    let newStartDate = new Date(originalStart);
    let newEndDate = new Date(originalEnd);

    if (dragType === 'move') {
      newStartDate.setDate(originalStart.getDate() + leftDays);
      newEndDate.setDate(originalEnd.getDate() + leftDays);
    } else if (dragType === 'left') {
      newStartDate.setDate(originalStart.getDate() + leftDays);
    } else if (dragType === 'right') {
      newEndDate.setDate(originalEnd.getDate() + widthDays);
    }

    // 更新任务日期
    currentTask.startDate = newStartDate;
    currentTask.endDate = newEndDate;
  };

  // 处理鼠标释放事件
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !currentTask) return;

    // 触发拖拽结束事件
    emit(
      'task-drag',
      currentTask,
      normalizeDate(currentTask.startDate),
      normalizeDate(currentTask.endDate),
    );

    // 清理拖拽状态
    isDragging = false;
    currentTask = null;

    // 移除全局鼠标事件
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
</script>

<style lang="less" scoped>
  .gantt-bars {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .gantt-bar-row {
      position: relative;
      width: 100%;

      .gantt-bar {
        position: absolute;
        z-index: 10;
        top: 25%;
        height: 50%;
        border-radius: 3px;
        box-shadow: 0 1px 3px rgb(0 0 0 / 10%);
        cursor: pointer;
        pointer-events: all;

        &:hover {
          z-index: 100;
          box-shadow: 0 2px 5px rgb(0 0 0 / 20%);
        }

        .gantt-bar-label {
          display: flex;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 8px;
          align-items: center;
          max-width: calc(100% - 16px);
          overflow: hidden;
          color: white;
          font-size: 12px;
          text-overflow: ellipsis;
          text-shadow: 0 1px 1px rgb(0 0 0 / 20%);
          white-space: nowrap;
        }

        .gantt-bar-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 3px 0 0 3px;
          background-color: rgb(0 0 0 / 20%);
          pointer-events: none;
        }

        .gantt-bar-handle {
          position: absolute;
          z-index: 110;
          top: 0;
          width: 6px;
          height: 100%;
          cursor: ew-resize;

          &.gantt-bar-handle-left {
            left: 0;
          }

          &.gantt-bar-handle-right {
            right: 0;
          }
        }
      }

      .gantt-bar-milestone {
        top: calc(50% - 5px);
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        border-radius: 0;

        .gantt-milestone-diamond {
          width: 100%;
          height: 100%;
          transform: rotate(0deg);
          background-color: inherit;
        }
      }

      .gantt-bar-project {
        top: calc(50% - 7px);
        height: 14px;
        background-color: #1890ff;

        .gantt-bar-label {
          font-weight: 500;
        }
      }
    }
  }
</style>
