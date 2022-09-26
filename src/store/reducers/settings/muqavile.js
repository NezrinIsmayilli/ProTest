import { createReducer } from 'redux-starter-kit';
import { setContractTypes } from 'store/actions/settings/muqavile';
import { apiStart, apiEnd } from 'store/actions/api';

export const muqavileTypesReducer = createReducer(
  {
    data: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'contractTypes') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'contractTypes') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setContractTypes]: (state, action) => ({
      data: action.payload.data,
    }),
  }
);
