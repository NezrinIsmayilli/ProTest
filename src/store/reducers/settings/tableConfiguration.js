import { createReducer } from 'redux-starter-kit';
import {
    setTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { apiStart, apiEnd } from 'store/actions/api';

export const tableConfigurationReducer = createReducer(
    {
        tableConfiguration: [],
        query: '',
        isLoading: false,
    },
    {
        [apiStart]: (state, action) => {
            if (action.payload === 'tableConfiguration') {
                return {
                    ...state,
                    isLoading: true,
                };
            }
        },
        [apiEnd]: (state, action) => {
            if (action.payload === 'tableConfiguration') {
                return {
                    ...state,
                    isLoading: false,
                };
            }
        },
        [setTableConfiguration]: (state, action) => {
            const { data } = action.payload;
            return {
                ...state,
                tableConfiguration: data
            };
        },
    }
);
