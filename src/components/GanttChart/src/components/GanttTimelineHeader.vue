<!--
 * @Description: 甘特图时间线表头组件
 * @Author: 甘特图组件
-->
<template>
  <div class="gantt-timeline-header">
    <!-- 月份表头 -->
    <div v-if="showMonthRow" class="gantt-header-row gantt-header-months">
      <div
        v-for="(month, index) in monthItems"
        :key="index"
        class="gantt-header-item gantt-header-month"
        :style="{ width: `${month.width}px` }"
      >
        {{ month.label }}
      </div>
    </div>

    <!-- 天/周表头 -->
    <div class="gantt-header-row gantt-header-days">
      <div
        v-for="(day, index) in dayItems"
        :key="index"
        class="gantt-header-item gantt-header-day"
        :class="{
          'gantt-weekend': day.isWeekend,
          'gantt-today': day.isToday,
        }"
        :style="{ width: `${cellWidth}px` }"
      >
        {{ day.label }}
        <div v-if="showDayOfWeek" class="gantt-header-weekday">
          {{ day.weekday }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, computed } from 'vue';
  import { formatDate, isWeekend, isToday, getDatesBetween } from '../utils';
  import dayjs from 'dayjs';

  // 定义组件属性
  const props = withDefaults(
    defineProps<{
      startDate: Date; // 甘特图开始日期
      endDate: Date; // 甘特图结束日期
      viewMode: 'day' | 'week' | 'month'; // 视图模式
      cellWidth: number; // 单元格宽度
    }>(),
    {
      viewMode: 'day',
      cellWidth: 40,
    },
  );

  // 是否显示月份行
  const showMonthRow = computed(() => {
    return true; // 可以根据需要调整为条件性显示
  });

  // 是否显示星期几
  const showDayOfWeek = computed(() => {
    return props.viewMode === 'day';
  });

  // 获取所有日期
  const allDates = computed(() => {
    return getDatesBetween(props.startDate, props.endDate);
  });

  // 日表头项
  const dayItems = computed(() => {
    return allDates.value.map((date) => {
      const dayFormatter = props.viewMode === 'month' ? 'M/D' : 'D';

      return {
        date,
        label: formatDate(date, dayFormatter),
        weekday: formatDate(date, 'ddd'),
        isWeekend: isWeekend(date),
        isToday: isToday(date),
      };
    });
  });

  // 月表头项
  const monthItems = computed(() => {
    if (!allDates.value.length) return [];

    const items: { label: string; width: number }[] = [];
    let currentMonth = '';
    let monthWidth = 0;

    allDates.value.forEach((date, index) => {
      const month = formatDate(date, 'YYYY-MM');

      if (month !== currentMonth) {
        if (currentMonth) {
          items.push({
            label: formatDate(allDates.value[index - 1], 'YYYY年M月'),
            width: monthWidth,
          });
        }

        currentMonth = month;
        monthWidth = props.cellWidth;
      } else {
        monthWidth += props.cellWidth;
      }

      // 处理最后一个月
      if (index === allDates.value.length - 1) {
        items.push({
          label: formatDate(date, 'YYYY年M月'),
          width: monthWidth,
        });
      }
    });

    return items;
  });
</script>

<style lang="less" scoped>
  .gantt-timeline-header {
    width: 100%;

    .gantt-header-row {
      display: flex;
      height: 30px;
      border-bottom: 1px solid #e0e0e0;

      &.gantt-header-months {
        height: 28px;
      }
    }

    .gantt-header-item {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border-right: 1px solid #f0f0f0;
      font-size: 12px;

      &.gantt-header-month {
        border-right: 1px solid #e0e0e0;
        background-color: #f9f9f9;
        font-weight: 500;
      }

      &.gantt-header-day {
        font-size: 12px;

        .gantt-header-weekday {
          color: #888;
          font-size: 10px;
        }

        &.gantt-weekend {
          background-color: #f8f8f8;
          color: #ff4d4f;

          .gantt-header-weekday {
            color: #ff4d4f;
          }
        }

        &.gantt-today {
          background-color: #e6f7ff;
          font-weight: bold;

          .gantt-header-weekday {
            color: #1890ff;
          }
        }
      }
    }
  }
</style>
