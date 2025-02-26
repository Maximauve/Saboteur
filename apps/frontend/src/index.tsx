import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import I18nProvider from '@/i18n/i18n-provider';
import router from '@/router/router';
import AuthProvider from '@/context/auth/auth-provider';
import { setupStore } from '@/store';
import "@/assets/styles/index.scss";
import 'react-toastify/dist/ReactToastify.css';

const store = setupStore();

// Disabled eslint rule because document cannot be undefined
// eslint-disable-next-line no-undef
createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <I18nProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </AuthProvider>
      </I18nProvider>
    </ReduxProvider>
  </StrictMode>,
);
