import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

const baseUrl = '/sales/invoices';
export const setMaterialList = createAction('setMaterialList');
export const setProductionExpensesList = createAction(
  'setProductionExpensesList'
);
export const setProductionProductOrder = createAction(
  'setProductionProductOrder'
);

export function fetchProductionInfo({ id, onSuccess, attribute = {} }) {
  return apiAction({
    url: `/sales/invoices/invoice/${id}`,
    onSuccess,
    attribute,
    label: 'productionInfo',
  });
}

export function fetchProductionExpense({ id, onSuccess, attribute = {} }) {
  return apiAction({
    label: 'fetchProductionExpense',
    url: `${baseUrl}/production/production-expense/${id}`,
    onSuccess,
    attribute,
  });
}
export function fetchProductionEmployeeExpense({
  id,
  onSuccess,
  attribute = {},
}) {
  return apiAction({
    label: 'fetchProductionEmployeeExpense',
    url: `${baseUrl}/production/production-employment-expense/${id}`,
    onSuccess,
    attribute,
  });
}
export function fetchProductionMaterialExpense({
  id,
  onSuccess,
  attribute = {},
}) {
  return apiAction({
    label: 'fetchProductionMaterialExpense',
    url: `${baseUrl}/production/production-material-expense/${id}`,
    onSuccess,
    attribute,
  });
}
export function fetchMaterialList({
  filters: { ...filters },
  attribute = {},
  onSuccess,
}) {
  if (onSuccess === undefined) {
    onSuccess = setMaterialList;
  }
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);
  return apiAction({
    url: `${baseUrl}?${query}`,
    onSuccess,
    attribute,
    label: 'fetchMaterialList',
  });
}
export function fetchProductionExpensesList({
  filters: { ...filters },
  attribute = {},
  onSuccess,
}) {
  if (onSuccess === undefined) {
    onSuccess = setProductionExpensesList;
  }
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transactions?${query}`,
    onSuccess,
    attribute,
    label: 'fetchProductionExpensesList',
  });
}
export function createProductionExpense(props) {
  const { data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'createProductionExpense',
    url: `${baseUrl}/production/production-expense`,
    method: 'POST',
    showToast: false,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function createProductionEmployeeExpense(props) {
  const { data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'createProductionEmployeeExpense',
    url: `${baseUrl}/production/production-employment-expense`,
    method: 'POST',
    showToast: false,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function createProductionMaterialExpense(props) {
  const { data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'createProductionMaterialExpense',
    url: `${baseUrl}/production/production-material-expense`,
    method: 'POST',
    showToast: false,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function transferProduction(props) {
  const { id, data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'transferProduction',
    url: `${baseUrl}/production/transfer-old/${id}`,
    method: 'PUT',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export function editTransferProduction(props) {
  const { id, data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'editTransferProduction',
    url: `${baseUrl}/production/transfer/${id}`,
    method: 'PUT',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function editDateAndWarehouseTransfer(props) {
  const { id, data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'editDateAndWarehouseTransfer',
    url: `${baseUrl}/production/stock-and-operation-date/${id}`,
    method: 'PUT',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function editProductionCost(props) {
  const { id, data, onSuccessCallback, onFailureCallback } = props;

  return apiAction({
    data,
    label: 'editProductionCost',
    url: `${baseUrl}/production/product-prices-cost/${id}`,
    method: 'PUT',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}

export function deleteOperation(id, deletionReason, callBack, deleteRelatedOperations=0) {
  return apiAction({
    url: `/sales/invoices/${id}?deleteReason=${deletionReason}&deleteRelatedOperations=${deleteRelatedOperations}`,
    method: 'DELETE',
    onSuccess: callBack,
    label: 'deleteProductionOperations',
  });
}

export function fetchProductionProductOrder(props = {}) {
  const { filters = {}, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/orders/production-invoice-products?${query}`,
    label: 'fetchProductionProductOrder',
    onSuccess: data => dispatch => {
      dispatch(setProductionProductOrder(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
export const createProductionProductOrder = (props = {}) => {
  const { data, onSuccessCallback, onFailureCallback } = props;
  return apiAction({
    url: `/orders/production-invoice-products`,
    method: 'POST',
    data,
    label: 'createProductionProductOrder',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
export function deleteProductionProductOrder(id, onSuccess) {
  return apiAction({
    url: `/orders/production-invoice-products/${id}`,
    method: 'DELETE',
    label: 'deleteProductionProductOrder',
    onSuccess,
  });
}
