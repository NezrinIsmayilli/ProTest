import React, { useState, useEffect } from 'react';

import { fetchTasks, deleteTask } from 'store/actions/tasks';
import { fetchProjects } from 'store/actions/projects';
import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import { fetchUsers } from 'store/actions/users';
import { toast } from 'react-toastify';
import swal from 'sweetalert';

// Task types
import AddTask from '../AddTask';
import Daily from './Daily';
import Assigned from './Assigned';
import Delayed from './Delayed';
import Projects from './Projects';

const taskTypes = [
  {
    id: 1,
    name: 'Yeni',
  },
  {
    id: 0,
    name: 'İcrada',
  },
  {
    id: 2,
    name: 'Bitib',
  },
];
const Assignments = props => {
  const {
    projects,
    fetchTasks,
    fetchUsers,
    users,
    deleteTask,
    fetchProjects,
    profile,
  } = props;
  const [type, setType] = useState('daily');
  const [newTaskModalIsVisible, setNewTaskModalIsVisible] = useState(false);
  const [task, setTask] = useState(undefined);

  const handleTaskModal = () => {
    if (newTaskModalIsVisible) {
      if (task) {
        setTask(undefined);
      }
    }
    setNewTaskModalIsVisible(!newTaskModalIsVisible);
  };
  const fetch_tasks = type => {
    if (type !== 'projects') {
      fetchTasks({ type });
    }
  };

  const onEditTask = task => {
    setTask(task);
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
            fetchTasks({ type });
            toast.success('Tapşırıq uğurla silindi.');
          },
        });
      }
    });
  };
  const handleTaskTypeChange = newType => {
    setType(newType);
  };
  useEffect(() => {
    fetch_tasks(type);
  }, [type]);

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users]);

  useEffect(() => {
    if (task) {
      handleTaskModal();
    }
  }, [task]);

  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <>
      {type === 'daily' ? (
        <Daily
          type="daily"
          onEditTask={onEditTask}
          handleTaskTypeChange={handleTaskTypeChange}
          handleDeleteTask={handleDeleteTask}
        />
      ) : type === 'assigned' ? (
        <Assigned
          type="assigned"
          onEditTask={onEditTask}
          handleTaskTypeChange={handleTaskTypeChange}
          handleDeleteTask={handleDeleteTask}
        />
      ) : type === 'delayed' ? (
        <Delayed
          type="delayed"
          onEditTask={onEditTask}
          handleTaskTypeChange={handleTaskTypeChange}
          handleDeleteTask={handleDeleteTask}
        />
      ) : (
        <Projects
          type={type}
          onEditTask={onEditTask}
          handleTaskTypeChange={handleTaskTypeChange}
        />
      )}

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="new-task-global"
        onClick={handleTaskModal}
        role="button"
        tabIndex={0}
      />

      <AddTask
        visible={newTaskModalIsVisible}
        handleModal={handleTaskModal}
        projects={projects}
        taskTypes={taskTypes}
        users={users}
        type={type}
        profile={profile}
        task={task}
      />
    </>
  );
};

const mapStateToProps = state => ({
  permissionsList: state.permissionsReducer.permissions,
  projects: state.projectsReducer.projects,
  users: state.usersReducer.users,
  profile: state.profileReducer.profile,
});
export default connect(
  mapStateToProps,
  {
    fetchTasks,
    fetchProjects,
    fetchUsers,
    deleteTask,
  }
)(Assignments);
