import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setProduct = createAction('setProduct');
export const setdataId = createAction('setdataId');
export const setProducts = createAction('setProducts');
export const setProductsExtended = createAction('setProductsExtended');
export const setEditMode = createAction('setEditMode');
export const setCatalogId = createAction('setCatalogId');
export const setProductCount = createAction('setProductCount');
export const resetProduct = createAction('resetProduct');

export function fetchProduct({ id, editMode = false }) {
    return apiAction({
        url: `/sales/product/${id}`,
        onSuccess: setProduct,
        attribute: { id, editMode },
        label: 'products',
    });
}

export function getProduct(id, onSuccess = () => {}, onFailure = () => {}) {
    return apiAction({
        url: `/sales/product/${id}`,
        onSuccess: data => dispatch => dispatch(onSuccess(data)),
        onFailure,
        label: 'products',
    });
}

export function getProductComposition(
    id,
    onSuccess = () => {},
    onFailure = () => {}
) {
    return apiAction({
        url: `/sales/products/materials/${id}`,
        onSuccess: data => dispatch => dispatch(onSuccess(data)),
        onFailure,
        label: 'products',
    });
}

export function fetchProducts({ filters, callback, attribute = {} }) {
    let query = filterQueryResolver(filters);
    if (query.startsWith('&')) query = query.substring(1);
    return apiAction({
        url: `/sales/products?${query}`,
        onSuccess: data => dispatch => {
            dispatch(setProducts(data));
            if (callback) dispatch(callback(data));
        },
        attribute,
        label: 'products',
    });
}

export function fetchProductsExtended({ attribute }) {
    return apiAction({
        url: `/sales/products/extended/${attribute}`,
        onSuccess: setProductsExtended,
        attribute,
        label: 'products',
    });
}

export function fetchProductsInStok({ attribute }) {
    return apiAction({
        // url: `/sales/products/extended/${attribute}`,
        // url: `sales/invoices/sales/products/${catalogId}/${stockId}`,
        onSuccess: setProductsExtended,
        attribute,
        label: 'products',
    });
}

export function fetchProductCount({
    filter,
    onSuccess = setProductCount,
}) {
    let query = filterQueryResolver(filter);
    if (query.startsWith('&')) query = query.substring(1);

    return apiAction({
        url: `/sales/products/count?${query}`,
        // url: `sales/invoices/sales/products/${catalogId}/${stockId}`,
        onSuccess,
        label: 'productsCount',
    });
}

export function createProduct(data, onSuccessCallback, onFailure = () => {}) {
    return apiAction({
        url: '/sales/products',

        onSuccess: data => dispatch => {
            dispatch(setdataId(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        method: 'POST',
        data,
        onFailure,
        showToast: false,
        showErrorToast: false,
        label: 'productsActions',
    });
}

export function editProduct(
    data,
    id,
    onSuccess = () => {},
    onFailure = () => {}
) {
    return apiAction({
        url: `/sales/products/${id}`,
        // onSuccess: fetchProducts,
        method: 'PUT',
        data,
        showToast: false,
        showErrorToast: false,
        attribute: data.id,
        onSuccess,
        onFailure,
        label: 'productsActions',
    });
}

export function deleteProduct(
    id,
    catalogId,
    onSuccess = () => {},
    onFailure = () => {}
) {
    return apiAction({
        url: `/sales/products/${id}`,
        method: 'DELETE',
        onSuccess,
        onFailure,
        attribute: catalogId,
        label: 'products',
        showErrorToast: false,
    });
}
