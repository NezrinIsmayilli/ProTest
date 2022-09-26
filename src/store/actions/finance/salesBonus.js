import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setBonusConfiguration = createAction('setBonusConfiguration');
export const resetConfiguration = createAction('resetConfiguration');
export const setIsEditible = createAction('setIsEditible');
export const setSelectedConfiguration = createAction(
  'setSelectedConfiguration'
);
export const setSelectedProductConfiguration = createAction(
  'setSelectedProductConfiguration'
);
export const setProductConfiguration = createAction('setProductConfiguration');
export const setEmployeeBonuses = createAction('setEmployeeBonuses');
export const setSelectedEmployeeBonuses = createAction(
  'setSelectedEmployeeBonuses'
);

export const fetchBonusConfigurations = () =>
  apiAction({
    url: '/finance/sales-bonus/configuration',
    onSuccess: setBonusConfiguration,
    label: 'fetchBonusConfigurations',
  });

export const createBonusConfiguration = (
  data,
  successCallback,
  onFailureCallback
) =>
  apiAction({
    url: '/finance/sales-bonus/configuration',
    method: 'POST',
    data,
    onSuccess: response => dispatch => {
      dispatch(successCallback(response));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'createBonusConfiguration',
    showErrorToast: false,
  });

export const editBonusConfiguration = (
  id,
  data,
  successCallback,
  onFailureCallback
) =>
  apiAction({
    url: `/finance/sales-bonus/configuration/${id}`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'editBonusConfiguration',
    showErrorToast: false,
  });

export const deleteBonusConfigurationById = (
  id,
  successCallback,
  failureCallback
) =>
  apiAction({
    url: `/finance/sales-bonus/configuration/${id}`,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: () => () => {
      failureCallback();
    },
    method: 'DELETE',
    label: 'deleteBonusConfigurationById',
  });

export const createProductConfiguration = (
  data,
  successCallback,
  onFailureCallback
) =>
  apiAction({
    url: '/finance/sales-bonus/configuration/product-bonus',
    method: 'POST',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    showErrorToast: false,
    label: 'createProductConfiguration',
  });

export const editProductConfiguration = (
  id,
  data,
  successCallback,
  onFailureCallback
) =>
  apiAction({
    url: `/finance/sales-bonus/configuration/product-bonus/${id}`,
    method: 'PUT',
    data,
    onSuccess: () => () => {
      successCallback();
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    showErrorToast: false,
    label: 'editProductConfiguration',
  });

export const fetchProductConfiguration = props => {
  const { filters = {} } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/finance/sales-bonus/configuration/product-bonus/tree?${query}`,
    onSuccess: setProductConfiguration,
    label: 'fetchProductConfiguration',
  });
};

export const deleteProductConfiguration = (id, successCallback) =>
  apiAction({
    url: `/finance/sales-bonus/configuration/product-bonus/${id}`,
    method: 'DELETE',
    onSuccess: () => () => {
      successCallback();
    },
    label: 'deleteProductConfiguration',
  });
export function fetchEmployeeBonuses(props) {
  const { filters, year, month, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label: 'fetchEmployeeBonuses',
    url: `/finance/sales-bonus/employee-configuration/${year}/${month}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setEmployeeBonuses(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function fetchSelectedEmployeeBonus(props) {
  const {
    filters,
    id,
    year,
    month,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    label: 'fetchSelectedEmployeeBonus',
    url: `/finance/sales-bonus/employee-configuration/${id}/${year}/${month}?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setSelectedEmployeeBonuses(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    showErrorToast: false,
  });
}

export function createEmployeeConfiguration(props) {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `/finance/sales-bonus/employee-configuration`,
    method: 'POST',
    data,
    showErrorToast: false,
    label: 'createEmployeeConfiguration',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export const addManualBonus = (data, onSuccess = () => {}) =>
  apiAction({
    url: `/hrm/sales-bonus/manual-bonus-amount`,
    method: 'PUT',
    data,
    onSuccess,
    label: 'manualBonus',
  });
export const applyManualBonus = (data, onSuccess = () => {}) =>
  apiAction({
    url: `/hrm/sales-bonus/apply-to-salary`,
    method: 'PUT',
    data,
    onSuccess,
    label: 'applyManualBonus',
  });
export const deleteBonusConfiguration = (id, successCallback) =>
  apiAction({
    url: `/finance/sales-bonus/employee-configuration/${id}`,
    method: 'DELETE',
    onSuccess: () => () => {
      successCallback();
    },
    label: 'deleteBonusConfiguration',
  });
