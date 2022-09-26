import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import * as Sentry from '@sentry/browser';
import { ErrorBoundary } from './components/Lib';
import App from './App';
// config
import configureAppStore from './store';
import { httpService } from './store/apiConfig';
import { history } from './utils/history';

import * as serviceWorker from './serviceWorker';

import './theme/vars.scss';
import './index.scss';

const store = configureAppStore();

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://c0d2525d6b9e4ac99b1a0d1bf17a4222@sentry.io/1878223',
    });
}

httpService(store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </Router>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
