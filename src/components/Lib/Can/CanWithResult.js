import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import Can from './index';
import { AccessDeniedResult } from '../AccessDeniedResult';
import { Loading } from '../Loading/index';

const getPermissionsLength = createSelector(
  state => state.permissionsReducer.permissions,
  permissions => !!permissions?.length
);
const getPermissionsIsLoading = state => state.permissionsReducer.isLoading;

export function CanWithResult({ I, a, children }) {
  const permissionsIsLoading = useSelector(getPermissionsIsLoading);
  const permissionsLength = useSelector(getPermissionsLength);

  return (
    <Can I={I} a={a} passThrough>
      {can =>
        can && !permissionsIsLoading && permissionsLength ? (
          children
        ) : !permissionsLength || permissionsIsLoading ? (
          <Loading />
        ) : (
          <AccessDeniedResult />
        )
      }
    </Can>
  );
}
