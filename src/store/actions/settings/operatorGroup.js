import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const setOperatorGroup = createAction('setOperatorGroup');
const url =
	process.env.NODE_ENV === 'production'
		? process.env.REACT_APP_API_URL_PROCALL
		: process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchOperatorGroup(props = {}) {
	const { onFailureCallback, onSuccessCallback } = props;
	return apiAction({
		url: `${url}/callcenters`,
		onSuccess: data => dispatch => {
			dispatch(setOperatorGroup(data));
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'fetchOperatorGroup',
	});
}
export function fetchSelectedOperatorGroup(props = {}) {
	const { id, onFailureCallback, onSuccessCallback } = props;
	return apiAction({
		url: `${url}/callcenters/${id}`,
		onSuccess: data => dispatch => {
			if (onSuccessCallback) dispatch(onSuccessCallback(data));
		},
		onFailure: error => dispatch => {
			if (onFailureCallback) dispatch(onFailureCallback(error));
		},
		label: 'fetchSelectedOperatorGroup',
	});
}

export function editOperatorGroup(
	id,
	data,
	onSuccess = () => { },
	onFailure = () => { }
) {
	return apiAction({
		url: `${url}/callcenters/${id}`,
		onSuccess: params => dispatch => {
			dispatch(onSuccess(data));
		},
		onFailure,
		method: 'PUT',
		data,
		showToast: true,
		showErrorToast: false,
		attribute: 'edited',
		label: 'action',
	});
}
export function createOperatorGroup(
	data,
	onSuccess = () => { },
	onFailure = () => { }
) {
	return apiAction({
		url: `${url}/callcenters`,
		onSuccess,
		onFailure,
		method: 'POST',
		data,
		showToast: false,
		showErrorToast: false,
		attribute: 'added',
		label: 'action',
	});
}
export function deleteOperatorGroup({ id, onFailureCallback }) {
	return apiAction({
		url: `${url}/callcenters/${id}`,
		method: 'DELETE',
		onSuccess: fetchOperatorGroup,
		onFailure: ({ error }) => {
			if (onFailureCallback) {
				onFailureCallback(error);
			}
		},
		showToast: true,
		showErrorToast: false,
		label: 'operatorGroup',
	});
}
