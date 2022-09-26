import React, { useState } from 'react';
import { connect } from 'react-redux';
import { DetailButton, ProModal } from 'components/Lib';
import styles from 'containers/Warehouse/styles.module.scss';
import WritingOffInvoiceDetails from './writingOffInvoiceDetails';

function WritingOffInvoiceAction(props) {
  const { row } = props;
  const [visible, setVisible] = useState(false);

  const handleDetailsModal = () => setVisible(!visible);

  return (
    <div className={styles.productTableAction}>
      <DetailButton onClick={handleDetailsModal} />
      <ProModal
        maskClosable
        padding
        width={1300}
        handleModal={handleDetailsModal}
        isVisible={visible}
      >
        <WritingOffInvoiceDetails
          row={row}
          visible={visible}
          setVisible={setVisible}
        />
      </ProModal>
    </div>
  );
}

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {}
)(WritingOffInvoiceAction);
