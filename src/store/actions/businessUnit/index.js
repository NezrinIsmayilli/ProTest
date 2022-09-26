import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const clearBusinessUnitReducer = createAction(
    'clearBusinessUnitReducer'
);
export const setBusinessUnitList = createAction('setBusinessUnitList');
export const setSelectedUnitUser = createAction('setSelectedUnitUser');
export const setSelectedUnitStructure = createAction(
    'setSelectedUnitStructure'
);
export const setSelectedUnitStock = createAction('setSelectedUnitStock');
export const setSelectedUnitCashbox = createAction('setSelectedUnitCashbox');
export const setSelectedUnitPriceType = createAction(
    'setSelectedUnitPriceType'
);

export function fetchBusinessUnitList({
    filters: { ...filters },
    attribute = {},
    onSuccess,
    label = 'fetchBusinessUnitList',
}) {
    if (onSuccess === undefined) {
        onSuccess = setBusinessUnitList;
    }
    let query = filterQueryResolver(filters);
    if (query.startsWith('&')) query = query.substring(1);
    return apiAction({
        url: `/business-unit/business-units?${query}`,
        onSuccess,
        attribute,
        label,
    });
}
export const createBusinessUnit = props => {
    const {
        data,
        onSuccessCallback,
        onFailureCallback,
        label = 'createBusinessUnit',
    } = props;
    return apiAction({
        data,
        label,
        url: `/business-unit/business-units`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
};
export const editBusinessUnit = props => {
    const {
        id,
        data,
        onSuccessCallback,
        onFailureCallback,
        label = 'editBusinessUnit',
    } = props;
    return apiAction({
        data,
        label,
        method: 'PUT',
        url: `/business-unit/business-units/${id}`,
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
};
export function deleteBusinessUnit(id, deletionReason, callBack) {
    const query = filterQueryResolver({ deletionReason });
    return apiAction({
        url: `/business-unit/business-units/${id}?${query}`,
        method: 'DELETE',
        onSuccess: callBack,
        label: 'deleteBusinessUnit',
    });
}
// business unit user
export function fetchUnitUser({ id, onSuccess, attribute = {} }) {
    return apiAction({
        label: 'fetchUnitUser',
        url: `/business-unit/business-unit-tenant-persons?businessUnit=${id}`,
        onSuccess,
        attribute,
    });
}
export function createUnitUser(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitUser',
        url: `/business-unit/business-unit-tenant-persons`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
    });
}
export function deleteUnitUser({ id, onSuccess }) {
    return apiAction({
        url: `/business-unit/business-unit-tenant-persons/${id}`,
        method: 'DELETE',
        onSuccess,
        // showToast: true,
        label: 'action',
    });
}

//  business unit structure
export function createUnitStructure(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitStructure',
        url: `/business-unit/business-unit-structures`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
    });
}
export function fetchUnitStructure({ id, onSuccess, attribute = {} }) {
    return apiAction({
        label: 'fetchUnitStructure',
        url: `/business-unit/business-unit-structures?businessUnit=${id}`,
        onSuccess,
        attribute,
    });
}
export function deleteUnitStructure({ id, onSuccess }) {
    return apiAction({
        url: `/business-unit/business-unit-structures/${id}`,
        method: 'DELETE',
        onSuccess,
        // showToast: true,
        label: 'action',
    });
}
// business unit stock
export function createUnitStock(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitStock',
        url: `/business-unit/business-unit-stocks`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
}
export function fetchUnitStock({ id, onSuccess, attribute = {} }) {
    return apiAction({
        label: 'fetchUnitStock',
        url: `/business-unit/business-unit-stocks?businessUnit=${id}`,
        onSuccess,
        attribute,
    });
}
export function deleteUnitStock({ id, onSuccess }) {
    return apiAction({
        url: `/business-unit/business-unit-stocks/${id}`,
        method: 'DELETE',
        onSuccess,
        label: 'action',
    });
}
export function createUnitStockTransfer(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitStockTransfer',
        url: `/business-unit/business-unit-transfer-stocks`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
    });
}

export function deleteUnitStockTransfer({ id, onSuccess }) {
    return apiAction({
        label: 'deleteUnitStockTransfer',
        url: `/business-unit/business-unit-transfer-stocks/${id}`,
        method: 'DELETE',
        onSuccess,
    });
}
// business unit cashbox
export function createUnitCashbox(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitCashbox',
        url: `/business-unit/business-unit-cashboxes`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
}
export function fetchUnitCashbox({ id, onSuccess, attribute = {} }) {
    return apiAction({
        label: 'fetchUnitCashbox',
        url: `/business-unit/business-unit-cashboxes?businessUnit=${id}`,
        onSuccess,
        attribute,
    });
}
export function deleteUnitCashbox({ id, onSuccess }) {
    return apiAction({
        url: `/business-unit/business-unit-cashboxes/${id}`,
        method: 'DELETE',
        onSuccess,
        label: 'action',
    });
}
export function createUnitCashboxTransfer(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitCashboxTransfer',
        url: `/business-unit/business-unit-transfer-cashboxes`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
    });
}
export function deleteUnitCashboxTransfer({ id, onSuccess }) {
    return apiAction({
        label: 'deleteUnitCashboxTransfer',
        url: `/business-unit/business-unit-transfer-cashboxes/${id}`,
        method: 'DELETE',
        onSuccess,
    });
}
// business unit PriceType
export function createUnitPriceType(props) {
    const { data, onSuccessCallback, onFailureCallback } = props;

    return apiAction({
        data,
        label: 'createUnitPriceType',
        url: `/business-unit/business-unit-price-types`,
        method: 'POST',
        onSuccess: data => dispatch => {
            if (onSuccessCallback) dispatch(onSuccessCallback(data));
        },
        onFailure: error => dispatch => {
            if (onFailureCallback) dispatch(onFailureCallback(error));
        },
        showErrorToast: false,
    });
}
export function fetchUnitPriceType({ id, onSuccess, attribute = {} }) {
    return apiAction({
        label: 'fetchUnitPriceType',
        url: `/business-unit/business-unit-price-types?businessUnit=${id}`,
        onSuccess,
        attribute,
    });
}
export function deleteUnitPriceType({ id, onSuccess }) {
    return apiAction({
        url: `/business-unit/business-unit-price-types/${id}`,
        method: 'DELETE',
        onSuccess,
        label: 'action',
    });
}
export const handleResetFields = () => dispatch => {
    dispatch(clearBusinessUnitReducer());
};
