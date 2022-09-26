import React from 'react';
import { Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';

export default function VacancyPermissionControl({ children }) {
  return (
    <Can I={accessTypes.manage} a={permissions.projobs_vacancies}>
      {() => children}
    </Can>
  );
}
