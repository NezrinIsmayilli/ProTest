import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver, ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

export const setExpenseCatalogs = createAction('setExpenseCatalogs');
export const setExpenseCatalog = createAction('setExpenseCatalog');
export const setExpenseCatalogRootEditMode = createAction(
  'setExpenseCatalogRootEditMode'
);
export const filterExpenseCatalogs = createAction('filterExpenseCatalogs');

export function fetchExpenseCatalogs({ filters } = {}, { attribute } = {}) {
  const query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/expense/catalogs?${query}`,
    onSuccess: setExpenseCatalogs,
    attribute,
    label: 'expenseCatalog',
  });
}

// api - to do
export function fetchExpenseCatalog(id) {
  return apiAction({
    url: `/sales/expense/catalogs/${id}`,
    onSuccess: setExpenseCatalog,
    label: 'expenseCatalog',
  });
}

export function updateExpenseCatalog(
  id,
  data,
  onSuccessCallback,
  onFailureCallback
) {
  const url = id ? `/transaction/catalog/${id}` : '/transaction/catalog';
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
    label: id ? 'editExpenseCatalog' : 'createExpenseCatalog',
  });
}

export function deleteExpenseCatalog(id, callback) {
  return apiAction({
    url: `/transaction/catalog/${id}`,
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
    label: 'deleteExpenseCatalog',
  });
}

// -----
export function fetchCatalogs(
  { filters } = {},
  { attribute } = {},
  callBack = setExpenseCatalogs
) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/transaction/catalog?${query}`,
    onSuccess: callBack,
    attribute,
    label: 'expenseCatalog',
  });
}
