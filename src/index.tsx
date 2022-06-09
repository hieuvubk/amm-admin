import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import store from './store/store';
import i18next from './i18n';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import App from './App';

const browserHistory = createBrowserHistory();

ReactDOM.render(
  <I18nextProvider i18n={i18next}>
    <Provider store={store}>
      <Router history={browserHistory}>
        <App />
      </Router>
    </Provider>
  </I18nextProvider>,
  document.getElementById('root'),
);
