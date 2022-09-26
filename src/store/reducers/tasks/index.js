/**
 * TAsks reducer
 */
import { createReducer } from 'redux-starter-kit';
import {
  setAssignedTasks,
  setDailyTasks,
  setDelayedTasks,
  setReorderedTasks,
  setProjectTasks,
} from 'store/actions/tasks';
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
  dailyTasks: {
    waiting: { data: [], count: 0, page: null },
    doing: { data: [], count: 0, page: null },
    closed: { data: [], count: 0, page: null },
  },
  assignedTasks: {
    waiting: { data: [], count: 0, page: null },
    doing: { data: [], count: 0, page: null },
    closed: { data: [], count: 0, page: null },
  },
  delayedTasks: {
    week: { data: [], count: 0, page: null },
    month: { data: [], count: 0, page: null },
    moreMonth: { data: [], count: 0, page: null },
  },
  projectTasks: {
    waiting: { data: [], count: 0, page: null },
    doing: { data: [], count: 0, page: null },
    closed: { data: [], count: 0, page: null },
  },
};

export const tasksReducer = createReducer(initialState, {
  [setDailyTasks]: (state, action) => ({
    ...state,
    dailyTasks: {
      waiting: action.payload[1],
      doing: action.payload[0],
      closed: action.payload[2],
    },
  }),
  [setAssignedTasks]: (state, action) => ({
    ...state,
    assignedTasks: {
      waiting: action.payload[1],
      doing: action.payload[0],
      closed: action.payload[2],
    },
  }),
  [setDelayedTasks]: (state, action) => ({
    ...state,
    delayedTasks: {
      week: action.payload[0],
      month: action.payload[1],
      moreMonth: action.payload[2],
    },
  }),
  [setReorderedTasks]: (state, action) => ({
    ...state,
    [action.payload.type]: {
      ...state[action.payload.type],
      [action.payload.droppableId]: {
        ...state.dailyTasks[action.payload.droppableId],
        data: [...action.payload.result],
      },
    },
  }),
  [setProjectTasks]: (state, action) => ({
    ...state,
    projectTasks: {
      waiting: action.payload[1],
      doing: action.payload[0],
      closed: action.payload[2],
    },
  }),
  //   [setChiefs]: (state, action) => ({
  //     chiefs: action.payload,
  //   }),
  //   [setDailyFilteredTasks]: (state, action) => ({
  //     ...state,
  //     dailyTasks: {
  //       waiting: action.payload[1],
  //       doing: action.payload[0],
  //       closed: action.payload[2],
  //     },
  //   }),
  //   [setAssignedFilteredTasks]: (state, action) => ({
  //     ...state,
  //     assignedTasks: {
  //       waiting: action.payload[1],
  //       doing: action.payload[0],
  //       closed: action.payload[2],
  //     },
  //   }),
  //   [setDelayedFilteredTasks]: (state, action) => ({
  //     ...state,
  //     delayedTasks: {
  //       week: action.payload[0],
  //       month: action.payload[1],
  //       moreMonth: action.payload[2],
  //     },
  //   }),

  //   [setPagTaskProjects]: (state, action) => ({
  //     ...state,
  //     projectTasks: {
  //       waiting: {
  //         data: [...state.projectTasks.waiting.data, ...action.payload[1].data],
  //         count: action.payload[1].count,
  //         page: action.payload[1].page || null,
  //       },
  //       doing: {
  //         data: [...state.projectTasks.doing.data, ...action.payload[0].data],
  //         count: action.payload[0].count,
  //         page: action.payload[0].page || null,
  //       },
  //       closed: {
  //         data: [...state.projectTasks.closed.data, ...action.payload[2].data],
  //         count: action.payload[2].count,
  //         page: action.payload[2].page || null,
  //       },
  //     },
  //   }),
  //   [getFilteredTaskAction]: (state, action) => {
  //     const { status, data } = action.payload;
  //     if (status === 'daily') {
  //       return {
  //         ...state,
  //         dailyTasks: {
  //           waiting: {
  //             data: [...state.dailyTasks.waiting.data, ...data[1].data],
  //             count: data[1].count,
  //             page: data[1].page || null,
  //           },
  //           doing: {
  //             data: [...state.dailyTasks.doing.data, ...data[0].data],
  //             count: data[0].count,
  //             page: data[0].page || null,
  //           },
  //           closed: {
  //             data: [...state.dailyTasks.closed.data, ...data[2].data],
  //             count: data[2].count,
  //             page: data[2].page || null,
  //           },
  //         },
  //       };
  //     }
  //     if (status === 'assigned') {
  //       return {
  //         ...state,
  //         assignedTasks: {
  //           waiting: {
  //             data: [...state.dailyTasks.waiting.data, ...data[1].data],
  //             count: data[1].count,
  //             page: data[1].page || null,
  //           },
  //           doing: {
  //             data: [...state.dailyTasks.doing.data, ...data[0].data],
  //             count: data[0].count,
  //             page: data[0].page || null,
  //           },
  //           closed: {
  //             data: [...state.dailyTasks.closed.data, ...data[2].data],
  //             count: data[2].count,
  //             page: data[2].page || null,
  //           },
  //         },
  //       };
  //     }
  //     if (status === 'delayed') {
  //       return {
  //         ...state,
  //         delayedTasks: {
  //           month: {
  //             data: [...state.dailyTasks.waiting.data, ...data[1].data],
  //             count: data[1].count,
  //             page: data[1].page || null,
  //           },
  //           week: {
  //             data: [...state.dailyTasks.doing.data, ...data[0].data],
  //             count: data[0].count,
  //             page: data[0].page || null,
  //           },
  //           moreMonth: {
  //             data: [...state.dailyTasks.closed.data, ...data[2].data],
  //             count: data[2].count,
  //             page: data[2].page || null,
  //           },
  //         },
  //       };
  //     }
  //   },
  //   [getAllTasksAction]: (state, action) => ({
  //     dailyTasks: {
  //       waiting: action.payload.dailyTasks[1],
  //       doing: action.payload.dailyTasks[0],
  //       closed: action.payload.dailyTasks[2],
  //     },
  //     assignedTasks: {
  //       waiting: action.payload.assignedTasks[1],
  //       doing: action.payload.assignedTasks[0],
  //       closed: action.payload.assignedTasks[2],
  //     },
  //     delayedTasks: {
  //       week: action.payload.delayedTasks[0],
  //       month: action.payload.delayedTasks[1],
  //       moreMonth: action.payload.delayedTasks[2],
  //     },
  //   }),
  //   [changeStatusOnDragAction]: (state, action) => ({
  //     ...state,
  //     dailyTasks: {
  //       ...state.dailyTasks,
  //       [action.payload.source.id]: {
  //         ...state.dailyTasks[action.payload.source.id],
  //         count: state.dailyTasks[action.payload.source.id].count - 1,
  //         data: [...action.payload.source.data],
  //       },
  //       [action.payload.destination.id]: {
  //         ...state.dailyTasks[action.payload.destination.id],
  //         count: state.dailyTasks[action.payload.destination.id].count + 1,
  //         data: [...action.payload.destination.data],
  //       },
  //     },
  //   }),
  //   [reorderTasksAction]: (state, action) => ({
  //     ...state,
  //     dailyTasks: {
  //       ...state.dailyTasks,
  //       [action.payload.droppableId]: {
  //         ...state.dailyTasks[action.payload.droppableId],
  //         data: [...action.payload.result],
  //       },
  //     },
  //   }),
});
