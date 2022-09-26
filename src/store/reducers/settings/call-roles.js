import { createReducer } from 'redux-starter-kit';
import {
    setCallRoles,
    setOrderRegulations,
} from 'store/actions/settings/call-roles';

export const callRolesReducer = createReducer(
    {
        operators: [],
        supervisors: [],
        executors: [],
        stageRoles: {},
    },
    {
        [setCallRoles]: (state, action) => ({
            ...state,
            operators: action.payload.data[1],
            supervisors: action.payload.data[2],
            executors: action.payload.data[3],
        }),

        [setOrderRegulations]: (state, action) => ({
            ...state,
            stageRoles: action.payload.data,
        }),
    }
);
