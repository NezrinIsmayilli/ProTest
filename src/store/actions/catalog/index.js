import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver, ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

export const setCatalogs = createAction('setCatalogs');
export const setFilteredCatalogs = createAction('setFilteredCatalogs');
export const setCatalog = createAction('setCatalog');
export const setRootEditMode = createAction('setRootEditMode');
export const filterCatalogs = createAction('filterCatalogs');

export function fetchCatalogs({
  attribute,
  query,
  onSuccessCallback = () => {},
} = {}) {
  return apiAction({
    url: `/sales/product/catalogs?limit=1000&q=${query || ''}`,
    onSuccess: data => dispatch => {
      dispatch(setCatalogs(data));
      onSuccessCallback(data);
    },
    attribute,
    label: 'catalogs',
  });
}
export function fetchFilteredCatalogs(filters, onSuccessCallback) {
  const query = filterQueryResolver(filters);
  const url = `/sales/product/catalogs?${query}`;

  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback !== undefined) {
        onSuccessCallback(data);
      } else {
        dispatch(setFilteredCatalogs(data));
      }
    },
    label: 'catalogs',
  });
}

export function fetchCatalog(id) {
  return apiAction({
    url: `/sales/product/catalogs/${id}`,
    onSuccess: setCatalog,
    label: 'catalogs',
  });
}

export function createCatalog(
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: '/sales/product/catalogs',
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

export function editCatalog(
  id,
  data,
  onSuccess = () => {},
  onFailure = () => {}
) {
  return apiAction({
    url: `/sales/product/catalogs/${id}`,
    onSuccess: params => dispatch => {
      dispatch(fetchCatalogs(params));
      dispatch(onSuccess(data));
    },
    onFailure,
    method: 'PUT',
    data,
    showToast: true,
    attribute: 'edited',
    label: 'action',
  });
}

export function deleteCatalog(id) {
  return apiAction({
    url: `/sales/product/catalogs/${id}`,
    method: 'DELETE',
    onSuccess: fetchCatalogs,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'catalogs',
  });
}
