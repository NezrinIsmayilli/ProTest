import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { ErrorMessage, filterQueryResolver } from 'utils';
import { toast } from 'react-toastify';

// Product Types
export const setProductTypes = createAction('setProductTypes');

export function fetchProductTypes() {
    return apiAction({
        url: '/sales/product/productTypes',
        onSuccess: setProductTypes,
        label: 'productTypes',
    });
}

export function createProductTypes(index, name) {
    return apiAction({
        url: '/sales/product/productTypes',
        method: 'POST',
        data: { name },
        onSuccess: fetchProductTypes,
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function editProductTypes(id, name) {
    return apiAction({
        url: `/sales/product/productTypes/${id}`,
        method: 'PUT',
        data: { name },
        onSuccess: fetchProductTypes,
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function deleteProductTypes(id) {
    return apiAction({
        url: `/sales/product/productTypes/${id}`,
        method: 'DELETE',
        onSuccess: fetchProductTypes,
        showToast: true,
        label: 'productTypes',
    });
}

// Unit Of Measurements
export const setUnitOfMeasurements = createAction('setUnitOfMeasurements');

export function fetchUnitOfMeasurements() {
    return apiAction({
        url: '/sales/product/unitOfMeasurements?limit=1000',
        onSuccess: setUnitOfMeasurements,
        label: 'productTypes',
    });
}

export function createUnitOfMeasurements(
    name,
    key,
    onSuccessCallback,
    onFailureCallback
) {
    return apiAction({
        url: '/sales/product/unitOfMeasurements',
        method: 'POST',
        data: { name, key: key || null },
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },

        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
        showToast: false,
        label: 'productTypes',
    });
}

export function editUnitOfMeasurements(
    id,
    name,
    key,
    onSuccessCallback,
    onFailureCallback
) {
    return apiAction({
        url: `/sales/product/unitOfMeasurements/${id}`,
        method: 'PUT',
        data: { name, key },
        onSuccess: data => dispatch => {
            fetchUnitOfMeasurements();
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function deleteUnitOfMeasurements(id) {
    return apiAction({
        url: `/sales/product/unitOfMeasurements/${id}`,
        method: 'DELETE',
        onSuccess: fetchUnitOfMeasurements,
        showToast: true,
        label: 'productTypes',
    });
}

// Special Parameters
export const setSpecialParameters = createAction('setSpecialParameters');

export function fetchSpecialParameters() {
    return apiAction({
        url: '/sales/product/specialParameters',
        onSuccess: setSpecialParameters,
        label: 'productTypes',
    });
}

export function createSpecialParameters(index, name) {
    return apiAction({
        url: '/sales/product/specialParameters',
        method: 'POST',
        data: { name },
        onSuccess: fetchSpecialParameters,
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function editSpecialParameters(id, name) {
    return apiAction({
        url: `/sales/product/specialParameters/${id}`,
        method: 'PUT',
        data: { name },
        onSuccess: fetchSpecialParameters,
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function deleteSpecialParameters(id) {
    return apiAction({
        url: `/sales/product/specialParameters/${id}`,
        method: 'DELETE',
        onSuccess: fetchSpecialParameters,
        showToast: true,
        label: 'productTypes',
    });
}

// Product Price Type
export const setProductPriceTypes = createAction('setProductPriceTypes');
export const setFilteredProductPriceTypes = createAction(
    'setFilteredProductPriceTypes'
);

export function fetchProductPriceTypes(filters = {}) {
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/sales/product/productPriceTypes?${query}`,
        onSuccess: setProductPriceTypes,
        label: 'productTypes',
    });
}
export function fetchFilteredProductPriceTypes(props = {}) {
    
  const { filters = {}, onSuccessCallback } = props;
    const query = filterQueryResolver(filters);
    return apiAction({
        url: `/sales/product/productPriceTypes?${query}`,
        onSuccess:data => dispatch => {
            dispatch(setFilteredProductPriceTypes(data));
            if (onSuccessCallback !== undefined) {
              onSuccessCallback(data);
          }} ,
        label: 'productTypes',
    });
}
// (params)=>_index=='AddproductPriceType'?fetchProductPriceTypes({ids:[params.data.id]}):fetchProductPriceTypes(),
export function createProductPriceTypes(_index, name) {
    return apiAction({
        url: '/sales/product/productPriceTypes',
        method: 'POST',
        data: { name },
        onSuccess: params =>
            _index === 'AddproductPriceType'
                ? fetchFilteredProductPriceTypes({filters:{ ids: [params.data.id] }})
                : fetchProductPriceTypes({ limit: 1000 }),
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function editProductPriceTypes(id, name) {
    return apiAction({
        url: `/sales/product/productPriceTypes/${id}`,
        method: 'PUT',
        data: { name },
        onSuccess: () => fetchProductPriceTypes({ limit: 1000 }),
        onFailure: error => () => {
            const message = ErrorMessage(error);
            toast.error(message);
        },
        showErrorToast: false,
        showToast: true,
        label: 'productTypes',
    });
}

export function deleteProductPriceTypes(id) {
    return apiAction({
        url: `/sales/product/productPriceTypes/${id}`,
        method: 'DELETE',
        onSuccess: () => fetchProductPriceTypes({ limit: 1000 }),
        showToast: true,
        label: 'productTypes',
    });
}
// msk barcod
export const setBarcodTypes = createAction('setBarcodTypes');
export const setFreeBarcodTypes = createAction('setFreeBarcodTypes');
export const setGeneratedBarcode = createAction('setGeneratedBarcode');

export function fetchFreeBarcodTypes() {
    return apiAction({
        url: '/sales/barcode-configurations/1',
        onSuccess: setFreeBarcodTypes,
        label: 'barcodTypes',
    });
}

export function fetchBarcodTypes() {
    return apiAction({
        url: '/sales/barcode-configurations/2',
        onSuccess: setBarcodTypes,
        label: 'barcodTypes',
    });
}

export function createBarcode(type, data) {
    return apiAction({
        url: '/sales/barcode-configurations',
        method: 'POST',
        data,
        onSuccess: type === 1 ? fetchFreeBarcodTypes : fetchBarcodTypes,
        showErrorToast: false,
        showToast: true,
        label: 'barcodeTypes',
    });
}

export function generateBarcode(type, onSuccessCallback) {
    return apiAction({
        url: `/sales/barcode-configurations/generate/${type}`,
        onSuccess: data => dispatch => {
            dispatch(setGeneratedBarcode(data));
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },

        label: 'barcodeTypes',
    });
}
// msk tax
export const setTaxTypes = createAction('setTaxTypes');

export function fetchTaxTypes() {
    return apiAction({
        url: '/sales/product/tax',
        onSuccess: setTaxTypes,
        label: 'productTypes',
    });
}

export function createTaxTypes({ name, percentage }) {
    return apiAction({
        url: '/sales/product/tax',
        method: 'POST',
        data: { name, percentage },
        onSuccess: fetchTaxTypes,
        showToast: true,
        label: 'productTypes',
    });
}

export function editTaxTypes(id, { name, percentage }) {
    return apiAction({
        url: `/sales/product/tax/${id}`,
        method: 'PUT',
        data: { name, percentage },
        onSuccess: fetchTaxTypes,
        showToast: true,
        label: 'productTypes',
    });
}

export function deleteTaxTypes(id) {
    return apiAction({
        url: `/sales/product/tax/${id}`,
        method: 'DELETE',
        onSuccess: fetchTaxTypes,
        showToast: true,
        label: 'productTypes',
    });
}
