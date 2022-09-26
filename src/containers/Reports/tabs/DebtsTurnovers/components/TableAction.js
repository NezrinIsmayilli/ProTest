import React, { useState } from 'react';
import { Button } from 'antd';
import { MoreDetails } from './MoreDetails';
import styles from '../../styles.module.scss';

export function TableAction({
  allBusinessUnits,
  profile,
  row,
  tenant,
  productionInvoices,
}) {
  const [details, setDetails] = useState(false);

  const handlePrintOperation = () => {
    setDetails(false);
  };

  return (
    <div className={styles.action}>
      <Button
        className={styles.customBtn}
        onClick={() => setDetails(true)}
        shape="circle"
        icon="eye"
      />
      <MoreDetails
        allBusinessUnits={allBusinessUnits}
        profile={profile}
        details={details}
        handlePrintOperation={handlePrintOperation}
        setDetails={setDetails}
        productionInvoices={productionInvoices}
        data={row}
        tenant={tenant}
      />
    </div>
  );
}
