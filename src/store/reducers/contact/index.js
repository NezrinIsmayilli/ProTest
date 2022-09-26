import { createReducer } from 'redux-starter-kit';
import { setContacts } from 'store/actions/contact';
import { apiStart, apiEnd } from 'store/actions/api';

export const contactReducer = createReducer(
    {
        contacts: [],
        isLoading: false,
    },
    {
        [apiStart]: (state, action) => {
            if (action.payload === 'contacts') {
                return {
                    ...state,
                    isLoading: true,
                };
            }
        },
        [apiEnd]: (state, action) => {
            if (action.payload === 'contacts') {
                return {
                    ...state,
                    isLoading: false,
                };
            }
        },
        [setContacts]: (state, action) => ({
            ...state,
            contacts: action.payload.data,
        }),
    }
);
