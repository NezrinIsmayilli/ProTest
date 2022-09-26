/**
 * TAsks reducer
 */
import { createReducer } from 'redux-starter-kit';
import { setProjects } from 'store/actions/projects';
// action types
//  import {
//    getDailyTasksAction,
//    getAssignedTasksAction,
//    getDelayedTasksAction,
//    getAllTasksAction,
//    // editTaskAction,
//    // deleteTaskAction,
//    // createTaskAction,
//    getFilteredTaskAction,
//    changeStatusOnDragAction,
//    reorderTasksAction,
//    setDailyFilteredTasks,
//    setAssignedFilteredTasks,
//    setDelayedFilteredTasks,
//    setChiefs,
//    setProjectTasks,
//    setPagTaskProjects,
//  } from '../actions/TaskActions';

const initialState = {
  projects: [],
};

export const projectsReducer = createReducer(initialState, {
  [setProjects]: (state, action) => ({
    ...state,
    projects: action.payload.data,
  }),
});
