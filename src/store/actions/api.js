import { createAction } from 'redux-starter-kit';

export const apiStart = createAction('apiStart');
export const apiEnd = createAction('apiEnd');

export const accessDenied = createAction('accessDenied');

export const apiError = createAction('apiError');

export const apiStartHandle = label => (state, action) => {
  if (action.payload === label) {
    return {
      ...state,
      isLoading: true,
    };
  }
};

export const apiEndHandle = label => (state, action) => {
  if (action.payload === label) {
    return {
      ...state,
      isLoading: false,
    };
  }
};
