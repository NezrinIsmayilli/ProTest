import React, { useState } from 'react';
import { connect } from 'react-redux';
import { DetailButton, ProModal } from 'components/Lib';
import styles from 'containers/Warehouse/styles.module.scss';
import OpFinOpInvoiceMoreDetails from './opFinOpInvoiceMoreDetails';

function OpFinOpInvoiceTableAction({ row, ...rest }) {
  const [details, setDetails] = useState(false);

  const handleDetailsModal = () => setDetails(!details);
  return (
    <div className={styles.productTableAction}>
      <DetailButton onClick={handleDetailsModal} />
      <ProModal
        maskClosable
        padding
        width={800}
        handleModal={handleDetailsModal}
        isVisible={details}
      >
        <OpFinOpInvoiceMoreDetails
          onCancel={handleDetailsModal}
          visible={details}
          row={row}
          {...rest}
        />
      </ProModal>
    </div>
  );
}

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {}
)(OpFinOpInvoiceTableAction);
