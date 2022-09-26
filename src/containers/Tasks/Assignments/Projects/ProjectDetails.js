import React, { useState, useEffect, useCallback } from 'react';
import { ProButton, Project } from 'components/Lib';
import { Row, Col, Spin } from 'antd';
import { DragDropContext } from 'react-beautiful-dnd';
import swal from 'sweetalert';
import { toast } from 'react-toastify';
import { GrReturn } from 'react-icons/gr';
import {
  createTask,
  editTask,
  fetchProjectTasks,
  reorderTasks,
  deleteTask,
} from 'store/actions/tasks';
import { connect } from 'react-redux';
import NavigationButtons from '../NavigationButtons';
import Waiting from '../Waiting';
import Doing from '../Doing';
import Closed from '../Closed';

const listTypes = {
  waiting: 1,
  doing: 0,
  closed: 2,
};

const ProjectDetails = props => {
  const {
    project,
    editTask,
    projectTasks,
    fetchProjectTasks,
    reorderTasks,
    deleteTask,
    handleReturnToProjects,
    handleTaskTypeChange,
    type,
    onDelete,
    onEdit,
    onAddMemberClick,
    handleGetProjectDetails,
    fetchingTask = false,
    creatingTask = false,
    fetchingProjects = false,
    onEditTask,
  } = props;
  const { waiting, doing, closed } = projectTasks;

  const handleCheckTask = task => {
    const dataForApi = {
      taskExecutors_ul: task.toTenantPersonId,
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
        fetchProjectTasks({
          filters: {
            'filter[project]': project?.id,
          },
        });
      },
    });
  };

  const handleDeleteTask = (id, type) => {
    swal({
      title: 'Diqqət!',
      text: 'Tapşırığı silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteTask({
          id,
          callback: () => {
            fetchProjectTasks({
              filters: {
                'filter[project]': project?.id,
              },
            });
            toast.success('Tapşırıq uğurla silindi.');
          },
        });
      }
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
        console.log(5);
        reorderTasks(
          projectTasks[source.droppableId].data,
          source.index,
          destination.index,
          source.droppableId,
          'projectTasks'
        );
      } else {
        const [removed] = Array.from(
          projectTasks[source.droppableId].data
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
            fetchProjectTasks({
              filters: {
                'filter[project]': project?.id,
              },
            });
          },
          list: destination.droppableId,
        });
      }
    },
    [projectTasks]
  );

  useEffect(() => {
    if (!creatingTask && project?.id) {
      fetchProjectTasks({
        filters: {
          'filter[project]': project?.id,
        },
      });
    }
  }, [creatingTask]);
  return (
    <div>
      <section className="scrollbar aside">
        <NavigationButtons type={type} onChange={handleTaskTypeChange}>
          <ProButton onClick={handleReturnToProjects}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <GrReturn
                color="white"
                style={{
                  filter:
                    'invert(100%) sepia(0%) saturate(0%) hue-rotate(87deg) brightness(119%) contrast(119%)',
                  marginRight: '10px',
                  fontSize: '16px',
                }}
              />
              <span>Geri qayıt</span>
            </div>
          </ProButton>
        </NavigationButtons>

        <Row type="flex" style={{ margin: '20px 30px' }}>
          <Col span={8}>
            <Spin spinning={fetchingProjects}>
              <Project
                {...project}
                onDelete={onDelete}
                onEdit={onEdit}
                onAddMemberClick={onAddMemberClick}
                handleGetProjectDetails={handleGetProjectDetails}
                key={project.id}
                {...props}
              />
            </Spin>
          </Col>
        </Row>
        <DragDropContext onDragEnd={onDragEnd}>
          <Row>
            <Spin spinning={fetchingTask}>
              <Waiting
                list="waiting"
                // loading={creatingTask || editingTask}
                tasks={waiting}
                onDragEnd={onDragEnd}
                onEditTask={onEditTask}
                handleCheckTask={handleCheckTask}
                handleDeleteTask={handleDeleteTask}
                shortTask={false}
              />

              <Doing
                list="doing"
                // loading={creatingTask || editingTask}
                tasks={doing}
                onDragEnd={onDragEnd}
                onEditTask={onEditTask}
                handleCheckTask={handleCheckTask}
                handleDeleteTask={handleDeleteTask}
                shortTask={false}
              />
              <Closed
                list="closed"
                // loading={creatingTask || editingTask}
                tasks={closed}
                onDragEnd={onDragEnd}
                onEditTask={onEditTask}
                handleCheckTask={handleCheckTask}
                handleDeleteTask={handleDeleteTask}
                shortTask={false}
              />
            </Spin>
          </Row>
        </DragDropContext>
      </section>
    </div>
  );
};

const mapStateToProps = state => ({
  creatingTask: state.loadings.createTask,
  fetchingTask: state.loadings.fetchProjectTasks,
  fetchingProjects: state.loadings.fetchingProjects,
  projectTasks: state.tasksReducer.projectTasks,
});
export default connect(
  mapStateToProps,
  {
    createTask,
    editTask,
    reorderTasks,
    deleteTask,
    fetchProjectTasks,
  }
)(ProjectDetails);
