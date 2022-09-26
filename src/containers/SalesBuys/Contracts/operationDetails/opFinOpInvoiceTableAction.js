import React, { useState } from 'react';
import { connect } from 'react-redux';
import { DetailButton } from 'components/Lib';
import styles from '../../../Warehouse/styles.module.scss';
import { AddFormModal } from '../../../Settings/#shared';
import OpFinOpInvoiceMoreDetails from './opFinOpInvoiceMoreDetails';

function OpFinOpInvoiceTableAction({ row, ...rest }) {
  const [details, setDetails] = useState(false);

  const handleDetailsModal = () => setDetails(!details);
  return (
    <div className={styles.productTableAction}>
      <DetailButton onClick={handleDetailsModal} />
      <AddFormModal
        withOutConfirm
        width={800}
        onCancel={handleDetailsModal}
        visible={details}
      >
        <OpFinOpInvoiceMoreDetails
          onCancel={handleDetailsModal}
          visible={details}
          row={row}
          {...rest}
        />
      </AddFormModal>
    </div>
  );
}

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {}
)(OpFinOpInvoiceTableAction);
