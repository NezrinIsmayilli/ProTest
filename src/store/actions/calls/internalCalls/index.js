import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setInternalCalls = createAction('setInternalCalls');
export const setCallOperators = createAction('setCallOperators');
export const setUsedCallOperators = createAction('setUsedCallOperators');
export const setUsedCallContacts = createAction('setUsedCallContacts');
export const setCallCount = createAction('setCallCount');
export const setSelectedCall = createAction('setSelectedCall');
export const setSelectedCallParticipant = createAction(
	'setSelectedCallParticipant'
);
const url =
	process.env.NODE_ENV === 'production'
		? process.env.REACT_APP_API_URL_PROCALL
		: process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchInternalCalls(props = {}) {
	const {
		filters,
		onSuccessCallback,
		onFailureCallback,
		label = 'internalCalls',
	} = props;
	const query = filterQueryResolver(filters);
	return apiAction({
		url: `${url}/calls?${query}`,
		onSuccess: data => dispatch => {
			dispatch(setInternalCalls(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label,
	});
}
export function fetchSelectedCall(props = {}) {
	const { id, onSuccessCallback, onFailureCallback } = props;

	return apiAction({
		url: `${url}/calls/${id}`,
		onSuccess: data => dispatch => {
			dispatch(setSelectedCall(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'selectedCall',
	});
}
export function fetchSelectedCallParticipant(props = {}) {
	const { id, onSuccessCallback, onFailureCallback } = props;

	return apiAction({
		url: `${url}/calls/${id}/participants`,
		onSuccess: data => dispatch => {
			dispatch(setSelectedCallParticipant(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'selectedCallParticipant',
	});
}
export function updateCall(props = {}) {
	const { id, data, onSuccessCallback, onFailureCallback } = props;

	return apiAction({
		method: 'PUT',
		url: `${url}/calls/${id}`,
		data,
		onSuccess: data => dispatch => {
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'updateCall',
	});
}
export function getTotalCallCount(props = {}) {
	const { filters, onSuccess } = props;
	const query = filterQueryResolver(filters);
	return apiAction({
		url: `${url}/calls/count?${query}`,
		label: 'call',
		onSuccess: data => dispatch => {
			if (onSuccess !== undefined) {
				onSuccess(data);
			} else {
				dispatch(setCallCount(data?.data?.count));
			}
		},
		attribute: {},
	});
}
export function fetchInternalCallsRecording(props = {}) {
	const { id, onSuccessCallback, onFailureCallback } = props;
	return apiAction({
		url: `${url}/recordings/${id}/download`,
		onSuccess: data => dispatch => {
			// dispatch(setInternalCalls(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'internalCallsRecording',
	});
}

export function fetchCallOperators(props = {}) {
	const { onSuccessCallback, onFailureCallback } = props;
	return apiAction({
		url: `${url}/operators`,
		onSuccess: data => dispatch => {
			dispatch(setCallOperators(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'fetchCallOperators',
	});
}
export function fetchUsedCallOperators(props = {}) {
	const { onSuccessCallback, onFailureCallback } = props;
	return apiAction({
		url: `${url}/calls/operators`,
		onSuccess: data => dispatch => {
			dispatch(setUsedCallOperators(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'fetchUsedCallOperators',
	});
}
export function fetchUsedCallContacts(props = {}) {
	const { onSuccessCallback, onFailureCallback } = props;
	return apiAction({
		url: `${url}/calls/prospect-contacts`,
		onSuccess: data => dispatch => {
			dispatch(setUsedCallContacts(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'fetchUsedCallContacts',
	});
}
