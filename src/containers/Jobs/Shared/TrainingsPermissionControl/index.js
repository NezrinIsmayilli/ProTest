import React from 'react';
import { Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';

export default function TrainingsPermissionControl({ children }) {
  return (
    <Can I={accessTypes.manage} a={permissions.projobs_trainings}>
      {() => children}
    </Can>
  );
}
