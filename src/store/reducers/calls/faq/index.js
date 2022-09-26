import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
    setFaqs,
    setFolders,
    setSubjects,
    setSubjectsByFolder,
} from 'store/actions/calls/faq';

const initialState = {
    faqs: [],
    folders: [],
    subjects: [],
    subjectsByFolder: [],
    questions: [],
    isLoading: false,
    actionLoading: false,
    movingsLoading: false,
    questionsLoading: false,
};

export const FaqReducer = createReducer(initialState, {
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

    [setFaqs]: (state, action) => ({
        ...state,
        faqs: action.payload.data,
    }),
    [setFolders]: (state, action) => ({
        ...state,
        folders: action.payload.data,
    }),
    [setSubjects]: (state, action) => ({
        ...state,
        subjects: action.payload.data,
    }),
    [setSubjectsByFolder]: (state, action) => ({
        ...state,
        subjectsByFolder: action.payload.data,
    }),
});
