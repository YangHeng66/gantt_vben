<!--
 * @Description: 甘特图时间线网格组件
 * @Author: 甘特图组件
-->
<template>
  <div class="gantt-timeline-grid" ref="gridRef">
    <!-- 网格行 -->
    <div 
      v-for="(_, rowIndex) in rowCount" 
      :key="rowIndex" 
      class="gantt-grid-row"
      :style="{ height: `${cellHeight}px` }"
    >
      <!-- 网格单元格 -->
      <div
        v-for="(date, colIndex) in dates"
        :key="colIndex"
        class="gantt-grid-cell"
        :class="{ 
          'gantt-grid-weekend': highlightWeekends && isWeekend(date),
          'gantt-grid-today': isToday(date)
        }"
        :style="{ 
          width: `${cellWidth}px`, 
          height: `${cellHeight}px` 
        }"
      ></div>
    </div>
    
    <!-- 今日线 -->
    <div 
      v-if="showTodayLine && todayPosition > 0" 
      class="gantt-today-line"
      :style="{ left: `${todayPosition}px` }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref, onMounted, nextTick, watch } from 'vue';
import { isWeekend, isToday } from '../utils';
import dayjs from 'dayjs';

// 定义组件属性
const props = withDefaults(defineProps<{
  dates: Date[]; // 日期数组
  cellWidth: number; // 单元格宽度
  cellHeight: number; // 单元格高度
  rowCount?: number; // 行数
  highlightWeekends?: boolean; // 是否高亮周末
  showTodayLine?: boolean; // 是否显示今日线
}>(), {
  rowCount: 20, // 默认行数
  cellWidth: 40,
  cellHeight: 40,
  highlightWeekends: true,
  showTodayLine: true,
});

const gridRef = ref<HTMLElement | null>(null);

// 计算今日线位置
const todayPosition = computed(() => {
  if (!props.dates.length) return -1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < props.dates.length; i++) {
    const date = props.dates[i];
    if (dayjs(date).isSame(dayjs(today), 'day')) {
      return i * props.cellWidth + props.cellWidth / 2;
    }
  }
  
  return -1; // 没有找到今天
});

// 观察日期变化，调整网格尺寸
watch(() => props.dates, () => {
  nextTick(() => {
    updateGridSize();
  });
}, { deep: true });

// 更新网格尺寸
const updateGridSize = () => {
  if (gridRef.value && props.dates.length) {
    const width = props.dates.length * props.cellWidth;
    gridRef.value.style.width = `${width}px`;
    
    const height = props.rowCount * props.cellHeight;
    gridRef.value.style.minHeight = `${height}px`;
  }
};

// 组件挂载后初始化
onMounted(() => {
  updateGridSize();
});
</script>

<style lang="less" scoped>
.gantt-timeline-grid {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  
  .gantt-grid-row {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .gantt-grid-cell {
      box-sizing: border-box;
      flex-shrink: 0;
      border-right: 1px solid #f0f0f0;
      
      &.gantt-grid-weekend {
        background-color: rgb(245 245 245 / 50%);
      }
      
      &.gantt-grid-today {
        background-color: rgb(24 144 255 / 5%);
      }
    }
  }
  
  .gantt-today-line {
    position: absolute;
    z-index: 1;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: #f5222d;
    pointer-events: none;
  }
}
</style> 