import { createReducer } from 'redux-starter-kit';
import {
  setPositions,
  positionsSearchHandle,
} from 'store/actions/settings/vezifeler';
import { apiStart, apiEnd } from 'store/actions/api';

export const vezifelerReducer = createReducer(
  {
    data: [],
    query: '',
    positionsFilteredData: [],
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'occupations') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'occupations') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setPositions]: (state, action) => {
      const { query } = state;
      const { data } = action.payload;

      if (!query) {
        return {
          ...state,
          data,
          positionsFilteredData: data,
        };
      }

      const result = data.filter(item =>
        String(item.name)
          .toLowerCase()
          .includes(String(query).toLowerCase())
      );

      return {
        ...state,
        data,
        positionsFilteredData: result,
      };
    },
    [positionsSearchHandle]: (state, action) => {
      const query = action.payload;

      const { data } = state;

      if (!query) {
        return {
          ...state,
          positionsFilteredData: data,
          query: '',
        };
      }

      const result = data.filter(item =>
        String(item.name)
          .replace('İ', 'I')
          .toLowerCase()
          .includes(
            String(query)
              .replace('İ', 'I')
              .toLowerCase()
          )
      );

      return {
        ...state,
        positionsFilteredData: result,
        query,
      };
    },
  }
);
