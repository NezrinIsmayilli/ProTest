/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useLayoutEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { Row, Col, Input, Button, Form, InputNumber, Spin } from 'antd';
import { ProSelect, ProWrapper, ProContent, ProFormItem } from 'components/Lib';

// actions
import {
  createBalanceTransaction,
  editBalanceTransaction,
} from 'store/actions/finance/initialBalance';
import {
  getTransaction,
  // resetTransactionInfo,
  resetOperationsList,
} from 'store/actions/finance/operations';
import {
  fetchCashboxNames,
  fetchActiveCurrencies,
} from 'store/actions/settings/kassa';

// utils
import { toastHelper, formItemSize, messages, accountTypeOptions } from 'utils';

import styles from './styles.module.scss';

const returnUrl = `/finance/operations?tab=7`;

const requiredRule = {
  required: true,
  message: messages.requiredText,
};

const maxLengthRule = {
  max: 240,
  message: messages.maxtextLimitMessage(240),
};

function InitialBalance(props) {
  const {
    form,
    // data
    cashBoxNames,
    cashBoxNamesLoading,
    activeCurrencies,
    currenciesLoading,
    profile,
    transaction,
    transactionLoading,
    actionLoading,
    // actions
    createBalanceTransaction,
    editBalanceTransaction,
    getTransaction,
    // resetTransactionInfo,
    resetOperationsList,
    fetchCashboxNames,
    fetchActiveCurrencies,
  } = props;

  useLayoutEffect(() => {
    if (activeCurrencies.length === 0) {
      fetchActiveCurrencies('fetchActiveCurrencies');
    }

    return () => {
      resetOperationsList();
    };
  }, []);

  const history = useHistory();
  const { id = undefined } = useParams();

  const { id: executor } = profile;

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    getFieldValue,
  } = form;

  const accountType = getFieldValue('accountType');

  useEffect(() => {
    if (accountType) {
      fetchCashboxNames({ attribute: accountType });
    }
  }, [accountType]);

  useEffect(() => {
    if (id) {
      getTransaction(id);
    }
  }, [id]);

  useEffect(() => {
    if (transaction && id) {
      const {
        fromCashboxTypeId,
        fromCashboxId,
        executorId,
        amount,
        currencyId,
        description,
      } = transaction;

      fetchCashboxNames({ attribute: fromCashboxTypeId });

      setFieldsValue({
        accountType: fromCashboxTypeId,
        cashboxName: fromCashboxId,
        executor: executorId,
        amount,
        currency: currencyId,
        description,
      });
    }
  }, [transaction]);

  const onSuccessCallback = () => toastHelper(history, returnUrl);

  const handleSubmit = e => {
    e.preventDefault();

    validateFields((errors, values) => {
      if (!errors) {
        const { cashboxName, amount, currency, description = null } = values;

        const data = {
          cashboxName,
          executor,
          amount,
          currency,
          description,
        };

        if (id) {
          return editBalanceTransaction(id, data, onSuccessCallback);
        }
        return createBalanceTransaction(data, onSuccessCallback);
      }
    });
  };

  const handleCancel = () => history.replace(returnUrl);

  return (
    <ProWrapper>
      <section className="operationsWrapper">
        <div className={styles.containerFluid}>
          <div className={styles.nameCode}>{`İlkin qalıq ${
            id ? 'redaktə' : 'əlavə'
          } olunması`}</div>

          <Form onSubmit={handleSubmit} noValidate>
            <Spin spinning={transactionLoading} size="large">
              <ProContent title="Mədaxil üzrə məlumat">
                <Row gutter={32}>
                  <Col span={8}>
                    <ProFormItem
                      label="Hesab növü"
                      help={getFieldError('accountType')?.[0]}
                    >
                      {getFieldDecorator('accountType', {
                        rules: [requiredRule],
                      })(
                        <ProSelect
                          data={accountTypeOptions}
                          size={formItemSize}
                        />
                      )}
                    </ProFormItem>

                    <ProFormItem
                      label="Hesab"
                      help={getFieldError('cashboxName')?.[0]}
                    >
                      {getFieldDecorator('cashboxName', {
                        rules: [requiredRule],
                      })(
                        <ProSelect
                          size={formItemSize}
                          disabled={!accountType || cashBoxNamesLoading}
                          loading={cashBoxNamesLoading}
                          data={cashBoxNames[accountType]}
                          notUseMemo
                        />
                      )}
                    </ProFormItem>
                  </Col>

                  <Col span={8}>
                    <ProFormItem label="Qeyd" autoHeight>
                      {getFieldDecorator('description', {
                        rules: [maxLengthRule],
                      })(<Input.TextArea rows={6}></Input.TextArea>)}
                    </ProFormItem>
                  </Col>
                </Row>
                <Row gutter={32}>
                  <Col span={8}>
                    <ProFormItem
                      label="Məbləğ"
                      help={getFieldError('amount')?.[0]}
                    >
                      {getFieldDecorator('amount', {
                        rules: [requiredRule],
                      })(
                        <InputNumber
                          className={styles.numericInput}
                          size={formItemSize}
                          min={0.01}
                          maxLength={8}
                          precision={2}
                        />
                      )}
                    </ProFormItem>
                  </Col>

                  <Col span={4}>
                    <ProFormItem
                      label="Valyuta"
                      help={getFieldError('currency')?.[0]}
                    >
                      {getFieldDecorator('currency', {
                        rules: [requiredRule],
                      })(
                        <ProSelect
                          size={formItemSize}
                          loading={currenciesLoading}
                          keys={['code']}
                          data={activeCurrencies}
                        />
                      )}
                    </ProFormItem>
                  </Col>
                </Row>
              </ProContent>

              <div>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={actionLoading}
                >
                  Təsdiq et
                </Button>
                <Button
                  style={{
                    marginLeft: 10,
                  }}
                  size="large"
                  onClick={handleCancel}
                >
                  İmtina
                </Button>
              </div>
            </Spin>
          </Form>
        </div>
      </section>
    </ProWrapper>
  );
}

const mapStateToProps = state => ({
  cashBoxNames: state.kassaReducer.cashBoxNames,
  cashBoxNamesLoading: state.kassaReducer.isLoading,
  activeCurrencies: state.kassaReducer.activeCurrencies,
  currenciesLoading: !!state.loadings.fetchActiveCurrencies,
  profile: state.profileReducer.profile,
  transaction: state.financeOperationsReducer.transaction,
  transactionLoading: state.financeOperationsReducer.isLoading,
  actionLoading: !!state.loadings.BalanceTransaction,
});

export default connect(
  mapStateToProps,
  {
    createBalanceTransaction,
    editBalanceTransaction,
    getTransaction,
    // resetTransactionInfo,
    fetchCashboxNames,
    fetchActiveCurrencies,
    resetOperationsList,
  }
)(Form.create({ name: 'stocksOperations' })(InitialBalance));
