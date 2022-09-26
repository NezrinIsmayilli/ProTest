import React, { useState } from 'react';
import { Can, ProDots, ProDotsItem } from 'components/Lib';
import { Button, Modal, Input, Divider } from 'antd';
import { useHistory } from 'react-router-dom';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import { accessTypes } from 'config/permissions';
import { toast } from 'react-toastify';
import { MoreDetails } from './MoreDetails';
import styles from '../styles.module.scss';

const { TextArea } = Input;

const operationTypesByPermissionKey = {
  9: 'transaction_invoice_payment',
  10: 'transaction_invoice_payment',
  8: 'transaction_expense_payment',
  4: 'money_transfer',
  6: 'salary_payment',
  7: 'transaction_balance_creation_payment',
  11: 'transaction_advance_payment',
  12: 'transaction_tenant_person_payment',
  13: 'transaction_exchange',
};

export function TableAction({
  allBusinessUnits,
  profile,
  row,
  deleteTransaction,
  permissionsByKeyValue,
  highestFinanceOperationKey,
  tenant,
  productionInvoices,
}) {
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [description, setDescription] = useState();
  const handleDelete = () => {
    setVisible(false);
    deleteTransaction(row.cashboxTransactionId, description, row);
    // setTimeout(() => {
    //   toast.success('Əməliyyat uğurla tamamlandı.');
    // }, 2000);
  };
  const handlePrintOperation = () => {
    setDetails(false);
  };

  const isRemovable =
    permissionsByKeyValue[operationTypesByPermissionKey[row.transactionType]]
      ?.permission === 2;
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
      <Can I={accessTypes.manage} a={highestFinanceOperationKey}>
        <ProDots
            isDisabled={ row.status === 'deleted' ||
            !isRemovable ||
            row.paymentInvoiceType === 10
            }
        >
          {row.transactionType !== 12 && row.transactionType !== 11 &&
            <ProDotsItem
                label="Düzəliş et"
                icon="pencil"
                onClick={() => history.push(`/finance/operations/edit/${row?.cashboxTransactionId}`)}
            />}
            <ProDotsItem
                label="Sil"
                icon="trash"
                onClick={() => setVisible(true)}
            />
        </ProDots>
        {/* <Button
          disabled={
            row.status === 'deleted' ||
            !isRemovable ||
            row.paymentInvoiceType === 10
          }
          onClick={() => setVisible(true)}
          className={styles.customBtn}
          shape="circle"
          icon="delete"
        /> */}
      </Can>
      <Modal
        afterClose={() => setDescription(null)}
        visible={visible}
        footer={null}
        className={styles.customModal}
        onCancel={() => setVisible(false)}
      >
        <div style={{ padding: 24, paddingBottom: 12 }}>
          <h6 className={styles.modalTitle}>Silinmə səbəbini qeyd edin</h6>
          <TextArea
            rows={4}
            onChange={e => {
              setDescription(e.target.value);
            }}
            value={description}
          />

          <Divider style={{ marginBottom: 0 }} />
        </div>
        <div className={styles.modalAction}>
          <Button
            type="primary"
            onClick={handleDelete}
            style={{ marginRight: 6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MdCheckCircle size={18} style={{ marginRight: 4 }} />
              Təsdiq et
            </div>
          </Button>
          <Button
            type="primary"
            className={styles.rejectButton}
            onClick={() => setVisible(false)}
            style={{ marginRight: 6 }}
          >
            <MdClose size={18} style={{ marginRight: 4 }} />
            İmtina
          </Button>
        </div>
      </Modal>
    </div>
  );
}
