import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setConversations = createAction('setConversations');
export const setMessages = createAction('setMessages');
export const setMessagesCount = createAction('setMessagesCount');

const url =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PROCALL
        : process.env.REACT_APP_DEV_API_URL_PROCALL;

export function fetchConversations(props = {}) {
    const { onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/omni/conversations`,
        onSuccess: data => dispatch => {
            dispatch(setConversations(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'conversations',
    });
}

export function updateConversation(props = {}) {
    const { id, status, onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/omni/conversations/${id}`,
        method: 'PUT',
        data: { status },
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'converstationAction',
    });
}

export function fetchMessages(props = {}) {
    const { id, page, limit, onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/omni/conversations/${id}/messages?orderBy[createdAt]=desc&limit=${limit *
            page}`,
        onSuccess: data => dispatch => {
            dispatch(setMessages(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'messagesLoading',
    });
}

export function fetchMessagesCount(props = {}) {
    const { id, onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `${url}/omni/conversations/${id}/messages/count`,
        onSuccess: data => dispatch => {
            dispatch(setMessagesCount(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'action',
    });
}

export function sendMessage(props = {}) {
    const {
        conversation,
        message,
        onSuccessCallback,
        onFailureCallback,
    } = props;

    return apiAction({
        url: `${url}/omni/messages/send`,
        method: 'POST',
        data: {
            conversation,
            message,
        },
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
}

export function getFacebookContact(props = {}) {
    const { id, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        url: `${url}/omni/channels/facebook/users/${id}`,
        method: 'GET',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
}