/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { showLoader, hideLoader } from 'utils/loadingIconControl';
// import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const PermissionsContext = createContext();

function PermissionsContextProvider({ location, ...rest }) {
  const [permissions, setPermissions] = useState([]);
  // const { t } = useTranslation();

  // re-run on pathname change
  // useEffect(() => {
  //   // if (localStorage.getItem('_TKN_')) {
  //   // }
  //   getPermissions(setPermissions, t);
  // }, [location.pathname]);

  return <PermissionsContext.Provider value={{ permissions }} {...rest} />;
}

function usePermissions() {
  const context = useContext(PermissionsContext);

  if (context === undefined) {
    throw Error('usePermissions must be used within a provider');
  }

  return context;
}

async function getPermissions(setPermissions, t) {
  try {
    showLoader();
    const { data } = await axios.get('/authorization/roles/permissions');
    setPermissions(data.data);
    hideLoader();
  } catch (error) {
    hideLoader();
    toast.error(t('error'));
  }
}

export { usePermissions, PermissionsContextProvider };
