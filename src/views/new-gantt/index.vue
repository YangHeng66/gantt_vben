<!--
 * @Author: Claude AI
 * @Date: 2024-05-22
 * @Description: 新甘特图组件
 * Copyright (c) 2024 by Digital Management Center(DMC), All Rights Reserved. 
-->
<template>
  <div class="new-gantt-wrapper">
    <div class="new-gantt-header">
      <h2>甘特图</h2>
      <div class="header-controls">
        <a-button type="primary" @click="handleAddTask">新增任务</a-button>
        <a-button class="ml-2" @click="handleExport">导出</a-button>
        <a-radio-group v-model:value="viewMode" button-style="solid" class="ml-2">
          <a-radio-button value="day">日视图</a-radio-button>
          <a-radio-button value="week">周视图</a-radio-button>
          <a-radio-button value="month">月视图</a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <div class="new-gantt-content">
      <div class="new-gantt-sidebar">
        <a-card title="控制面板" class="h-full">
          <div class="gantt-controls">
            <a-button block @click="handleExpandAll">展开所有</a-button>
            <a-button block class="mt-2" @click="handleCollapseAll">折叠所有</a-button>
            <a-button block class="mt-2" @click="handleGoToday">回到今天</a-button>

            <a-divider>任务过滤</a-divider>
            <a-input placeholder="按名称过滤" v-model:value="filterText" />

            <a-divider>添加示例数据</a-divider>
            <a-button block type="primary" @click="handleAddSampleData"> 添加示例数据 </a-button>
          </div>
        </a-card>
      </div>
      <div class="new-gantt-main">
        <a-card title="甘特图视图" class="h-full">
          <gantt-chart
            ref="ganttChartRef"
            data-id="id"
            :data="taskList"
            :viewMode="viewMode"
            :show-today-line="true"
            :highlight-weekends="true"
            :cell-width="getCellWidth()"
            :cell-height="40"
            :task-list-width="300"
            @task-click="handleTaskClick"
            @task-dblclick="handleTaskEdit"
            @task-drag="handleTaskDrag"
          />
        </a-card>
      </div>
    </div>

    <!-- 任务表单对话框 -->
    <a-modal
      v-model:visible="taskFormVisible"
      :title="isEditMode ? '编辑任务' : '新增任务'"
      @ok="handleTaskFormSubmit"
    >
      <a-form :model="taskForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="任务名称" required>
          <a-input v-model:value="taskForm.title" placeholder="请输入任务名称" />
        </a-form-item>
        <a-form-item label="开始日期" required>
          <a-date-picker v-model:value="taskForm.startDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="结束日期" required>
          <a-date-picker v-model:value="taskForm.endDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="任务类型">
          <a-select v-model:value="taskForm.type">
            <a-select-option value="task">普通任务</a-select-option>
            <a-select-option value="milestone">里程碑</a-select-option>
            <a-select-option value="project">项目</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="进度">
          <a-slider v-model:value="taskForm.progress" :min="0" :max="100" />
        </a-form-item>
        <a-form-item label="颜色">
          <a-input v-model:value="taskForm.color" placeholder="#52c41a" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import GanttChart from '../../components/GanttChart';
  import { GanttTaskItem, GanttInstance } from '../../components/GanttChart/src/types';

  // 甘特图实例引用
  const ganttChartRef = ref<GanttInstance | null>(null);

  // 视图模式
  const viewMode = ref<'day' | 'week' | 'month'>('day');

  // 过滤文本
  const filterText = ref('');

  // 任务列表数据
  const taskList = reactive<GanttTaskItem[]>([
    {
      id: 1,
      title: '项目初始化',
      startDate: dayjs().toDate(),
      endDate: dayjs().add(5, 'day').toDate(),
      type: 'project',
      progress: 30,
      expanded: true,
      children: [
        {
          id: 2,
          title: '需求分析',
          startDate: dayjs().toDate(),
          endDate: dayjs().add(2, 'day').toDate(),
          progress: 60,
          type: 'task',
          children: [],
        },
        {
          id: 3,
          title: '项目立项',
          startDate: dayjs().add(3, 'day').toDate(),
          endDate: dayjs().add(3, 'day').toDate(),
          type: 'milestone',
          progress: 0,
          children: [],
        },
      ],
    },
  ]);

  // 根据视图模式计算单元格宽度
  const getCellWidth = () => {
    switch (viewMode.value) {
      case 'day':
        return 40;
      case 'week':
        return 120;
      case 'month':
        return 200;
      default:
        return 40;
    }
  };

  // 任务表单
  const taskFormVisible = ref(false);
  const isEditMode = ref(false);
  const currentTaskId = ref<number | null>(null);
  const taskForm = reactive<any>({
    title: '',
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
    type: 'task',
    progress: 0,
    color: '',
  });

  // 处理添加任务按钮点击
  const handleAddTask = () => {
    resetTaskForm();
    isEditMode.value = false;
    currentTaskId.value = null;
    taskFormVisible.value = true;
  };

  // 处理任务编辑
  const handleTaskEdit = (task: GanttTaskItem) => {
    isEditMode.value = true;
    currentTaskId.value = task.id as number;

    // 填充表单数据
    taskForm.title = task.title;
    taskForm.startDate = dayjs(task.startDate);
    taskForm.endDate = dayjs(task.endDate);
    taskForm.type = task.type || 'task';
    taskForm.progress = task.progress || 0;
    taskForm.color = task.color || '';

    taskFormVisible.value = true;
  };

  // 重置任务表单
  const resetTaskForm = () => {
    taskForm.title = '';
    taskForm.startDate = dayjs();
    taskForm.endDate = dayjs().add(1, 'day');
    taskForm.type = 'task';
    taskForm.progress = 0;
    taskForm.color = '';
  };

  // 处理任务表单提交
  const handleTaskFormSubmit = () => {
    // 表单验证
    if (!taskForm.title || !taskForm.startDate || !taskForm.endDate) {
      message.error('请填写必填项');
      return;
    }

    // 转换日期格式
    const startDate = taskForm.startDate.toDate();
    const endDate = taskForm.endDate.toDate();

    // 检查日期顺序
    if (startDate > endDate) {
      message.error('结束日期不能早于开始日期');
      return;
    }

    // 构建任务对象
    const task: GanttTaskItem = {
      id: isEditMode.value && currentTaskId.value ? currentTaskId.value : Date.now(),
      title: taskForm.title,
      startDate,
      endDate,
      type: taskForm.type as 'task' | 'milestone' | 'project',
      progress: taskForm.progress,
      color: taskForm.color,
      children: [],
    };

    // 更新或添加任务
    if (isEditMode.value && currentTaskId.value) {
      // 更新现有任务
      updateTask(currentTaskId.value, task);
      message.success('任务更新成功');
    } else {
      // 添加新任务
      taskList.push(task);
      message.success('任务添加成功');
    }

    taskFormVisible.value = false;
  };

  // 更新任务
  const updateTask = (taskId: number, updatedTask: GanttTaskItem) => {
    const updateTaskInList = (list: GanttTaskItem[]) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === taskId) {
          // 保留子任务
          updatedTask.children = list[i].children;
          list[i] = { ...updatedTask };
          return true;
        }

        if (list[i].children && list[i].children.length > 0) {
          if (updateTaskInList(list[i].children)) {
            return true;
          }
        }
      }
      return false;
    };

    updateTaskInList(taskList);
  };

  // 展开所有任务
  const handleExpandAll = () => {
    if (ganttChartRef.value) {
      ganttChartRef.value.expandAll();
    }
  };

  // 折叠所有任务
  const handleCollapseAll = () => {
    if (ganttChartRef.value) {
      ganttChartRef.value.collapseAll();
    }
  };

  // 回到今天
  const handleGoToday = () => {
    if (ganttChartRef.value) {
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);

      const oneWeekAfter = new Date(today);
      oneWeekAfter.setDate(today.getDate() + 21);

      ganttChartRef.value.setDateRange(oneWeekAgo, oneWeekAfter);
    }
  };

  // 处理任务点击
  const handleTaskClick = (task: GanttTaskItem) => {
    console.log('任务点击:', task);
  };

  // 处理任务拖拽
  const handleTaskDrag = (task: GanttTaskItem, newStartDate: Date, newEndDate: Date) => {
    message.success(`任务"${task.title}"日期已更新`);
  };

  // 处理导出
  const handleExport = () => {
    message.info('导出功能开发中');
  };

  // 添加示例数据
  const handleAddSampleData = () => {
    const startDate = dayjs();

    const sampleData: GanttTaskItem[] = [
      {
        id: 100,
        title: 'A产品开发计划',
        startDate: startDate.toDate(),
        endDate: startDate.add(30, 'day').toDate(),
        type: 'project',
        progress: 25,
        expanded: true,
        children: [
          {
            id: 101,
            title: '产品需求分析',
            startDate: startDate.toDate(),
            endDate: startDate.add(5, 'day').toDate(),
            progress: 100,
            type: 'task',
            children: [],
          },
          {
            id: 102,
            title: '需求评审完成',
            startDate: startDate.add(5, 'day').toDate(),
            endDate: startDate.add(5, 'day').toDate(),
            type: 'milestone',
            children: [],
          },
          {
            id: 103,
            title: '产品设计阶段',
            startDate: startDate.add(6, 'day').toDate(),
            endDate: startDate.add(15, 'day').toDate(),
            progress: 60,
            type: 'task',
            expanded: true,
            children: [
              {
                id: 104,
                title: 'UI设计',
                startDate: startDate.add(6, 'day').toDate(),
                endDate: startDate.add(12, 'day').toDate(),
                progress: 80,
                type: 'task',
                children: [],
              },
              {
                id: 105,
                title: '交互设计',
                startDate: startDate.add(8, 'day').toDate(),
                endDate: startDate.add(15, 'day').toDate(),
                progress: 40,
                type: 'task',
                children: [],
              },
            ],
          },
          {
            id: 106,
            title: '设计评审完成',
            startDate: startDate.add(15, 'day').toDate(),
            endDate: startDate.add(15, 'day').toDate(),
            type: 'milestone',
            children: [],
          },
          {
            id: 107,
            title: '开发阶段',
            startDate: startDate.add(16, 'day').toDate(),
            endDate: startDate.add(30, 'day').toDate(),
            progress: 0,
            type: 'task',
            expanded: true,
            children: [
              {
                id: 108,
                title: '前端开发',
                startDate: startDate.add(16, 'day').toDate(),
                endDate: startDate.add(28, 'day').toDate(),
                progress: 0,
                type: 'task',
                children: [],
              },
              {
                id: 109,
                title: '后端开发',
                startDate: startDate.add(16, 'day').toDate(),
                endDate: startDate.add(30, 'day').toDate(),
                progress: 0,
                type: 'task',
                children: [],
              },
            ],
          },
        ],
      },
    ];

    taskList.push(...sampleData);
    message.success('示例数据已添加');
  };

  // 组件挂载时初始化
  onMounted(() => {
    // 在这里可以执行初始化操作，例如从API获取任务数据
  });
</script>

<style lang="less" scoped>
  .new-gantt-wrapper {
    height: calc(100vh - 80px);
    padding: 12px;

    .new-gantt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h2 {
        margin: 0;
      }

      .ml-2 {
        margin-left: 8px;
      }
    }

    .new-gantt-content {
      display: flex;
      height: calc(100% - 60px);
      gap: 16px;

      .new-gantt-sidebar {
        width: 240px;
        height: 100%;

        .gantt-controls {
          display: flex;
          flex-direction: column;
        }
      }

      .new-gantt-main {
        flex: 1;
        height: 100%;

        :deep(.ant-card-body) {
          height: calc(100% - 57px);
          padding: 0;
        }
      }
    }

    .mt-2 {
      margin-top: 8px;
    }
  }
</style>
