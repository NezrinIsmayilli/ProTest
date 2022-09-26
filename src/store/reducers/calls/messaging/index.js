import { createReducer } from 'redux-starter-kit';
import { apiStart, apiEnd } from 'store/actions/api';
import {
    setConversations,
    setMessages,
    setMessagesCount,
} from 'store/actions/calls/messaging';

const initialState = {
    conversations: [],
    messages: [],
    messagesCount: 0,
    isLoading: false,
    actionLoading: false,
    messagesLoading: false,
    converstationLoading: false,
};

export const MessagingReducer = createReducer(initialState, {
    [apiStart]: (state, action) => {
        if (action.payload === 'conversations') {
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
        if (action.payload === 'messagesLoading') {
            return {
                ...state,
                messagesLoading: true,
            };
        }
        if (action.payload === 'converstationAction') {
            return {
                ...state,
                converstationLoading: true,
            };
        }
    },
    [apiEnd]: (state, action) => {
        if (action.payload === 'conversations') {
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
        if (action.payload === 'messagesLoading') {
            return {
                ...state,
                messagesLoading: false,
            };
        }
        if (action.payload === 'converstationAction') {
            return {
                ...state,
                converstationLoading: false,
            };
        }
    },

    [setConversations]: (state, action) => ({
        ...state,
        conversations: action.payload.data,
    }),
    [setMessages]: (state, action) => ({
        ...state,
        messages: action.payload.data,
    }),
    [setMessagesCount]: (state, action) => ({
        ...state,
        messagesCount: action.payload.data.count,
    }),
});
