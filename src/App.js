/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { useTranslation } from 'react-i18next';
import './i18n';

import { showPreloader } from 'utils/preloaderControl';
import { checkToken } from 'store/actions/auth';
import queryString from 'query-string';

import { useSourceFromQuery } from 'hooks';

const loadAuthorizedApp = () => import('./AuthorizedApp');

const AuthorizedApp = lazy(loadAuthorizedApp);
const UnAuthorizedApp = lazy(() => import('./UnAuthorizedApp'));

const FallBack = () => {
    showPreloader();
    return null;
};

const TranslationBlock = () => {
    const { i18n } = useTranslation();

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                zIndex: 9999,
            }}
        >
            <button
                type="button"
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 5,
                    marginRight: 10,
                    border: 'none',
                    backgroundColor: '#00cec9',
                    cursor: 'pointer',
                }}
                onClick={() => i18n.changeLanguage('az')}
            />
            <button
                type="button"
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 5,
                    marginRight: 10,
                    border: 'none',
                    backgroundColor: '#ff7675',
                    cursor: 'pointer',
                }}
                onClick={() => i18n.changeLanguage('en')}
            />
            <button
                type="button"
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 5,
                    marginRight: 10,
                    border: 'none',
                    backgroundColor: '#e84393',
                    cursor: 'pointer',
                }}
                onClick={() => i18n.changeLanguage('ru')}
            />
        </div>
    );
};

function App(props) {
    const { checkTokenLoading, checkToken, logged } = props;
    const { search, pathname } = useLocation();
    const { partner_token } = queryString.parse(search);

    useEffect(() => {
        checkToken(
            () => {
                loadAuthorizedApp();
            },
            error => {}
        );
    }, []);
    useEffect(() => {
        if (
            !/users|warehouse\/warehouse|warehouse\/bron|sales\/operations|sales\/contracts|sales\/production|hrm\/structure\/sections|finance\/cashbox|finance\/operations/.test(
                pathname
            )
        ) {
            cookies.remove('_TKN_UNIT_');
        }
    }, [pathname]);
    useEffect(() => {
        // eslint-disable-next-line no-unused-expressions
        partner_token && localStorage.setItem('partner-token', partner_token);
    }, []);

    // save source from query
    useSourceFromQuery();

    if (checkTokenLoading) {
        return <FallBack />;
    }

    if (logged) {
        return (
            <Suspense fallback={<FallBack />}>
                <AuthorizedApp />
                {process.env.REACT_APP_DEV_API_URL ===
                'https://devcore.prospectsmb.com/v1' ? (
                    <TranslationBlock />
                ) : null}
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<FallBack />}>
            <UnAuthorizedApp />
            {process.env.REACT_APP_DEV_API_URL ===
            'https://devcore.prospectsmb.com/v1' ? (
                <TranslationBlock />
            ) : null}
        </Suspense>
    );
}

const mapStateToProps = state => ({
    checkTokenLoading: !!state.loadings.checkToken,
    logged: state.authReducer.logged,
});

export default connect(
    mapStateToProps,
    { checkToken }
)(App);
