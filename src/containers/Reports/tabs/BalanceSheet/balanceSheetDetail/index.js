import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Table } from 'antd';
import moment from 'moment';
import {
  createBalance,
  fetchBalance,
  deleteBalance,
} from 'store/actions/reports/balance-sheet';
import { ProDatePicker, ProFormItem, ProInput } from 'components/Lib';
import { dateFormat, formatNumberToLocale, defaultNumberFormat } from 'utils';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import swal from '@sweetalert/with-react';
import { minLengthRule, requiredRule } from 'utils/rules';
import EditModal from '../editModal';
import styles from '../styles.module.scss';

const math = require('exact-math');

export const PopContent = ({
  editClick,
  deleteClick,
  id,
  data,
  isEditDisabled,
}) => (
  <div className={styles.popContent}>
    {editClick && (
      <Button
        style={{ padding: '5px' }}
        disabled={isEditDisabled}
        className={styles.editIcon}
        type="button"
        onClick={() => editClick(id, data)}
      >
        <FaPencilAlt />
      </Button>
    )}
    {deleteClick && (
      <Button
        style={{ padding: '5px' }}
        type="button"
        disabled={isEditDisabled}
        className={styles.trashIcon}
        onClick={() => deleteClick(id)}
      >
        <FaTrash />
      </Button>
    )}
  </div>
);

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong></strong>
    <strong></strong>
    <strong>{quantity}</strong>
    <strong>{secondary}</strong>
  </div>
);

function BalanceSheetDetail({
  row,
  visible,
  form,
  balance,
  date,
  mainCurrency,
  deleteBalance,
  fetchBalance,
  createBalance,
  permissionsByKeyValue,
}) {
  const componentRef = useRef();
  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    getFieldValue,
  } = form;
  const { balance_sheet_report } = permissionsByKeyValue;
  const isEditDisabled = balance_sheet_report.permission !== 2;
  const [type, setType] = useState(undefined);
  const [editModal, setEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(undefined);
  useEffect(() => {
    if (!visible) {
      setType(undefined);
      setFieldsValue({
        product: null,
        operationDate: null,
        cost: null,
      });
    }
  }, [visible]);
  useEffect(() => {
    if (type) {
      fetchBalance({ filters: { types: [type], date } });
    }
  }, [type]);

  useEffect(() => {
    // eslint-disable-next-line default-case
    switch (row?.name) {
      case 'Qiymətli kağızlar':
        setType(1);
        break;
      case 'Öncədən ödənilmiş xərclər':
        setType(2);
        break;
      case 'Digər cari aktivlər':
        setType(3);
        break;
      case 'Torpaq, tikili, avadanlıqlar':
        setType(4);
        break;
      case 'Qeyri maddi aktivlər':
        setType(5);
        break;
      case 'Uzunmüddətli alacaqlar':
        setType(6);
        break;
      case 'Digər uzunmüddətli aktvilər':
        setType(7);
        break;
      case 'Bank kreditləri':
        setType(8);
        break;
    }
  }, [row]);
  const handleAmount = event => {
    const re = /^-?\d+\.?\d*$/;
    if (event.target.value === '-') {
      return event.target.value;
    }
    if (re.test(event.target.value)) return event.target.value;

    if (event.target.value === '') return null;
    return getFieldValue('cost');
  };
  const editClick = (id, row) => {
    setEditModal(!editModal);
    setSelectedRow(row);
    setSelectedItemForUpdate(id);
  };
  const onSuccessAddModal = () => {};
  const deleteClick = id => {
    swal({
      title: 'Diqqət!',
      text: 'Silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteBalance({
          id,
          onSuccess: () => {
            fetchBalance({
              filters: { types: [type], date },
            });
          },
        });
      }
    });
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'date',
      width: 180,
    },
    {
      title: 'Adı',
      dataIndex: 'name',
      width: 100,
      align: 'left',
      render: value => value,
    },
    {
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'amount',
      align: 'center',
      width: 80,
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: 'Seç',
      width: 90,
      align: 'right',
      render: row => (
        <PopContent
          id={row.id}
          data={row}
          isEditDisabled={isEditDisabled}
          editClick={editClick}
          deleteClick={deleteClick}
        />
      ),
    },
  ];

  const handleCompleteOperation = event => {
    event.preventDefault();
    validateFields((errors, values) => {
      if (!errors) {
        const { product, operationDate, cost } = values;

        const data = {
          name: product,
          date: operationDate.format(dateFormat),
          amount: Number(cost),
          type,
        };

        createBalance({
          data,
          onSuccessCallback: () => {
            fetchBalance({
              filters: { types: [type], date },
            });
            setFieldsValue({
              product: null,
              operationDate: null,
              cost: null,
            });
          },
        });
      }
    });
  };

  return (
    <div ref={componentRef} style={{ width: '100%', padding: '20px' }}>
      <EditModal
        isVisible={editModal}
        setIsVisible={setEditModal}
        onSuccessAddModal={onSuccessAddModal}
        row={selectedRow}
        selectedItemForUpdate={selectedItemForUpdate}
        type={type}
        date={date}
      />
      <div className={styles.exportBox}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '50px',
          }}
        >
          {row?.name}
        </span>
      </div>

      <div>
        {
          <div className={styles.infoWarning}>
            <p className={styles.fade}>
              Bu pəncərədə aparılan əməliyyatlar sizin hesablarda olan pul
              qalıqlarında əks olunmayacaq və sənədsiz əməliyyatlar
              sayılacaqdır.
            </p>
            <div>
              <ExclamationIcon />
            </div>
          </div>
        }
      </div>

      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <Form
          className={styles.balanceForm}
          layout="vertical"
          onSubmit={handleCompleteOperation}
        >
          <ProFormItem label="Tarix" help={getFieldError('operationDate')?.[0]}>
            {getFieldDecorator('operationDate', {
              getValueFromEvent: date => date,
              rules: [requiredRule],
            })(
              <ProDatePicker
                disabled={isEditDisabled}
                disabledDate={current =>
                  current && current > moment(date, 'DD-MM-YYYY')
                }
              />
            )}
          </ProFormItem>
          <ProFormItem label="Adı" help={getFieldError('product')?.[0]}>
            {getFieldDecorator('product', {
              rules: [requiredRule, minLengthRule],
            })(<ProInput disabled={isEditDisabled} />)}
          </ProFormItem>
          <ProFormItem
            label={`Dəyəri (${mainCurrency?.code})`}
            help={getFieldError('cost')?.[0]}
          >
            {getFieldDecorator('cost', {
              getValueFromEvent: event => handleAmount(event),
              rules: [requiredRule],
            })(<ProInput disabled={isEditDisabled} />)}
          </ProFormItem>
          <Button
            type="primary"
            disabled={isEditDisabled}
            className={styles.addCategoryButton}
            size="large"
            htmlType="submit"
          >
            <FaPlus className={styles.buttonIcon} />
          </Button>
        </Form>
      </div>
      <div
        className={styles.opInvTable}
        style={{
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 8,
          overflowY: 'auto',
        }}
      >
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={balance}
          className={styles.opInvoiceContentTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
      <FooterRow
        primary="Toplam"
        quantity={`${formatNumberToLocale(
          defaultNumberFormat(
            balance.reduce(
              (total, { amount }) => math.add(total, Number(amount) || 0),
              0
            )
          )
        )} ${mainCurrency?.code} `}
      />
    </div>
  );
}
const mapStateToProps = state => ({
  balance: state.balanceSheet.balance,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});

export default connect(
  mapStateToProps,
  { createBalance, fetchBalance, deleteBalance }
)(Form.create({ name: 'BalanceDetailForm' })(BalanceSheetDetail));
