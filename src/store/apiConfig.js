/**
 * axios config using axios.interceptors(doc. https://github.com/axios/axios#interceptors)
 */

import axios from 'axios';
import { cookies } from 'utils/cookies';

let requestUrl = '';
const nonAuthRequiredUrls = [
    '/login',
    '/register',
    '/recovery',
    '/password/recovery',
    '/invitation',
    '/invitation/accept',
];

// add base url to all requests and token if this available,
// on response with status code 401 dispatch logout action to store
export const httpService = () => {
    // request config
    axios.interceptors.request.use(
        config => {
            config.baseURL =
                process.env.NODE_ENV === 'production'
                    ? process.env.REACT_APP_API_URL
                    : process.env.REACT_APP_DEV_API_URL;

            requestUrl = config.url;

            const token = cookies.get('_TKN_');
            const tenantId = cookies.get('__TNT__');
            const tokenCall = cookies.get('_TKN_CALL_');
            const tokenJobs = cookies.get('_TKN_JOBS_');
            const tokenBusiness = cookies.get('_TKN_UNIT_');
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');
            if (
                token &&
                tenantId &&
                !nonAuthRequiredUrls.includes(requestUrl)
            ) {
                if (
                    tokenCall &&
                    (requestUrl?.includes('sparkle.pronet.az') ||
                        requestUrl?.includes('backendpbx.prospect.az'))
                ) {
                    config.headers['X-AUTH-PROTOKEN'] = tokenCall;
                } else if (
                    requestUrl?.includes('devjobscore.prospectsmb.com') ||
                    requestUrl?.includes('core.projobs.az')
                ) {
                    if (tokenJobs) {
                        config.headers['X-AUTH-PROTOKEN'] = tokenJobs;
                    }
                } else {
                    config.headers['X-AUTH-PROTOKEN'] = token;
                    config.headers['X-TENANT-ID'] = tenantId;
                    if (
                        tokenBusiness &&
                        !BUSINESS_TKN_UNIT &&
                        tokenBusiness !== '0' &&
                        (config.method === 'post' || config.method === 'delete')
                    ) {
                        if (!requestUrl?.includes('/contacts')) {
                            config.headers[
                                'X-BUSINESS-UNIT-ID'
                            ] = tokenBusiness;
                        }
                    }
                    if (
                        BUSINESS_TKN_UNIT &&
                        BUSINESS_TKN_UNIT !== '0' &&
                        (config.method === 'post' || config.method === 'delete')
                    ) {
                        if (!requestUrl?.includes('/contacts')) {
                            config.headers[
                                'X-BUSINESS-UNIT-ID'
                            ] = BUSINESS_TKN_UNIT;
                        }
                    }
                }
            }

            return config;
        },
        error => Promise.reject(error)
    );
    // response config
    // axios.interceptors.response.use(
    //   response => response,
    //   error => {
    //     // if (
    //     //   error?.response?.status === 401 &&
    //     //   !nonAuthRequiredUrls.includes(requestUrl)
    //     // ) {
    //     //   resetUserDetails();

    //     //   setTimeout(() => {
    //     //     window.location.replace('/login');
    //     //   }, 0);
    //     //   return;
    //     // }
    //     return Promise.reject(error);
    //   }
    // );
};
