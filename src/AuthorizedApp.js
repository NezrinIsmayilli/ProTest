/* eslint-disable react-hooks/exhaustive-deps */
import 'moment/locale/az';
import React, { useLayoutEffect, useEffect } from 'react';
import { connect, batch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { ConfigProvider } from 'antd';
import {
    MainNavigation,
    ProEmpty,
    ProMobileRedirectModal,
    ProTerminal,
    ProPhone,
} from 'components/Lib';
import { hidePreloader } from 'utils/preloaderControl';
import Routes from 'Routes';
import Notifications from 'containers/Notifications';
import { getPartnershipSender, fetchLoginProJobs } from 'store/actions/auth';
import {
    fetchTenantInfo,
    fetchTenants,
    fetchProfileInfo,
    fetchMe,
    fetchCredentials,
} from 'store/actions/profile';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';
import { fetchPermissions } from 'store/actions/@permissions';

import { SocketContextProvider } from 'context/socket-context';

import { Header } from './containers/Header';
import az from './theme/antdLocale';
import 'theme/main.scss';

moment.locale('az');

function AuthorizedApp(props) {
    const {
        fetchProfileInfo,
        fetchMe,
        fetchCredentials,
        getPartnershipSender,
        fetchTenantInfo,
        fetchTenants,
        fetchPermissions,
        fetchLoginProJobs,
        credential,
        fetchCallOperators,
        operators,
    } = props;

    const history = useHistory();

    useLayoutEffect(() => {
        fetchPermissions(() => hidePreloader());
    }, []);

    useLayoutEffect(() => {
        batch(() => {
            fetchProfileInfo();
            fetchMe({
                onSuccessCallback: ({ data }) => {
                    fetchCredentials({
                        id: data?.id,
                    });
                },
            });
            fetchTenantInfo();

            fetchTenants();

            fetchLoginProJobs();
        });
    }, []);

    useEffect(() => {
        fetchCallOperators();

        if (!localStorage.getItem('tabs')) {
            localStorage.setItem('tabs', 0);
        }

        localStorage.setItem('tabs', +localStorage.getItem('tabs') + 1);

        window.onunload = function () {
            localStorage.setItem('tabs', +localStorage.getItem('tabs') - 1);
        };
    }, []);

    // const unloadCallback = event => {
    //     event.preventDefault();
    //     event.returnValue = '';
    //     return '';
    // };

    // useEffect(() => {
    //     window.addEventListener('beforeunload', unloadCallback);
    //     return () => window.removeEventListener('beforeunload', unloadCallback);
    // }, []);

    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        localStorage.getItem('partner-token') &&
            getPartnershipSender(
                localStorage.getItem('partner-token'),
                history.push('/orders/orders')
            );
    }, [getPartnershipSender]);

    // Responsive main navigation hamburger
    const [showMainNav, setShowMainNav] = React.useState(false)

    return (
        <ConfigProvider locale={az} renderEmpty={() => <ProEmpty />}>
            <SocketContextProvider>
                {/* <ProMobileRedirectModal /> */}
                <Header
                    showMainNav={showMainNav}
                    setShowMainNav={setShowMainNav}
                />
                <Routes />
                <MainNavigation
                    showMainNav={showMainNav}
                    setShowMainNav={setShowMainNav}
                />
                <Notifications />
                <ProTerminal />
                {+localStorage.getItem('tabs') <= 1 && (
                    <ProPhone
                        sipCredentials={credential}
                        operators={operators}
                    />
                )}
            </SocketContextProvider>
        </ConfigProvider>
    );
}
const mapStateToProps = state => ({
    credential: state.profileReducer.credential,
    operators: state.internalCallsReducer.operators,
});
export default connect(
    mapStateToProps,
    {
        fetchProfileInfo,
        fetchMe,
        fetchTenantInfo,
        fetchTenants,
        fetchPermissions,
        getPartnershipSender,
        fetchCredentials,
        fetchLoginProJobs,
        fetchCallOperators,
    }
)(AuthorizedApp);
