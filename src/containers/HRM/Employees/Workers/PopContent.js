import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider } from 'antd';

import { ReactComponent as PalmaIcon } from 'assets/img/icons/palma.svg';
import { ReactComponent as ArrowRight } from 'assets/img/icons/arrowright.svg';
import { ReactComponent as BusinessTripIcon } from 'assets/img/icons/businesstrip.svg';
import { ReactComponent as IllIcon } from 'assets/img/icons/illness.svg';
import { ReactComponent as PermissionIcon } from 'assets/img/icons/permission.svg';
import { ReactComponent as AppointmentIcon } from 'assets/img/icons/appoinment.svg';
import { ReactComponent as TerminationIcon } from 'assets/img/icons/workend.svg';
import { ReactComponent as EditIcon } from 'assets/img/icons/pen.svg';

import { workerOperationTypes } from 'utils';

import styles from './styles.module.scss';

function PopContent(props) {
  const { id, onChange } = props;
  return (
    <div className={styles.popContent}>
      <div>
        <Button onClick={() => onChange(workerOperationTypes.Vacation)}>
          <PalmaIcon />
          <span>Məzuniyyət</span>
          <ArrowRight className={styles.rightArrow} />
        </Button>
      </div>
      <div>
        <Button onClick={() => onChange(workerOperationTypes.BusinessTrip)}>
          <BusinessTripIcon />
          <span>Ezamiyyət</span>
          <ArrowRight className={styles.rightArrow} />
        </Button>
      </div>
      <div>
        <Button onClick={() => onChange(workerOperationTypes.SickLeave)}>
          <IllIcon />
          <span>Xəstəlik</span>
          <ArrowRight className={styles.rightArrow} />
        </Button>
      </div>
      <div>
        <Button onClick={() => onChange(workerOperationTypes.TimeOff)}>
          <PermissionIcon />
          <span>İcazə</span>
          <ArrowRight className={styles.rightArrow} />
        </Button>
      </div>
      <div>
        <Button onClick={() => onChange(workerOperationTypes.Appointment)}>
          <AppointmentIcon />
          <span>İş görüşü</span>
          <ArrowRight className={styles.rightArrow} />
        </Button>
      </div>
      <div>
        <Button onClick={() => onChange(workerOperationTypes.Fire)}>
          <TerminationIcon />
          <span>Ə.M Xitam</span>
          <ArrowRight className={styles.rightArrow} />
        </Button>
      </div>
      <Divider />
      <div>
        <Link to={`/hrm/employees/workers/edit/${id}`}>
          <Button>
            <EditIcon />
            <span>Düzəliş</span>
            <ArrowRight className={styles.rightArrow} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default PopContent;
