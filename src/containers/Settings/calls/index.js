import React from 'react';
import { CustomHeader, SettingsCollapse, SettingsPanel } from 'components/Lib';
import Numbers from './numbers';
import { Roles } from './roles';
import WorkSchedule from './work-schedule';
import Ivr from './ivr';
import Sip from './sip';
import OperatorGroup from './operatorGroup';
import OfflineReason from './offlineReason';
import Integration from './integration';
import ApplyType from './applyType';

const Calls = () => (
    <div style={{ marginBottom: '100px' }}>
        <SettingsCollapse>
            {/* <SettingsPanel header={<CustomHeader title="Nömrələr" />} key="1">
          <Numbers />
        </SettingsPanel> */}
            <SettingsPanel
                header={<CustomHeader title="Rollar və istifadəçilər" />}
                key="8"
            >
                <Roles />
            </SettingsPanel>
            {/* <SettingsPanel header={<CustomHeader title="Tənzimləmələr" />} key="2">
        <Regulations />
      </SettingsPanel> */}
            <SettingsPanel
                header={<CustomHeader title="Müraciət növləri" />}
                key="3"
            >
                <ApplyType />
            </SettingsPanel>
            <SettingsPanel
                header={<CustomHeader title="İş rejimləri" />}
                key="4"
            >
                <WorkSchedule />
            </SettingsPanel>
            <SettingsPanel header={<CustomHeader title="İVR" />} key="5">
                <Ivr />
            </SettingsPanel>
            <SettingsPanel
                header={<CustomHeader title="SİP nömrələrin qeydiyyatı" />}
                key="6"
            >
                <Sip />
            </SettingsPanel>
            <SettingsPanel
                header={<CustomHeader title="Operator qrupları" />}
                key="7"
            >
                <OperatorGroup />
            </SettingsPanel>
            <SettingsPanel
                header={<CustomHeader title="Oflayn səbəbləri" />}
                key="9"
            >
                <OfflineReason />
            </SettingsPanel>
            {/* <SettingsPanel
                header={<CustomHeader title="İnteqrasiya" />}
                key="1"
            >
                <Integration />
            </SettingsPanel> */}
        </SettingsCollapse>
    </div>
);

export default Calls;
