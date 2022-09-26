import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setFaqs = createAction('setFaqs');
export const setFolders = createAction('setFolders');
export const setSubjects = createAction('setSubjects');
export const setSubjectsByFolder = createAction('setSubjectsByFolder');

export function fetchFAQs(props = {}) {
    const { filters, onSuccessCallback, onFailureCallback } = props;
    let query = filterQueryResolver({ ...filters });
    if (query.startsWith('&')) query = query.substring(1);
    return apiAction({
        url: `/faq?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setFaqs(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'faqs',
    });
}

export function fetchFolders(props = {}) {
    const { onSuccessCallback, onFailureCallback } = props;
    return apiAction({
        url: `/faq/folders`,
        onSuccess: data => dispatch => {
            dispatch(setFolders(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'faqs',
    });
}

export function addFolders(data, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/folders`,
        method: 'POST',
        data,
        onSuccess: () => dispatch => {
            dispatch(fetchFolders());
            onSuccessCallback();
        },
        onFailure: error => {
            onFailureCallback(error?.error.response?.data?.error?.message);
        },
        label: 'action',
        showErrorToast: false,
    });
}

export function editFolders(id, data, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/folders/${id}`,
        method: 'PUT',
        data,
        onSuccess: () => dispatch => {
            dispatch(fetchFolders());
            onSuccessCallback();
        },
        onFailure: error => {
            onFailureCallback(error?.error.response?.data?.error?.message);
        },
        label: 'action',
        showToast: true,
        showErrorToast: false,
    });
}

export function deleteFolders(id) {
    return apiAction({
        url: `/faq/folders/${id}`,
        method: 'DELETE',
        onSuccess: fetchFolders,
        label: 'action',
        showToast: true,
    });
}

export function moveFolders(data, onSuccessCallback, onFailureCallback) {
    const { id, positionAfter } = data;
    return apiAction({
        url: `/faq/folders/${id}/move`,
        method: 'PUT',
        data: { positionAfter },
        onSuccess: () => {
            onSuccessCallback();
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'movingAction',
        showErrorToast: false,
    });
}

export function fetchSubjects(filters, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/subjects?${filters}`,
        onSuccess: data => dispatch => {
            dispatch(setSubjects(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'action',
    });
}

export function getSubjects(id, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/subjects/${id}`,
        onSuccess: data => dispatch => {
            dispatch(setSubjectsByFolder(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'action',
        showToast: false,
        showErrorToast: false,
    });
}

export function addSubjects(data, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/subjects`,
        method: 'POST',
        data,
        onSuccess: () => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback());
        },
        onFailure: error => {
            onFailureCallback(error?.error.response?.data?.error?.message);
        },
        label: 'action',
        showErrorToast: false,
    });
}

export function editSubjects(id, data, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/subjects/${id}`,
        method: 'PUT',
        data,
        onSuccess: () => {
            fetchFolders();
            onSuccessCallback();
        },
        onFailure: error => {
            onFailureCallback(error?.error.response?.data?.error?.message);
        },
        label: 'action',
        showToast: true,
        showErrorToast: false,
    });
}

export function deleteSubjects(id, onSuccessCallback) {
    return apiAction({
        url: `/faq/subjects/${id}`,
        method: 'DELETE',
        onSuccess: () => {
            if (onSuccessCallback) onSuccessCallback();
        },
        label: 'action',
        showToast: true,
    });
}

export function moveSubjects(data, onSuccessCallback, onFailureCallback) {
    const { id, positionAfter } = data;
    return apiAction({
        url: `/faq/subjects/${id}/move`,
        method: 'PUT',
        data: { positionAfter },
        onSuccess: () => {
            onSuccessCallback();
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'movingAction',
        showErrorToast: false,
    });
}

export function fetchQuestions(filters, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/questions?${filters}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'questionsAction',
    });
}

export function addQuestions(data, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/questions`,
        method: 'POST',
        data,
        onSuccess: () => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback());
        },
        onFailure: error => {
            onFailureCallback(error?.error.response?.data?.error?.message);
        },
        label: 'action',
        showErrorToast: false,
    });
}

export function editQuestions(id, data, onSuccessCallback, onFailureCallback) {
    return apiAction({
        url: `/faq/questions/${id}`,
        method: 'PUT',
        data,
        onSuccess: () => {
            fetchFolders();
            onSuccessCallback();
        },
        onFailure: error => {
            onFailureCallback(error?.error.response?.data?.error?.message);
        },
        label: 'action',
        showToast: true,
        showErrorToast: false,
    });
}

export function deleteQuestions(id, onSuccessCallback) {
    return apiAction({
        url: `/faq/questions/${id}`,
        method: 'DELETE',
        onSuccess: () => {
            if (onSuccessCallback) onSuccessCallback();
        },
        label: 'action',
        showToast: true,
    });
}

export function moveQuestions(data, onSuccessCallback, onFailureCallback) {
    const { id, positionAfter } = data;
    return apiAction({
        url: `/faq/questions/${id}/move`,
        method: 'PUT',
        data: { positionAfter },
        onSuccess: () => {
            onSuccessCallback();
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        label: 'movingAction',
        showErrorToast: false,
    });
}
