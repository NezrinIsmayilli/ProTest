import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { cookies } from 'utils/cookies';
import { toast } from 'react-toastify';

export const setUserInfo = createAction('setUserInfo');
export const setPartnershipSender = createAction('setPartnershipSender');
export const resetUserInfo = createAction('resetUserInfo');
export const setLoggedStatus = createAction('setLoggedStatus');

export const setProJobsLogin = createAction('setProJobsLogin');

const resetCookies = () => {
    cookies.remove('_TKN_');
    cookies.remove('email');
    cookies.remove('dvc');
    cookies.remove('__TNT__');
};

const saveData = data => {
    cookies.set('_TKN_', data?.data?.accessToken);
    cookies.set('email', data?.data?.email);
    cookies.set('dvc', data?.data?.deviceToken);
};

export function fetchLoginProJobs() {
    return apiAction({
        url: '/integration/projobs',
        onSuccess: data => dispatch => {
            dispatch(setProJobsLogin(data));
            cookies.set('_TKN_JOBS_', data?.data?.accessToken);
        },
        label: 'jobsAuth',
    });
}

export function createLoginProjobs(
    { email, password },
    onSuccessCallback = () => {},
    onFailureCallback = () => {}
) {
    return apiAction({
        url: '/integration/projobs',
        method: 'POST',
        data: { email, password },
        onSuccess: data => dispatch => {
            dispatch(fetchLoginProJobs());
            dispatch(onSuccessCallback(data));
            toast.success('İnteqrasiya uğurla icra edildi.');
        },
        onFailure: onFailureCallback,
        showToast: false,
        showErrorToast: false,
        label: 'jobsAuth',
    });
}

export function logoutProJobs() {
    return apiAction({
        url: '/integration/projobs/',
        method: 'DELETE',
        onSuccess: fetchLoginProJobs,
        showToast: false,
        label: 'jobsAuth',
    });
}

export function login({ email, password }) {
    resetCookies();
    const deviceToken = cookies.get('dvc') || '';
    return apiAction({
        url: '/login',
        method: 'POST',
        data: { email, password, deviceToken },
        onSuccess: data => () => {
            saveData(data);
            cookies.set('__TNT__', data.data?.tenants[0]?.id);
            window.setTimeout(() => window.location.reload(), 0);
        },
        label: 'auth',
        showErrorToast: false,
    });
}

export function register(data, onSuccessCallback, onFailureCallback) {
    resetCookies();
    return apiAction({
        url: '/advanced/register',
        method: 'POST',
        data,
        onSuccess: data => () => {
            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
            // saveData(data);
            // cookies.set('__TNT__', data.data.tenant.id);
            // window.setTimeout(() => window.location.reload(), 0);
        },
        onFailure: error => {
            if (onFailureCallback) {
                onFailureCallback(error);
            }
        },
        label: 'auth',
        showErrorToast: false,
    });
}

export function sendRecoveryReguest(
    data,
    successCallback = () => {},
    failureCallback = () => {}
) {
    resetCookies();

    return apiAction({
        url: '/password/recovery',
        method: 'POST',
        data,
        onSuccess: () => () => {
            successCallback();
        },
        onFailure: params => () => {
            failureCallback(params);
        },
        label: 'auth',
        showErrorToast: false,
    });
}

export function checkToken(onSuccessCallback) {
    return apiAction({
        url: `/checkAccessToken`,
        method: 'POST',
        onSuccess: () => dispatch => {
            dispatch(setLoggedStatus(true));
            if (onSuccessCallback) onSuccessCallback();
        },
        attribute: 'checkToken',
        label: 'checkToken',
        showErrorToast: false,
    });
}

export function setPassword(
    url,
    data,
    successCallback = () => {},
    failureCallback = () => {}
) {
    return apiAction({
        url,
        method: 'POST',
        data,
        onSuccess: () => () => {
            successCallback();
        },
        onFailure: params => () => {
            failureCallback(params);
        },
        label: 'setPassword',
        showErrorToast: false,
    });
}

export function getPartnershipSender(
    partnerToken,
    onSuccessCallback = () => {}
) {
    return apiAction({
        url: `/partners/${partnerToken}`,
        onSuccess: data => dispatch => {
            dispatch(
                acceptPartnershipRequest(data, partnerToken, onSuccessCallback)
            );
            localStorage.removeItem('partner-token');
        },
        label: 'checkPartner',
        showErrorToast: false,
    });
}

export function acceptPartnershipRequest(
    partnerData,
    partnerToken,
    onSuccessCallback
) {
    return apiAction({
        url: '/contacts',
        method: 'POST',
        data: {
            type: 2,
            status: 1,
            category_ul: [4, 8],
            name: partnerData.data.name,
            position: null,
            company: null,
            phoneNumbers_ul: null,
            emails_ul: null,
            websites_ul: null,
            socialNetworkIds_ul: [],
            voen: null,
            address: null,
            manager: null,
            priceType: null,
            description: null,
            partnerToken,
        },
        onSuccess: onSuccessCallback,
        label: 'checkPartner',
        showErrorToast: false,
    });
}
