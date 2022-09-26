/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import useForm from 'react-hook-form';
import { ProFormItem } from 'components/Lib';
import { Button, Modal, InputNumber } from 'antd';
import { fetchHRMReports, createSalaryPayment } from 'store/actions/hrm/report';
import { toastHelper } from 'utils';
import { history } from 'utils/history';
import styles from './styles.module.scss';

const returnUrl = '/hrm/report/salary';

function PayForm(props) {
  const {
    fetchHRMReports,
    open,
    handleCancel,
    createSalaryPayment,
    selectedYear,
    selectedMonth,
    infoData,
    isLoading,
  } = props;
  const { name, surname, currentBalance } = infoData || {};

  const { register, handleSubmit, reset, setValue, getValues } = useForm();

  useEffect(() => {
    register({ name: 'amount' }, { required: 'error' });
    setValue('amount', currentBalance);
  }, [currentBalance]);

  const { amount } = getValues();

  const handleCreateSalaryPayment = data => {
    const postData = {
      amount: data.amount,
      employee: infoData.id,
    };
    createSalaryPayment(postData, onSuccessCallBack('Ödəniş əlavə olundu.'));
  };

  function onSuccessCallBack(message) {
    return () => {
      fetchHRMReports(selectedYear, selectedMonth);
      handleCancel();
      resetForm();
      return toastHelper(history, returnUrl, message);
    };
  }

  function resetForm() {
    setValue('amount', currentBalance);
    reset();
  }

  function currentBalanceHandler(num) {
    setValue('amount', Number(num).toFixed(2));
  }

  return (
    <Modal
      title={`${name} ${surname}`}
      visible={open}
      closable
      maskClosable
      footer={null}
      width={416}
      bodyStyle={{ padding: '0' }}
      onCancel={handleCancel}
    >
      <form
        className={styles.padding24}
        onSubmit={handleSubmit(handleCreateSalaryPayment)}
      >
        <ProFormItem label={`Ödəniş məbləği (${infoData.currencyCode})`}>
          <InputNumber
            className={styles.widthFull}
            min={0}
            maxLength={10}
            name="amount"
            value={amount}
            onChange={currentBalanceHandler}
          />
        </ProFormItem>
        <div className={`${styles.txtRight} ${styles.marginTop36}`}>
          <Button
            className={styles.cancelBtn}
            size="large"
            onClick={() => {
              handleCancel();
              resetForm();
            }}
          >
            İmtina
          </Button>
          <Button
            disabled={false}
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
          >
            Təsdiq et
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const mapStateToProps = state => ({
  isLoading: !!state.loadings.createSalaryPayment,
});

export default connect(
  mapStateToProps,
  {
    createSalaryPayment,
    fetchHRMReports,
  }
)(PayForm);
