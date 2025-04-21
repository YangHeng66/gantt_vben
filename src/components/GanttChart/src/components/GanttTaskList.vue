<!--
 * @Description: 甘特图任务列表组件
 * @Author: 甘特图组件
-->
<template>
  <div class="gantt-task-list">
    <div
      v-for="(task, index) in tasks"
      :key="task.id"
      class="gantt-task-item"
      :class="{ 
        'gantt-task-milestone': task.type === 'milestone',
        'gantt-task-project': task.type === 'project' 
      }"
      :style="{ height: `${rowHeight}px` }"
      :data-task-id="task.id"
    >
      <div 
        class="gantt-task-content" 
        :style="{ 
          paddingLeft: `${(task.level || 0) * indentWidth}px`
        }"
      >
        <!-- 展开/折叠按钮 -->
        <span 
          v-if="hasChildren(task)" 
          class="gantt-task-expand-btn"
          @click.stop="toggleExpand(task)"
        >
          <span v-if="task.expanded">▼</span>
          <span v-else>▶</span>
        </span>
        <span v-else class="gantt-task-expand-placeholder"></span>
        
        <!-- 任务图标 -->
        <span class="gantt-task-icon" :class="`gantt-task-icon-${task.type || 'task'}`">
          <span v-if="task.type === 'milestone'">◆</span>
          <span v-else-if="task.type === 'project'">📂</span>
          <span v-else>📄</span>
        </span>
        
        <!-- 任务名称 -->
        <span class="gantt-task-name" :title="task.title">{{ task.title }}</span>
        
        <!-- 任务进度 -->
        <span v-if="task.progress !== undefined" class="gantt-task-progress">
          {{ task.progress }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { GanttTaskItem } from '../types';

// 定义组件属性
const props = withDefaults(defineProps<{
  tasks: GanttTaskItem[]; // 任务列表
  indentWidth: number; // 缩进宽度
  rowHeight?: number; // 行高
}>(), {
  rowHeight: 40,
  indentWidth: 20,
});

// 定义事件
const emit = defineEmits<{
  (e: 'toggle-expand', task: GanttTaskItem): void;
}>();

// 判断任务是否有子任务
const hasChildren = (task: GanttTaskItem): boolean => {
  return !!(task.children && task.children.length > 0);
};

// 切换任务展开/折叠状态
const toggleExpand = (task: GanttTaskItem) => {
  emit('toggle-expand', task);
};
</script>

<style lang="less" scoped>
.gantt-task-list {
  width: 100%;
  
  .gantt-task-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    .gantt-task-content {
      display: flex;
      flex: 1;
      align-items: center;
      padding: 0 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      .gantt-task-expand-btn {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-right: 4px;
        color: #666;
        font-size: 10px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;
        
        &:hover {
          color: #1890ff;
        }
      }
      
      .gantt-task-expand-placeholder {
        display: inline-block;
        width: 20px;
        margin-right: 4px;
      }
      
      .gantt-task-icon {
        display: inline-block;
        width: 20px;
        margin-right: 8px;
        text-align: center;
      }
      
      .gantt-task-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .gantt-task-progress {
        margin-left: 8px;
        color: #888;
        font-size: 12px;
      }
    }
  }
  
  .gantt-task-milestone {
    font-weight: bold;
    
    .gantt-task-icon-milestone {
      color: #f5222d;
    }
  }
  
  .gantt-task-project {
    font-weight: 500;
    
    .gantt-task-icon-project {
      color: #1890ff;
    }
  }
}
</style> 