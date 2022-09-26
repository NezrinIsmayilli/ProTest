import React, { useEffect, useCallback } from 'react';
import {
  fetchTasks,
  createTask,
  reorderTasks,
  editTask,
} from 'store/actions/tasks';
import { DragDropContext } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Row, Spin } from 'antd';
import NavigationButtons from '../NavigationButtons';
import Expired from '../Expired';
import ExpiredSidebar from './Sidebar';

const listTypes = {
  waiting: 1,
  doing: 0,
  closed: 2,
};
const Delayed = props => {
  const {
    type = 'delayed',
    profile,
    delayedTasks,
    createTask,
    handleTaskTypeChange,
    handleDeleteTask,
    fetchTasks,
    editTask,
    onEditTask,
    // Loadings
    fetchingTask = false,
    creatingTask = false,
    editingTask = false,
  } = props;
  const { week, month, moreMonth } = delayedTasks;

  const handleCheckTask = task => {
    const dataForApi = {
      taskExecutors_ul: [task.toTenantPersonId],
      title: task.title,
      description: task.description,
      status: task.status === 2 ? 1 : 2,
      priority: task.priority,
      deadlineAt: task.deadlineAt,
      willProgressAt: task.willProgressAt,
      project: task.projectId,
      attachment: task.attachment ? task.attachment.id : null,
    };
    editTask({
      id: task.id,
      data: dataForApi,
      callback: () => {
        fetchTasks({
          type: 'delayed',
        });
      },
    });
  };

  const shortTaskSubmitHandle = (index, value, member, list, callback) => {
    createTask({
      data: {
        status: index,
        title: value,
        taskExecutors_ul: [member || profile.id],
        description: '',
        priority: 0,
        deadlineAt: '',
        willProgressAt: '',
        project: '',
        attachment: '',
      },
      type,
      list,
      callback,
    });
  };

  return (
    <>
      <ExpiredSidebar type={type} fetchTasks={fetchTasks} />
      <section className="scrollbar aside">
        <NavigationButtons type={type} onChange={handleTaskTypeChange} />
        {/* novbede */}
        <Row>
          <Spin spinning={fetchingTask}>
            <Expired
              list="waiting"
              type={type}
              title="Bir həftədən azdır"
              loading={creatingTask || editingTask}
              tasks={week}
              onEditTask={onEditTask}
              handleCheckTask={handleCheckTask}
              shortTaskSubmitHandle={shortTaskSubmitHandle}
              handleDeleteTask={handleDeleteTask}
            />

            <Expired
              list="doing"
              type={type}
              title="Bir həftədən çoxdur - bir aydan azdır"
              loading={creatingTask || editingTask}
              tasks={month}
              onEditTask={onEditTask}
              handleCheckTask={handleCheckTask}
              shortTaskSubmitHandle={shortTaskSubmitHandle}
              handleDeleteTask={handleDeleteTask}
            />
            <Expired
              list="closed"
              type={type}
              title="Bir aydan çoxdur"
              loading={creatingTask || editingTask}
              tasks={moreMonth}
              onEditTask={onEditTask}
              handleCheckTask={handleCheckTask}
              shortTaskSubmitHandle={shortTaskSubmitHandle}
              handleDeleteTask={handleDeleteTask}
            />
          </Spin>
        </Row>
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  // Loadings
  fetchingTask: state.loadings.fetchTasks,
  creatingTask: state.loadings.createTask,
  editingTask: state.loadings.editTask,
  delayedTasks: state.tasksReducer.delayedTasks,
  profile: state.profileReducer.profile,
});
export default connect(
  mapStateToProps,
  {
    createTask,
    fetchTasks,
    reorderTasks,
    editTask,
  }
)(Delayed);
