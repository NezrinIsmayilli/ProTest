import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Spin, Col } from 'antd';
import { DetailButton, ProDots, ProDotsItem, TaskCard } from 'components/Lib';
import AddShortTask from '../AddShortTask';

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

const Doing = props => {
  const {
    type,
    tab,
    onEditTask,
    list,
    users,
    tasks,
    profile,
    shortTaskSubmitHandle,
    handleCheckTask,
    handleDeleteTask,
    shortTask = true,
    loading = false,
  } = props;

  const handleEditTask = task => {
    onEditTask(task);
  };

  return (
    <Col span={8} style={colCustomStyle}>
      <Spin spinning={loading}>
        <Droppable droppableId="doing">
          {(provided, snapshot) => (
            <ul className="task-column" ref={provided.innerRef}>
              <li className="task-header">
                {/* Tasks count */}
                <span className="num blue">{tasks.count}</span>
                {/* Board name */}
                İcrada
                <span className="badge-flag" />
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
                        handleCheckTask={handleCheckTask}
                        task={task}
                        handleEditTask={handleEditTask}
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
              {provided.placeholder}
              {shortTask && (
                <AddShortTask
                  index={0}
                  shortTaskSubmitHandle={shortTaskSubmitHandle}
                  creatingTask={loading}
                  list={list}
                  users={users}
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
export default connect(
  mapStateToProps,
  {}
)(Doing);
