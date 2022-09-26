import axios from 'axios';
import { API } from 'store/constants';
import { toast } from 'react-toastify';
import { showLoader, hideLoader } from 'utils/loadingIconControl';
import { apiStart, apiEnd, apiError, accessDenied } from 'store/actions/api';
import { messages, apiErrorMessageResolver, clearUserData } from 'utils';
import errorMessages from 'utils/errors';

import { cookies } from 'utils/cookies';

// TO Do
// const { CancelToken } = axios;
// export const { token, cancel } = CancelToken.source();
const saveData = data => {
    cookies.set('_TKN_CALL_', data?.accessToken);
};

const apiMiddleware = ({ dispatch, getState }) => next => action => {
    if (action && action.type) {
        if (action?.type !== API) {
            next(action);
            return;
        }

        const {
            url,
            method,
            data,
            onSuccess,
            onFailure,
            label,
            showLoading,
            showToast,
            attribute,
            shouldCallApi,
            showErrorToast,
        } = action.payload;

        if (!shouldCallApi(getState())) return;

        if (showLoading) {
            showLoader();
        }

        if (label) {
            dispatch(apiStart(label));
        }

        const endPoint =
            process.env.NODE_ENV === 'production'
                ? process.env.REACT_APP_API_URL
                : process.env.REACT_APP_DEV_API_URL;

        const dataOrParams = ['GET'].includes(method) ? 'params' : 'data';

        axios
            .request({
                url,
                method,
                // cancelToken: token,
                [dataOrParams]: data,
            })
            .then(response => {
                dispatch(
                    onSuccess({
                        ...response?.data,
                        data: response?.data?.data,
                        attribute,
                    })
                );

                if (showToast) {
                    toast.success(messages.successText, {
                        className: 'success-toast',
                    });
                }
            })
            .catch(error => {
                if (axios.isCancel(error)) return;

                let errorMessage = apiErrorMessageResolver(error);
                const errorKey = error?.response?.data?.error?.messageKey;
                if (errorKey && errorMessages[errorKey]) {
                    errorMessage = errorMessages[errorKey];
                }
                if(errorMessage=='Access Denied. Code: #T01'){
                    errorMessage = 'Sizin hesaba giriş hüququnuz ləğv edilmişdir.'
                }
                if (
                    errorMessage === 'Invalid credentials.' ||
                    error?.response?.data?.error?.errors?.password?.[0] ===
                        'This value is too short. It should have 6 characters or more.'
                ) {
                    errorMessage = 'Email və ya şifrə səhv daxil edilib.';
                }
                if (errorMessage === 'Authentication Required') {
                    errorMessage = undefined;
                }
                if (
                    (error?.response?.config?.url.includes(
                        'sparkle.pronet.az'
                    ) ||
                        error?.response?.config?.url.includes(
                            'backendpbx.prospect.az'
                        )) &&
                    error.response.data.error?.status === 401
                ) {
                    errorMessage = undefined;
                }
                // if (errorMessage === 'Xəta baş verdi!') {
                //   errorMessage = undefined;
                // }
                dispatch(apiError({ message: errorMessage, attribute }));
                if (errorMessage === 'Serial numbers are not unique.') {
                    return toast.error(
                        'Daxil edilmiş seriya nömrəsi təkrar edilə bilməz'
                    );
                }
                if(errorMessage=="This occupation is already exists."){
                    return toast.error(
                        'Bu vəzifə artıq mövcuddur.'
                    );
                  
                }
                if (
                    errorMessage === '#2 Access denied' &&
                    error.response.status === 403
                ) {
                    return toast.error(
                        'Təsisçi roluna sahib olan istifadəçilər silinə bilməz'
                    );
                }
                if (
                    errorMessage === '#1 Access denied' &&
                    error.response.status === 403
                ) {
                    return toast.error(
                        'Cari istifadəçinin hesabında olduğunuz üçün bu istifadəçi silinə bilməz'
                    );
                }

                if (
                    error?.response?.data?.error?.message ===
                    'Access token is wrong'
                ) {
                    clearUserData({
                        reload: true,
                    });
                }
                if (error?.response?.status === 403) {
                    return;
                }

                if (showErrorToast && error?.response?.status !== 403) {
                    toast.error(errorMessage);
                }

                if (error.response && error.response.status === 403) {
                    dispatch(accessDenied(window.location.pathname));
                }

                if (onFailure) {
                    dispatch(onFailure({ error, attribute }));
                }
            })
            .finally(() => {
                if (showLoading) {
                    hideLoader();
                }
                if (label) {
                    dispatch(apiEnd(label));
                }
            });

        axios.interceptors.response.use(
            response => response,
            error => {
                const originalRequest = error.config;
                if (
                    ((error?.response?.config?.url.includes(
                        'sparkle.pronet.az'
                    ) ||
                        error?.response?.config?.url.includes(
                            'backendpbx.prospect.az'
                        )) &&
                        error.response.data.error?.status === 401) ||
                    (error?.response?.config?.url.includes(
                        `${endPoint}/employees`
                    ) &&
                        error.response.data.error.code === 401)
                ) {
                    return axios
                        .get(`${endPoint}/call-center/integration/new-token`)
                        .then(response => {
                            saveData(response?.data?.data);
                            return axios(originalRequest);
                        });
                }
                return Promise.reject(error);
            }
        );
    }
};

export default apiMiddleware;
