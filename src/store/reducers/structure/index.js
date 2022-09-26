import { createReducer } from 'redux-starter-kit';
import {
  setStructures,
  structuresSectionHandle,
  structuresSearchHandle,
} from 'store/actions/structure';
import { apiStart, apiEnd } from 'store/actions/api';

export const structureReducer = createReducer(
  {
    structures: [],
    structureList: [],
    structuresFilteredData: [],
    query: '',
    isLoading: false,
  },
  {
    [apiStart]: (state, action) => {
      if (action.payload === 'structures') {
        return {
          ...state,
          isLoading: true,
        };
      }
    },
    [apiEnd]: (state, action) => {
      if (action.payload === 'structures') {
        return {
          ...state,
          isLoading: false,
        };
      }
    },
    [setStructures]: (state, action) => {
      const { query } = state;
      const { data } = action.payload;

      if (!query) {
        return {
          ...state,
          structures: data.filter(item => item.id !== 0),
          structureList: data,
          structuresFilteredData: data,
        };
      }

      const result = data.filter(item =>
        String(item.name)
          .toLowerCase()
          .includes(String(query).toLowerCase())
      );

      return {
        ...state,
        structures: data.filter(item => item.id !== 0),
        structureList: data,
        structuresFilteredData: result,
      };
    },

    [structuresSectionHandle]: (state, action) => {
      const query = action.payload;

      const { structureList } = state;

      if (!query) {
        return {
          ...state,
          structuresFilteredData: structureList,
          query: '',
        };
      }

      const result = structureList.filter(item =>
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
        structuresFilteredData: result,
        query,
      };
    },
    [structuresSearchHandle]: (state, action) => {
      const query = action.payload;

      const { structureList } = state;

      if (!query) {
        return {
          ...state,
          structuresFilteredData: structureList,
          query: '',
        };
      }

      const result = structureList.filter(item =>
        String(item.parentName)
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
        structuresFilteredData: result,
        query,
      };
    },
  }
);
