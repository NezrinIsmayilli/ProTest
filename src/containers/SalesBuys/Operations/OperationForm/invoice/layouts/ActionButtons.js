import React from 'react';
import { Button, Menu, Icon, Dropdown } from 'antd';
import { useHistory } from 'react-router-dom';
import {
  setActivePayments,
  updatePaymentDetails,
} from 'store/actions/sales-operation';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';

const invoiceTypesWithPayment = [
  'purchase',
  'sales',
  'returnFromCustomer',
  'returnToSupplier',
];

const MoreOptions = props => {
  const {
    submit,
    type,
    isDraft,
    invoiceType,
    handlePaymentClick,
    handleDraftInvoice,
    permissionsByKeyValue,
    disabled,
  } = props;
  const { permission } = permissionsByKeyValue.transaction_invoice_payment;
  return (
    <>
      <Menu className={styles.dropDownMenu}>
        {['1', '2', '3', '4'].includes(invoiceType) && !isDraft ? null : (
          <Menu.Item
            key="1"
            onClick={() => {
              submit(() => {
                handleDraftInvoice();
              });
            }}
          >
            <Icon type="user" />
            Qaralama
          </Menu.Item>
        )}
        {invoiceTypesWithPayment.includes(type) &&
        !isDraft &&
        permission === 2  && !disabled ? (
          <Menu.Item key="3" onClick={handlePaymentClick}>
            <Icon type="credit-card" />
            {type === 'purchase' ? 'Ödəniş et' : 'Ödəniş qəbul et'}
          </Menu.Item>
        ) : null}
      </Menu>
    </>
  );
};

const Buttons = props => {
  const {
    type = 'purchase',
    isDraft = false,
    invoiceType,
    setActivePayments,
    creatingInvoice = false,
    editingInvoice = false,
    invoicePaymentLoading = false,
    vatPaymentLoading = false,
    createExpensePaymentLoading = false,
    permissionsByKeyValue,
    vat,
    form,
    activePayments,
    handleNewInvoice,
    handleDraftInvoice,
    materialsLoading,
    productionExpensesListLoading,
    selectedMaterialLoading,
    selectedEmployeeExpenseLoading,
    selectedExpenseLoading,
    productionInfoLoading,
    discount,
    loader,
    loading,
  } = props;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const tab = urlParams.get('goback');
  const { percentage } = vat;
  const { submit } = form;
  const handlePaymentClick = () => {
    setActivePayments({
      newActivePayments: percentage ? ['1', '2'] : ['1'],
    });
  };

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
        loading={
          creatingInvoice ||
          editingInvoice ||
          invoicePaymentLoading ||
          vatPaymentLoading ||
          createExpensePaymentLoading ||
          materialsLoading ||
          productionExpensesListLoading ||
          selectedMaterialLoading ||
          selectedEmployeeExpenseLoading ||
          selectedExpenseLoading ||
          productionInfoLoading ||
          loader ||
          loading
        }
        disabled={creatingInvoice ||
          editingInvoice ||
          invoicePaymentLoading ||
          vatPaymentLoading ||
          createExpensePaymentLoading ||
          materialsLoading ||
          productionExpensesListLoading ||
          selectedMaterialLoading ||
          selectedEmployeeExpenseLoading ||
          selectedExpenseLoading ||
          productionInfoLoading ||
          loader ||
          loading
        }
        style={{ marginRight: '10px' }}
      >
        Təsdiq et
      </Button>
      {activePayments?.length !== 0 ||
      type === 'import-purchase' ||
      (['5', '6'].includes(invoiceType) && !isDraft) ? null : (
        <Dropdown
          getPopupContainer={trigger => trigger.parentNode}
          disabled={invoiceType && Number(discount.percentage) === 100}
          overlay={
            <MoreOptions
              type={type}
              permissionsByKeyValue={permissionsByKeyValue}
              isDraft={isDraft}
              submit={submit}
              invoiceType={invoiceType}
              activePayments={activePayments}
              handleDraftInvoice={handleDraftInvoice}
              handlePaymentClick={handlePaymentClick}
              disabled={Number(discount.percentage) === 100}
            />
          }
        >
          <Button className={styles.dropDownButton}>
            Seçimlər <Icon type="down" />
          </Button>
        </Dropdown>
      )}
      <Button
        onClick={() => tab!==null? history.push('/sales/operations') :history.goBack()}
        style={{ marginLeft: '10px' }}
      >
        Imtina et
      </Button>
    </div>
  );
};

const mapStateToProps = state => ({
  vat: state.salesOperation.vat,
  endPrice: state.salesOperation.endPrice,
  createExpensePaymentLoading: state.loadings.createExpensePayment,
  activePayments: state.salesOperation.activePayments,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  invoicePaymentLoading: state.loadings.createInvoicePayment,
  vatPaymentLoading: state.loadings.createVatPayment,
  creatingInvoice: state.loadings.createInvoiceOperation,
  editingInvoice: state.loadings.editInvoiceOperation,
  materialsLoading: state.loadings.fetchMaterialList,
  productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
  selectedMaterialLoading: state.loadings.fetchProductionMaterialExpense,
  selectedEmployeeExpenseLoading: state.loadings.fetchProductionEmployeeExpense,
  selectedExpenseLoading: state.loadings.fetchProductionExpense,
  productionInfoLoading: state.loadings.productionInfo,
  discount: state.salesOperation.discount,
});
export const ActionButtons = connect(
  mapStateToProps,
  {
    updatePaymentDetails,
    setActivePayments,
  }
)(Buttons);
