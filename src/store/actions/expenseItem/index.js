import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

export const setExpenseItem = createAction('setExpenseItem');
export const setExpenseItems = createAction('setExpenseItems');
export const setExpenseCatalogs = createAction('setExpenseCatalogs');
export const setExpenseEditMode = createAction('setExpenseEditMode');
export const setExpenseCatalogId = createAction('setExpenseCatalogId');
export const setExpenseCatalogsWithItems = createAction(
  'setExpenseCatalogsWithItems'
);
export const setExpenseItemsByCatalogId = createAction(
  'setExpenseItemsByCatalogId'
);

export function fetchExpenseItemByCatalogId(
  { attribute },
  callBack = () => {}
) {
  return apiAction({
    url: `/transaction/item/${attribute}`,
    onSuccess: data => dispatch => {
      dispatch(setExpenseItems(data));
      callBack(data);
    },
    attribute,
    label: 'ExpenseItems',
  });
}

export function fetchExpenseItem({ id, editMode = false }) {
  return apiAction({
    url: `/transaction/item/${id}`,
    onSuccess: setExpenseItem,
    attribute: { id, editMode },
    label: 'ExpenseItems',
  });
}

export function fetchExpenseItems({ attribute, query }) {
  return apiAction({
    url: `/sales/expense/items/${attribute}?q=${query || ''}`,
    onSuccess: setExpenseItems,
    attribute,
    label: 'ExpenseItems',
  });
}
export function fetchExpenseCatalogs(filters = {}, onSuccessCallback) {
  return apiAction({
    url: `/transaction/catalog/with-items?deletableOnly=1`,
    onSuccess: data => dispatch => {
      dispatch(setExpenseCatalogsWithItems(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    label: 'expenseCatalogs',
  });
}

export function updateExpenseItem(
  id,
  data,
  onSuccessCallback,
  onFailureCallback
) {
  const url = id ? `/transaction/item/${id}` : '/transaction/item';
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) {
        dispatch(onSuccessCallback(data));
      }
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) {
        dispatch(onFailureCallback(error));
      }
    },
    method: id ? 'PUT' : 'POST',
    data,
    showToast: true,
    showErrorToast: false,
    label: id ? 'createExpenseItem' : 'editExpenseItem',
  });
}

export function deleteExpenseItem(id, callback) {
  return apiAction({
    url: `/transaction/item/${id}`,
    method: 'DELETE',
    onSuccess: data => dispatch => {
      if (callback) {
        dispatch(callback(data));
      }
    },
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'deleteExpenseItem',
  });
}
