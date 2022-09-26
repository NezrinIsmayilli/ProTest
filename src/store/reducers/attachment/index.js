import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
  setFileUrl,
  setUploadedFileInfo,
  setThumbFileUrl,
} from 'store/actions/attachment';

const initialState = {
  isLoading: false,
  fileUrl: undefined,
  fileThumbUrl: undefined,
  uploadedFileInfo: {},
};

export const attachmentReducer = createReducer(initialState, {
  [apiStart]: (state, action) => {
    if (action.payload === 'attachment') {
      return {
        ...state,
        isLoading: true,
      };
    }
  },

  [apiEnd]: (state, action) => {
    if (action.payload === 'attachment') {
      return {
        ...state,
        isLoading: false,
      };
    }
  },

  [setFileUrl]: (state, action) => {
    return ({
      ...state,
      fileUrl: action.payload.url,
    })
  },

  [setThumbFileUrl]: (state, action) => ({
    ...state,
    fileThumbUrl: action.payload.data,
  }),

  [setUploadedFileInfo]: (state, action) => ({
    ...state,
    uploadedFileInfo: action.payload.data,
  }),
});
