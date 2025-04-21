/*
 * @Author: YangHeng66 yangheng66@gmail.com
 * @Date: 2025-04-21 14:30:26
 * @LastEditors: YangHeng66 yangheng66@gmail.com
 * @LastEditTime: 2025-04-21 18:10:33
 * @FilePath: \vue3-gantt\src\components\GanttChart\src\utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { GanttTaskItem } from './types';
import dayjs from 'dayjs';

/**
 * 标准化日期格式
 * @param date 日期（字符串或Date对象）
 * @returns Date对象
 */
export function normalizeDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

/**
 * 计算任务持续时间（天）
 * @param startDate 开始日期SyntaxError: The requested module '/src/components/GanttChart/src/types.ts?t=1745230288644' does not provide an export named 'GanttInstance' (at index.ts:2:37)
 * @param endDate 结束日期
 * @returns 持续天数
 */
export function calculateDuration(startDate: string | Date, endDate: string | Date): number {
  const start = dayjs(normalizeDate(startDate));
  const end = dayjs(normalizeDate(endDate));
  return end.diff(start, 'day') + 1; // 包含结束日期
}

/**
 * 获取日期范围内的所有日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期数组
 */
export function getDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  let current = start;
  while (current.isSame(end) || current.isBefore(end)) {
    dates.push(current.toDate());
    current = current.add(1, 'day');
  }

  return dates;
}

/**
 * 计算甘特图日期范围
 * @param tasks 任务项列表
 * @param buffer 前后缓冲天数
 * @returns 开始和结束日期
 */
export function calculateDateRange(
  tasks: GanttTaskItem[],
  buffer = 7,
): { startDate: Date; endDate: Date } {
  if (!tasks || tasks.length === 0) {
    return {
      startDate: dayjs().subtract(buffer, 'day').toDate(),
      endDate: dayjs().add(buffer, 'day').toDate(),
    };
  }

  let minDate = new Date();
  let maxDate = new Date();
  let isFirst = true;

  const processTask = (task: GanttTaskItem) => {
    const taskStart = normalizeDate(task.startDate);
    const taskEnd = normalizeDate(task.endDate);

    if (isFirst) {
      minDate = taskStart;
      maxDate = taskEnd;
      isFirst = false;
    } else {
      if (taskStart < minDate) minDate = taskStart;
      if (taskEnd > maxDate) maxDate = taskEnd;
    }

    if (task.children && task.children.length > 0) {
      task.children.forEach(processTask);
    }
  };

  tasks.forEach(processTask);

  return {
    startDate: dayjs(minDate).subtract(buffer, 'day').toDate(),
    endDate: dayjs(maxDate).add(buffer, 'day').toDate(),
  };
}

/**
 * 格式化日期显示
 * @param date 日期
 * @param format 格式
 * @returns 格式化的日期字符串
 */
export function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

/**
 * 检查日期是否为周末
 * @param date 日期
 * @returns 是否为周末
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0是周日，6是周六
}

/**
 * 判断日期是否为今天
 * @param date 日期
 * @returns 是否为今天
 */
export function isToday(date: Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 扁平化任务列表（递归获取所有任务，包括子任务）
 * @param tasks 任务列表
 * @returns 扁平化后的任务数组
 */
export function flattenTasks(tasks: GanttTaskItem[]): GanttTaskItem[] {
  const result: GanttTaskItem[] = [];

  const process = (taskList: GanttTaskItem[], level = 0) => {
    if (!taskList || taskList.length === 0) return;

    taskList.forEach((task) => {
      const newTask = { ...task, level };
      result.push(newTask);

      if (task.children && task.children.length > 0 && task.expanded !== false) {
        process(task.children, level + 1);
      }
    });
  };

  process(tasks);
  return result;
}

/**
 * 根据ID查找任务
 * @param tasks 任务列表
 * @param id 任务ID
 * @returns 任务项或undefined
 */
export function findTaskById(
  tasks: GanttTaskItem[],
  id: string | number,
): GanttTaskItem | undefined {
  for (const task of tasks) {
    if (task.id === id) {
      return task;
    }

    if (task.children && task.children.length > 0) {
      const found = findTaskById(task.children, id);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * 计算任务在时间轴上的位置和宽度
 * @param task 任务项
 * @param startDate 甘特图开始日期
 * @param cellWidth 单元格宽度
 * @returns 位置和宽度
 */
export function calculateTaskPosition(
  task: GanttTaskItem,
  startDate: Date,
  cellWidth: number,
): { left: number; width: number } {
  const taskStart = normalizeDate(task.startDate);
  const taskEnd = normalizeDate(task.endDate);

  const diffStart = dayjs(taskStart).diff(dayjs(startDate), 'day');
  const duration = calculateDuration(taskStart, taskEnd);

  return {
    left: diffStart * cellWidth,
    width: duration * cellWidth,
  };
}
