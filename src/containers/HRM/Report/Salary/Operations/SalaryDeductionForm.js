/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import useForm from 'react-hook-form';
import { FormInput, ProFormItem } from 'components/Lib';
import { Button, Modal, InputNumber } from 'antd';
import {
  fetchHRMReports,
  createSalaryDeduction,
} from 'store/actions/hrm/report';
import { toastHelper } from 'utils';
import { history } from 'utils/history';
import styles from './styles.module.scss';

const returnUrl = '/hrm/report/salary';

function SalaryDeductionForm(props) {
  const {
    fetchHRMReports,
    open,
    handleCancel,
    createSalaryDeduction,
    selectedYear,
    selectedMonth,
    infoData,
    isLoading,
  } = props;

  const { name, surname, salaryDeduction } = infoData || {};

  const { register, handleSubmit, reset, getValues, setValue } = useForm();

  useEffect(() => {
    register({ name: 'amount' }, { required: 'error' });
    setValue('amount', salaryDeduction);
  }, [salaryDeduction]);

  const { amount } = getValues();

  const handleCreateSalaryDeduction = data => {
    const postData = {
      year: selectedYear,
      month: selectedMonth,
      amount: Number(data.amount),
      note: data.note || null,
      employee: infoData.id,
    };
    createSalaryDeduction(
      postData,
      onSuccessCallBack('Maaş tutulması əlavə olundu.')
    );
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
    setValue('amount', salaryDeduction);
    reset();
  }

  function salaryDeductionHandler(num) {
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
        onSubmit={handleSubmit(handleCreateSalaryDeduction)}
      >
        <ProFormItem label="Tutulma məbləğı (AZN)">
          <InputNumber
            className={styles.widthFull}
            min={0}
            maxLength={10}
            name="amount"
            onChange={salaryDeductionHandler}
            value={amount}
          />
        </ProFormItem>
        <FormInput label="Qeyd" ref={register} name="note" maxLength={30} />
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
  isLoading: !!state.loadings.createSalaryDeduction,
});

export default connect(
  mapStateToProps,
  {
    createSalaryDeduction,
    fetchHRMReports,
  }
)(SalaryDeductionForm);
