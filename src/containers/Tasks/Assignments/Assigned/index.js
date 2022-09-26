import React, { useCallback } from 'react';
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
import Waiting from '../Waiting';
import Doing from '../Doing';
import Closed from '../Closed';
import DailySidebar from './Sidebar';

const listTypes = {
  waiting: 1,
  doing: 0,
  closed: 2,
};
const Assigned = props => {
  const {
    type,
    profile,
    assignedTasks,
    createTask,
    handleTaskTypeChange,
    handleDeleteTask,
    reorderTasks,
    fetchTasks,
    editTask,
    onEditTask,

    // Loadings
    fetchingTask = false,
    creatingTask = false,
    editingTask = false,
  } = props;
  const { waiting, doing, closed } = assignedTasks;

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
          type: 'assigned',
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

  const onDragEnd = useCallback(
    result => {
      const { source, destination } = result;
      // dropped outside the list
      if (!destination) {
        return;
      }
      if (source.droppableId === destination.droppableId) {
        reorderTasks(
          assignedTasks[source.droppableId].data,
          source.index,
          destination.index,
          source.droppableId,
          'assignedTasks'
        );
      } else {
        const [removed] = Array.from(
          assignedTasks[source.droppableId].data
        ).splice(source.index, 1);
        const dataForApi = {
          taskExecutors_ul: [removed.toTenantPersonId],
          title: removed.title,
          description: removed.description,
          status: listTypes[destination.droppableId],
          priority: removed.priority,
          deadlineAt: removed.deadlineAt,
          willProgressAt: removed.willProgressAt,
          project: removed.projectId,
          attachment: removed.attachment ? removed.attachment.id : null,
        };

        editTask({
          id: removed.id,
          data: dataForApi,
          callback: () => {
            fetchTasks({
              type: 'assigned',
            });
          },
          list: destination.droppableId,
        });
      }
    },
    [assignedTasks]
  );

  return (
    <>
      <DailySidebar type={type} />
      <section className="scrollbar aside">
        <NavigationButtons type={type} onChange={handleTaskTypeChange} />
        <DragDropContext onDragEnd={onDragEnd}>
          {/* novbede */}
          <Row>
            <Spin spinning={fetchingTask}>
              <Waiting
                list="waiting"
                type={type}
                loading={creatingTask || editingTask}
                tasks={waiting}
                onDragEnd={onDragEnd}
                onEditTask={onEditTask}
                handleCheckTask={handleCheckTask}
                shortTaskSubmitHandle={shortTaskSubmitHandle}
                handleDeleteTask={handleDeleteTask}
              />

              <Doing
                list="doing"
                type={type}
                loading={creatingTask || editingTask}
                tasks={doing}
                onDragEnd={onDragEnd}
                onEditTask={onEditTask}
                handleCheckTask={handleCheckTask}
                shortTaskSubmitHandle={shortTaskSubmitHandle}
                handleDeleteTask={handleDeleteTask}
              />
              <Closed
                list="closed"
                type={type}
                loading={creatingTask || editingTask}
                tasks={closed}
                onDragEnd={onDragEnd}
                onEditTask={onEditTask}
                handleCheckTask={handleCheckTask}
                shortTaskSubmitHandle={shortTaskSubmitHandle}
                handleDeleteTask={handleDeleteTask}
              />
            </Spin>
          </Row>
        </DragDropContext>
      </section>
    </>
  );
};

const mapStateToProps = state => ({
  // Loadings
  fetchingTask: state.loadings.fetchTasks,
  creatingTask: state.loadings.createTask,
  editingTask: state.loadings.editTask,
  assignedTasks: state.tasksReducer.assignedTasks,
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
)(Assigned);
