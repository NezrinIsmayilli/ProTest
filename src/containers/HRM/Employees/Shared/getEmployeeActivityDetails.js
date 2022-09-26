import React from 'react';
import { ReactComponent as RecruitmentIcon } from 'assets/img/icons/recruitment.svg';
import { ReactComponent as PalmaIcon } from 'assets/img/icons/palma.svg';
import { ReactComponent as BusinessTripIcon } from 'assets/img/icons/businesstrip.svg';
import { ReactComponent as IllIcon } from 'assets/img/icons/illness.svg';
import { ReactComponent as PermissionIcon } from 'assets/img/icons/permission.svg';
import { ReactComponent as TerminationIcon } from 'assets/img/icons/workend.svg';
import { ReactComponent as AppointmentIcon } from 'assets/img/icons/appoinment.svg';
import { workerOperationTypes } from 'utils';

const workerOperationTypeInfo = {
  [workerOperationTypes.Entrance]: (
    <div>
      <RecruitmentIcon width={16} height={16} fill="#a3908e" />
      <span>İşə qəbul</span>
    </div>
  ),
  [workerOperationTypes.Vacation]: (
    <div>
      <PalmaIcon />
      <span>Məzuniyyət</span>
    </div>
  ),
  [workerOperationTypes.TimeOff]: (
    <div>
      <PermissionIcon />
      <span>İcazə</span>
    </div>
  ),
  [workerOperationTypes.Fire]: (
    <div>
      <TerminationIcon />
      <span>Ə.M Xitam</span>
    </div>
  ),
  [workerOperationTypes.BusinessTrip]: (
    <div>
      <BusinessTripIcon />
      <span>Ezamiyyət</span>
    </div>
  ),
  [workerOperationTypes.SickLeave]: (
    <div>
      <IllIcon />
      <span>Xəstəlik</span>
    </div>
  ),
  [workerOperationTypes.Appointment]: (
    <div>
      <AppointmentIcon />
      <span>İş görüşü</span>
    </div>
  ),
};

export default function getEmployeeActivityDetails(type) {
  return workerOperationTypeInfo[type];
}
