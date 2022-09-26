import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Form, Table } from 'antd';
import { setSelectedProductionExpense } from 'store/actions/sales-operation';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import { ProDatePicker, ProFormItem, ProInput } from 'components/Lib';
import { dateFormat, formatNumberToLocale, defaultNumberFormat } from 'utils';
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import swal from '@sweetalert/with-react';
import { minLengthRule, requiredRule } from 'utils/rules';
import EditModal from './editModal';
import styles from '../../../styles.module.scss';

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

function ExpenseAdd({
  visible,
  form,
  mainCurrency,
  selectedProductionExpense,
  setSelectedProductionExpense,
  changeCost,
  disabledDate,
}) {
  const componentRef = useRef();
  const dispatch = useDispatch();
  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    getFieldValue,
  } = form;

  const [editModal, setEditModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState(undefined);
  useEffect(() => {
    if (!visible) {
      setFieldsValue({
        name: null,
        operationDate: null,
        cost: null,
      });
    }
  }, [visible]);
  const handleAmount = event => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,4}$/;
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
      text: 'Əməliyyatı silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        const selectedExpense = selectedProductionExpense.filter(
          (selectedProduct, index) => index === id
        );
        const newSelectedProductionExpense = selectedProductionExpense.filter(
          (selectedProduct, index) => index !== id
        );
        dispatch(
          setSelectedProductionExpense({ newSelectedProductionExpense })
        );
        changeCost({
          price: math.mul(Number(selectedExpense[0]?.price || 0), -1),
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
      dataIndex: 'price',
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
      render: (value, row, index) => (
        <PopContent
          id={index}
          data={row}
          //   isEditDisabled={isEditDisabled}
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
        const { name, operationDate, cost } = values;

        const data = {
          name,
          date: operationDate.format(dateFormat),
          price: Number(cost),
        };
        dispatch(
          setSelectedProductionExpense({
            newSelectedProductionExpense: [data, ...selectedProductionExpense],
          })
        );
        changeCost(data);
        setFieldsValue({
          name: null,
          operationDate: null,
          cost: null,
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
        currencyCode={mainCurrency?.code}
        changeCost={changeCost}
      />
      <div className={styles.exportBox}>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginRight: '50px',
          }}
        >
          Xərclər
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
            })(<ProDatePicker disabledDate={disabledDate} />)}
          </ProFormItem>
          <ProFormItem label="Adı" help={getFieldError('name')?.[0]}>
            {getFieldDecorator('name', {
              rules: [requiredRule, minLengthRule],
            })(
              <ProInput
              // disabled={isEditDisabled}
              />
            )}
          </ProFormItem>
          <ProFormItem
            label={`Məbləğ (${mainCurrency?.code})`}
            help={getFieldError('cost')?.[0]}
          >
            {getFieldDecorator('cost', {
              getValueFromEvent: event => handleAmount(event),
              rules: [requiredRule],
            })(
              <ProInput
              // disabled={isEditDisabled}
              />
            )}
          </ProFormItem>
          <Button
            type="primary"
            // disabled={isEditDisabled}
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
          dataSource={selectedProductionExpense}
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
            selectedProductionExpense.reduce(
              (total, { price }) => math.add(total, Number(price) || 0),
              0
            )
          )
        )} ${mainCurrency?.code} `}
      />
    </div>
  );
}
const mapStateToProps = state => ({
  selectedProductionExpense: state.salesOperation.selectedProductionExpense,
});

export default connect(
  mapStateToProps,
  { setSelectedProductionExpense }
)(Form.create({ name: 'ProductionExpenseForm' })(ExpenseAdd));
