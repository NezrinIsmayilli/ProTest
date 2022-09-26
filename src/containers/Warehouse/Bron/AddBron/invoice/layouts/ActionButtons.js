import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';

const Buttons = props => {
  const {
    creatingInvoice = false,
    editingInvoice = false,
    form,
    handleNewInvoice,
  } = props;

  const { submit } = form;

  const history = useHistory();
  return (
    <div className={styles.ActionButtons}>
      <Button
        type="primary"
        onClick={() => {
          submit(() => {
            handleNewInvoice();
          });
        }}
        loading={creatingInvoice || editingInvoice}
        style={{ marginRight: '10px' }}
      >
        Təsdiq et
      </Button>
      <Button
        onClick={() => history.push('/warehouse/bron')}
        style={{ marginLeft: '10px' }}
      >
        Imtina et
      </Button>
    </div>
  );
};

const mapStateToProps = state => ({
  creatingInvoice: state.loadings.createInvoiceOperation,
  editingInvoice: state.loadings.editInvoiceOperation,
});
export const ActionButtons = connect(
  mapStateToProps,
  {}
)(Buttons);
