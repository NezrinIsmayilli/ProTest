import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Col, Row, Spin } from 'antd';
import { DetailButton, ProDots, ProDotsItem, TaskCard } from 'components/Lib';
import { MdExpandMore } from 'react-icons/md';
import AddShortTask from '../AddShortTask';
import styles from '../styles.module.scss';

const colCustomStyle = {
  flex: '0 0 33%',
};

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  marginBottom: 8,
  borderRadius: 4,
  boxShadow: isDragging ? '-1px 1px 3px 0px rgba(0,0,0,0.5)' : '',
  ...draggableStyle,
});

const Waiting = props => {
  const {
    type,
    tab,
    users,
    onEditTask,
    list,
    tasks,
    profile,
    shortTaskSubmitHandle,
    handleCheckTask,
    handleDeleteTask,
    shortTask = true,
    loading = false,
    fetchMoreTasks,
  } = props;

  console.log(tasks)
  const handleEditTask = task => {
    onEditTask(task);
  };
  return (
    <Col span={8} style={colCustomStyle}>
      <Spin spinning={loading}>
        <Droppable droppableId="waiting">
          {(provided, snapshot) => (
            <ul className="task-column" ref={provided.innerRef}>
              <li className="task-header">
                {/* Tasks count */}
                <span className="num yellow">{tasks.count}</span>
                {/* Board name */}
                Yeni
                <span className="badge-sand" />
              </li>
              {tasks.data.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={String(task.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      key={task.id}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <TaskCard
                        type="daily"
                        tab={tab}
                        task={task}
                        handleCheckTask={handleCheckTask}
                        handleEditTask={handleEditTask}
                        {
                          ...{
                            // profileId,
                            // willProgressAtResetHandle,
                            // willProgressAtSetHandle,
                            // taskDetailViewToggle,
                            // toTenanPersonPanelToggle,
                            // openEditPanel,
                          }
                        }
                        // moveToDoneHandle={() => {
                        //   moveToDoneHandle(task.id, task.status, 'daily', task);
                        // }}
                        // deleteTaskHandle={() =>
                        //   deleteTaskHandle(task.id, 'daily')
                        // }
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <DetailButton onClick={() => handleEditTask(task)} />
                          <ProDots>
                            {/* <ProDotsItem label="Xatırlat" icon="bell" /> */}
                            <ProDotsItem
                              label="Düzəliş et"
                              icon="pencil"
                              onClick={() => handleEditTask(task)}
                            />
                            <ProDotsItem
                              label="Sil"
                              icon="trash"
                              onClick={() => handleDeleteTask(task.id, type)}
                            />
                          </ProDots>
                        </div>
                      </TaskCard>
                    </div>
                  )}
                </Draggable>
              ))}
              {tasks?.data.length===0 ? null :
                <Row
                  className={styles.more}
                  onClick={() => {
                    fetchMoreTasks(tasks.page, 'waiting');
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <span>Daha çox göstər</span>
                    <MdExpandMore />
                  </div>
                </Row>
              }
              {provided.placeholder}
              {shortTask && (
                <AddShortTask
                  index={1}
                  users={users}
                  shortTaskSubmitHandle={shortTaskSubmitHandle}
                  creatingTask={loading}
                  list={list}
                  profile={profile}
                />
              )}
            </ul>
          )}
        </Droppable>
      </Spin>
    </Col>
  );
};

const mapStateToProps = state => ({
  users: state.usersReducer.users,
  profile: state.profileReducer.profile,
});
export default connect(mapStateToProps)(Waiting);
