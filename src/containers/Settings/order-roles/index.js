import React from 'react';
import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
import { Roles } from './roles';
import { Regulations } from './regulations/regulations';

const OrderRoles = () => (
  <div>
    <SettingsCollapse accordion={false}>
      <SettingsPanel
        header={<CustomHeader title="Rollar və istifadəçilər" />}
        key="1"
      >
        <Roles />
      </SettingsPanel>
      <SettingsPanel header={<CustomHeader title="Tənzimləmələr" />} key="2">
        <Regulations />
      </SettingsPanel>
    </SettingsCollapse>
  </div>
);

export default OrderRoles;
