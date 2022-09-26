import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Col, Spin } from 'antd';
import { DetailButton, ProDots, ProDotsItem, TaskCard } from 'components/Lib';
import AddShortTask from '../AddShortTask';

const colCustomStyle = {
  flex: '0 0 33%',
};

const Expired = props => {
  const {
    type,
    onEditTask,
    list,
    tasks,
    title,
    shortTaskSubmitHandle,
    handleCheckTask,
    handleDeleteTask,
    loading = false,
  } = props;

  const handleEditTask = task => {
    onEditTask(task);
  };
  return (
    <Col span={8} style={colCustomStyle}>
      <Spin spinning={loading}>
        <ul className="task-column">
          <li className="task-header">
            {/* Tasks count */}
            <span className="num yellow">{tasks.count}</span>
            {/* Board name */}
            {title}
            <span className="badge-sand" />
          </li>
          {tasks.data.map((task, index) => (
            <div key={task.id}>
              <TaskCard
                type="daily"
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
          ))}
        </ul>
      </Spin>
    </Col>
  );
};

const mapStateToProps = state => ({

});
export default connect(
  mapStateToProps,
  {}
)(Expired);
