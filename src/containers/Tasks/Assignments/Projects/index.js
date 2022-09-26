import React, { useState, useEffect, useCallback } from 'react';
import {
  createProject,
  deleteProject,
  editProject,
  fetchProjects,
  addMembersToProject,
} from 'store/actions/projects';
import {
  createTask,
  fetchTasks,
  reorderTasks,
  deleteTask,
  fetchProjectTasks,
} from 'store/actions/tasks';
import { NewButton, ProButton, ProInput, Project } from 'components/Lib';
import { connect } from 'react-redux';
import { Row, Col, Spin } from 'antd';
import NavigationButtons from '../NavigationButtons';
import ProjectSidebar from './Sidebar';
import ProjectDetailsSidebar from './ProjectDetailsSidebar';
import AddMembersModal from './AddMembersModal';

import ProjectDetails from './ProjectDetails';

const listTypes = {
  waiting: 1,
  doing: 0,
  closed: 2,
};
const Projects = props => {
  const {
    fetchProjectTasks,
    fetchingProjects = false,
    creatingProject = false,
    fetchProjects,
    createProject,
    editProject,
    deleteProject,
    addMembersToProject,
    type,
    users,
    onEditTask,
    projects,
    handleTaskTypeChange,
    addingMembersToProject = false,
    createTask,
    projectTasks,
    deleteTask,
    reorderTasks,
    profile,
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [newProjectName, setNewProjectName] = useState(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState(undefined);
  const [projectDetails, setProjectDetails] = useState(undefined);
  const [addMembersModalIsVisible, setAddMembersModalIsVisible] = useState(
    false
  );
  const [newMembers, setNewMembers] = useState([]);
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleGetProjectDetails = newProjectDetails => {
    setProjectDetails(newProjectDetails);
  };
  const handleNewProjectName = event => {
    setNewProjectName(event.target.value);
  };

  const onDelete = id => {
    deleteProject({
      id,
      callback: () => {
        if (projectDetails?.id) {
          setProjectDetails(undefined);
        }
        fetchProjects();
      },
    });
  };
  const handleAddMembersModal = (projectId, members) => {
    console.log(55);
    if (addMembersModalIsVisible) {
      setNewMembers([]);
    } else {
      setNewMembers(members);
      setSelectedProjectId(projectId);
    }
    setAddMembersModalIsVisible(!addMembersModalIsVisible);
  };

  const handleAddMembers = newMemberIds => {
    addMembersToProject({
      id: selectedProjectId,
      data: {
        members_ul: newMemberIds,
      },
      callback: () => {
        fetchProjects({
          onSuccessCallback: ({ data }) => {
            if (projectDetails?.id) {
              const project = data.find(({ id }) => id === projectDetails?.id);
              setProjectDetails(project);
            }
          },
        });
        setAddMembersModalIsVisible(false);
      },
    });
  };
  const handleNewProject = () => {
    createProject({
      data: {
        name: newProjectName,
      },
      callback: () => {
        setIsEditing(false);
      },
    });
  };

  const onEdit = (id, newName) => {
    editProject({
      id,
      data: {
        name: newName,
      },
      callback: () => {
        fetchProjects({
          onSuccessCallback: ({ data }) => {
            if (projectDetails?.id) {
              const project = data.find(({ id }) => projectDetails?.id === id);
              setProjectDetails(project);
            }
          },
        });
      },
    });
  };

  const handleReturnToProjects = () => {
    setProjectDetails(undefined);
  };
  const onEditClick = () => {
    if (isEditing) {
      setNewProjectName(undefined);
    }
    setIsEditing(!isEditing);
  };
  useEffect(() => {}, [projects]);

  return (
    <>
      <section className="scrollbar aside">
        <AddMembersModal
          visible={addMembersModalIsVisible}
          data={users}
          handleModal={handleAddMembersModal}
          members={newMembers}
          onConfirm={handleAddMembers}
          loadings={{
            submittingModal: addingMembersToProject,
          }}
        />
      </section>
      {projectDetails?.id ? (
        <ProjectDetailsSidebar
          type={type}
          fetchProjectTasks={fetchProjectTasks}
          project={projectDetails}
        />
      ) : (
        <ProjectSidebar type={type} />
      )}
      {projectDetails?.id ? (
        <ProjectDetails
          project={projectDetails}
          tasks={projectTasks}
          profile={profile}
          onDelete={onDelete}
          onEditTask={onEditTask}
          onEdit={onEdit}
          type={type}
          handleTaskTypeChange={handleTaskTypeChange}
          onAddMemberClick={handleAddMembersModal}
          handleReturnToProjects={handleReturnToProjects}
        />
      ) : (
        <section className="scrollbar aside">
          <NavigationButtons type={type} onChange={handleTaskTypeChange}>
            {isEditing ? (
              <Row
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Col span={8} offset={12}>
                  <ProInput
                    value={newProjectName}
                    onChange={handleNewProjectName}
                  />
                </Col>
                <Col span={4}>
                  <ProButton
                    disabled={!newProjectName}
                    onClick={handleNewProject}
                    loading={creatingProject}
                  >
                    Əlavə et
                  </ProButton>
                </Col>
              </Row>
            ) : (
              <NewButton label="Yeni proyekt" onClick={onEditClick}>
                Yeni proyekt
              </NewButton>
            )}
          </NavigationButtons>

          {/* novbede */}
          <Spin spinning={fetchingProjects}>
            <Row type="flex" style={{ margin: '20px' }}>
              {projects.map(project => (
                <Col span={8}>
                  <Project
                    {...project}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onAddMemberClick={handleAddMembersModal}
                    handleGetProjectDetails={handleGetProjectDetails}
                    //   deleteHandle,
                    //   editHandle,
                    //   memberAddPanelOpen,
                    //   selectedEmployees,
                    key={project.id}
                    {...props}
                  />
                </Col>
              ))}
            </Row>
          </Spin>
        </section>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  // Loadings
  users: state.usersReducer.users,
  projectTasks: state.tasksReducer.projectTasks,
  fetchingProjects: state.loadings.fetchingProjects,
  creatingProject: state.loadings.createProject,
  editingTask: state.loadings.editTask,
  projects: state.projectsReducer.projects,
  profile: state.profileReducer.profile,
  addingMembersToProject: state.loadings.addMembers,
});
export default connect(
  mapStateToProps,
  {
    createTask,
    createProject,
    editProject,
    fetchProjects,
    fetchProjectTasks,
    deleteProject,
    fetchTasks,
    addMembersToProject,
    reorderTasks,
    deleteTask,
  }
)(Projects);
