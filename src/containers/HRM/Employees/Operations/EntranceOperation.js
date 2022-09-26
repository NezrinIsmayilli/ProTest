import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from 'antd';
import { InfoBoxItem, Can } from 'components/Lib';

import { ReactComponent as TerminationIcon } from 'assets/img/icons/recruitment.svg';
import { FaPencilAlt } from 'react-icons/fa';

import { permissions, accessTypes } from 'config/permissions';

import styles from './styles.module.scss';

function EntranceOperation(props) {
  const { infoData } = props;
  return (
    <div className={styles.operationBox}>
      <div
        className={`${styles.operationType} ${styles.padding24} ${styles.flexCenter}`}
      >
        <span className={`${styles.fireBg} ${styles.sharedStyle}`}>
          <TerminationIcon />
        </span>
        <h3>İşə qəbul</h3>
      </div>

      {infoData && (
        <div className={styles.padding24}>
          <InfoBoxItem label="Əmək müqaviləsi" text={infoData.contractNumber} />
          <InfoBoxItem label="İş başlama tarixi" text={infoData.startDate} />
          <Can I={accessTypes.manage} a={permissions.hrm_activities}>
            <div className={styles.flexCenter && styles.txtRight}>
              <NavLink
                to={`/hrm/employees/workers/edit/${infoData.employeeId}`}
              >
                <Button size="large" className={styles.editBtn}>
                  <FaPencilAlt /> <span>Düzəliş</span>
                </Button>
              </NavLink>
            </div>
          </Can>
        </div>
      )}
    </div>
  );
}

export default EntranceOperation;
