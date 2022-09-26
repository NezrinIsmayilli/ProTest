import React from 'react';
import { Button, Menu, Icon, Dropdown } from 'antd';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';

const MoreOptions = props => {
  const { submit, handleSendToStock, permissionsByKeyValue } = props;
  const { permission } = permissionsByKeyValue.transaction_invoice_payment;
  return (
    <>
      <Menu className={styles.dropDownMenu}>
        {
          <Menu.Item
            key="1"
            onClick={() => {
              submit(() => {
                handleSendToStock();
              });
            }}
          >
            <Icon type="user" />
            Anbara göndər
          </Menu.Item>
        }
      </Menu>
    </>
  );
};

const Buttons = props => {
  const {
    url,
    disabled = false,
    creatingInvoice = false,
    editingInvoice = false,
    editDateAndWarehouseLoading = false,
    permissionsByKeyValue,
    form,
    handleNewInvoice,
    handleSendToStock,
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
        loading={creatingInvoice || editingInvoice || editDateAndWarehouseLoading}
        style={{ marginRight: '10px' }}
      >
        Təsdiq et
      </Button>
      {disabled ? (
        <Button className={styles.dropDownButton} disabled={disabled}>
          Seçimlər <Icon type="down" />
        </Button>
      ) : (
        <Dropdown
          getPopupContainer={trigger => trigger.parentNode}
          overlay={
            <MoreOptions
              permissionsByKeyValue={permissionsByKeyValue}
              submit={submit}
              handleSendToStock={handleSendToStock}
            />
          }
        >
          <Button className={styles.dropDownButton}>
            Seçimlər <Icon type="down" />
          </Button>
        </Dropdown>
      )}

      <Button onClick={() => history.goBack()} style={{ marginLeft: '10px' }}>
        Imtina et
      </Button>
    </div>
  );
};

const mapStateToProps = state => ({
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  creatingInvoice: state.loadings.createInvoiceOperation,
  editingInvoice: state.loadings.editInvoiceOperation,
  editDateAndWarehouseLoading: state.loadings.editDateAndWarehouseTransfer,
});
export const ActionButtons = connect(
  mapStateToProps,
  {}
)(Buttons);
