import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import { setOffline } from 'store/actions/calls/fop';

const initialState = {
    offlineOperators: [],
    isLoading: false,
};

export const FopReducer = createReducer(initialState, {
    [apiStart]: (state, action) => {
        if (action.payload === 'faqs') {
            return {
                ...state,
                isLoading: true,
            };
        }
        if (action.payload === 'action') {
            return {
                ...state,
                actionLoading: true,
            };
        }
        if (action.payload === 'questionsAction') {
            return {
                ...state,
                questionsLoading: true,
            };
        }
        if (action.payload === 'movingAction') {
            return {
                ...state,
                movingsLoading: true,
            };
        }
    },
    [apiEnd]: (state, action) => {
        if (action.payload === 'faqs') {
            return {
                ...state,
                isLoading: false,
            };
        }
        if (action.payload === 'action') {
            return {
                ...state,
                actionLoading: false,
            };
        }
        if (action.payload === 'questionsAction') {
            return {
                ...state,
                questionsLoading: false,
            };
        }
        if (action.payload === 'movingAction') {
            return {
                ...state,
                movingsLoading: false,
            };
        }
    },

    [setOffline]: (state, action) => ({
        ...state,
        offlineOperators: action.payload.data,
    }),
});
