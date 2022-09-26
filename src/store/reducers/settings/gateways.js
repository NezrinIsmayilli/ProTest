import { createReducer } from 'redux-starter-kit';
import { setGateways } from 'store/actions/settings/gateways';
import { apiStart, apiEnd } from 'store/actions/api';

const initialState = {
    gateways: [],
    isLoading: false,
    actionLoading: false,
    // unused
    added: false,
    edited: false,
};

export const GatewaysReducer = createReducer(initialState, {
    [apiStart]: (state, action) => {
        if (action.payload === 'fetchGateways') {
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
    },
    [apiEnd]: (state, action) => {
        if (action.payload === 'fetchGateways') {
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
    },
    [setGateways]: (state, action) => ({
        ...initialState,
        gateways: action.payload.data,
        added: action.payload.attribute === 'added',
        edited: action.payload.attribute === 'edited',
    }),
});
