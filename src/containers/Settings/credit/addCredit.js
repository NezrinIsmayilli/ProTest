/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ReactComponent as PlusIcon } from 'assets/img/icons/plus.svg';
import { ReactComponent as MinusIcon } from 'assets/img/icons/minus.svg';
import {
  ProModal,
  ProInput,
  ProFormItem,
  SettingsCollapse,
  SettingsPanel,
} from 'components/Lib';
import {
  createCreditType,
  fetchCreditTypes,
  editCreditType,
} from 'store/actions/settings/credit';
import { Button, Form, Row, Col, Spin } from 'antd';
import { requiredRule, minLengthRule, shortTextMaxRule } from 'utils/rules';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const AddCreditModal = props => {
  const {
    isVisible,
    form,
    createCreditType,
    editCreditType,
    fetchCreditTypes,
    selectedCreditType,
    toggleModal,
    selectedRowId,
    setSelectedRowId,
    selectedRowName,
    isLoading,
  } = props;

  const {
    getFieldDecorator,
    getFieldError,
    validateFields,
    setFieldsValue,
    getFieldValue,
    resetFields,
    setFields,
  } = form;

  const [numbersRow, setNumbersRow] = useState([undefined]);
  const [arrRow, setArrRow] = useState(undefined);

  const handleAddExpenseClick = (clickType = 'add', selectedIndex) => {
    if (clickType === 'add') {
      if (selectedCreditType && selectedCreditType.length > 0) {
        setArrRow(prevExpenses => [...getFieldValue('numbers'), null]);
      } else {
        setNumbersRow(prevExpenses => [...prevExpenses, null]);
      }
    }
    if (clickType === 'remove') {
      if (selectedCreditType && selectedCreditType.length > 0) {
        setArrRow(prevExpenses =>
          getFieldValue('numbers').filter(
            (prevExpense, index) => index !== selectedIndex
          )
        );
        setFieldsValue({
          numbers: getFieldValue('numbers').filter(
            (_, index) => index !== selectedIndex
          ),
        });
      } else {
        setNumbersRow(prevExpenses =>
          prevExpenses.filter((prevExpense, index) => index !== selectedIndex)
        );
        setFieldsValue({
          numbers: getFieldValue('numbers').filter(
            (_, index) => index !== selectedIndex
          ),
        });
      }
    }
  };

  useEffect(() => {
    if (selectedRowName && selectedRowId && selectedCreditType?.length > 0) {
      const arr = [];
      selectedCreditType.map(item =>
        arr.push({
          month: Number(item.month),
          creditPercentage: Number(item.creditPercentage),
          depositPercentage: Number(item.depositPercentage),
        })
      );
      setArrRow(arr);
      setFieldsValue({
        creditType: selectedRowName,
      });
    } else {
      setNumbersRow([undefined]);
      setFieldsValue({
        creditType: null,
        numbers: [
          {
            month: undefined,
            creditPercentage: undefined,
            depositPercentage: undefined,
          },
        ],
      });
      setArrRow(undefined);
    }
  }, [selectedRowName, selectedRowId, selectedCreditType]);

  useEffect(() => {
    if (arrRow) {
      setFieldsValue({
        numbers: arrRow,
      });
    } else {
      setFieldsValue({
        numbers: [
          {
            month: undefined,
            creditPercentage: undefined,
            depositPercentage: undefined,
          },
        ],
      });
    }
  }, [arrRow]);

  const handleModal = () => {
    setSelectedRowId(undefined);
    toggleModal();
  };

  const handleCompleteOperation = event => {
    event.preventDefault();
    if (
      getFieldValue('numbers').map(number => Number(number.month)).length ===
      new Set(getFieldValue('numbers').map(number => Number(number.month))).size
    ) {
      validateFields((errors, values) => {
        if (!errors) {
          const { creditType, numbers } = values;
          const newCreditType = {
            name: creditType,
            months_ul: numbers.map(
              ({ month, creditPercentage, depositPercentage }) => ({
                month: Number(month),
                creditPercentage: Number(creditPercentage),
                depositPercentage: Number(depositPercentage),
              })
            ),
          };
          if (selectedCreditType && selectedCreditType.length > 0) {
            editCreditType(
              selectedRowId,
              newCreditType,
              () => {
                handleModal();
                fetchCreditTypes();
                resetFields();
              },
              ({ error }) => {
                if (
                  error.response?.data?.error?.message ===
                  'This credit type already exists.'
                ) {
                  setFields({
                    creditType: {
                      value: getFieldValue('creditType'),
                      errors: [new Error('Bu kredit növü artıq mövcuddur.')],
                    },
                  });
                }
              }
            );
          } else {
            createCreditType(
              newCreditType,
              () => {
                toast.success('Əməliyyat uğurla tamamlandı.');
                handleModal();
                fetchCreditTypes();
                resetFields();
              },
              ({ error }) => {
                if (
                  error.response?.data?.error?.message ===
                  'This credit type already exists.'
                ) {
                  setFields({
                    creditType: {
                      value: getFieldValue('creditType'),
                      errors: [new Error('Bu kredit növü artıq mövcuddur.')],
                    },
                  });
                }
              }
            );
          }
        }
      });
    } else {
      toast.error('Eyni kredit müddəti birdən artıq daxil edilmişdir.');
    }
  };

  const handlePercentage = (event, value, index) => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
    if (
      value === 'depositPercentage'
        ? re.test(event.target.value) && Number(event.target.value) < 100
        : re.test(event.target.value) && Number(event.target.value) < 1000
    )
      return event.target.value;
    if (event.target.value === '') return null;
    return value === 'depositPercentage'
      ? getFieldValue(`numbers[${index}].depositPercentage`)
      : getFieldValue(`numbers[${index}].creditPercentage`);
  };

  const handleAmount = (event, index) => {
    const re = /^[0-9]{1,9}$/;
    if (
      re.test(event.target.value) &&
      Number(event.target.value) < 100 &&
      Number(event.target.value) > 0
    ) {
      getFieldValue('numbers').map((number, idx) => {
        if (Number(number.month) === Number(event.target.value)) {
          setFields({
            [`numbers[${idx}].month`]: {
              name: `numbers[${idx}].month`,
              value: getFieldValue(`numbers[${idx}].month`),
              errors: [
                new Error('Eyni kredit müddəti birdən artıq daxil edilmişdir.'),
              ],
            },
            [`numbers[${index}].month`]: {
              name: `numbers[${index}].month`,
              value: getFieldValue(`numbers[${index}].month`),
              errors: [
                new Error('Eyni kredit müddəti birdən artıq daxil edilmişdir.'),
              ],
            },
          });
        } else {
          setFields({
            [`numbers[${idx}].month`]: {
              name: `numbers[${idx}].month`,
              value: getFieldValue(`numbers[${idx}].month`),
              errors: undefined,
            },
          });
        }
      });
      return event.target.value;
    }
    if (event.target.value === '') return null;
    return getFieldValue(`numbers[${index}].month`);
  };

  return (
    <ProModal
      maskClosable
      width={700}
      isVisible={isVisible}
      customStyles={styles.AddSerialNumbersModal}
      handleModal={handleModal}
    >
      <Spin spinning={selectedRowId ? isLoading : false}>
        <Form onSubmit={handleCompleteOperation}>
          <div className={styles.AddFromCatalog}>
            <h2>
              {selectedRowId ? 'Düzəliş et' : 'Yeni kredit növü əlavə et'}
            </h2>
            <div className={styles.selectBox}>
              <ProFormItem
                label="Kredit növü"
                help={getFieldError('creditType')?.[0]}
                customStyle={styles.formItem}
              >
                {getFieldDecorator('creditType', {
                  rules: [requiredRule, minLengthRule, shortTextMaxRule],
                })(<ProInput placeholder="Yazın" />)}
              </ProFormItem>
            </div>
            <SettingsCollapse
              className={styles.creditCollapse}
              style={{ margin: 0, padding: 0 }}
              accordion={false}
              defaultActiveKey={['1']}
            >
              <SettingsPanel
                className={styles.lastRow}
                style={{ margin: '0 0 10px 0', padding: 0 }}
                header={
                  <p className={styles.creditHeader}>
                    Aylar üzrə faizlərin tənzimlənməsi
                  </p>
                }
                key={1}
              >
                {selectedCreditType && selectedCreditType.length > 0
                  ? arrRow?.map((numbers, index) => (
                      <Row>
                        <Col style={{ padding: '2px' }} span={7}>
                          <ProFormItem
                            label="Kredit müddəti (Ay)"
                            customStyle={styles.formItem}
                            help={getFieldError(`numbers[${index}].month`)?.[0]}
                          >
                            {getFieldDecorator(`numbers[${index}].month`, {
                              getValueFromEvent: event =>
                                handleAmount(event, index),
                              rules: [requiredRule],
                            })(<ProInput placeholder="Yazın" />)}
                          </ProFormItem>
                        </Col>
                        <Col style={{ padding: '2px' }} span={7}>
                          <ProFormItem
                            label="Kredit faizi (%)"
                            customStyle={styles.formItem}
                            help={
                              getFieldError(
                                `numbers[${index}].creditPercentage`
                              )?.[0]
                            }
                          >
                            {getFieldDecorator(
                              `numbers[${index}].creditPercentage`,
                              {
                                getValueFromEvent: event =>
                                  handlePercentage(
                                    event,
                                    'creditPercentage',
                                    index
                                  ),
                                rules: [requiredRule],
                              }
                            )(<ProInput placeholder="Yazın" />)}
                          </ProFormItem>
                        </Col>
                        <Col style={{ padding: '2px' }} span={8}>
                          <ProFormItem
                            label="Depozit (%)"
                            customStyle={styles.formItem}
                            help={
                              getFieldError(
                                `numbers[${index}].depositPercentage`
                              )?.[0]
                            }
                          >
                            {getFieldDecorator(
                              `numbers[${index}].depositPercentage`,
                              {
                                getValueFromEvent: event =>
                                  handlePercentage(
                                    event,
                                    'depositPercentage',
                                    index
                                  ),
                                rules: [requiredRule],
                              }
                            )(<ProInput placeholder="Yazın" />)}
                          </ProFormItem>
                        </Col>
                        <Col span={2}>
                          <ProFormItem label=" ">
                            <div
                              style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {index === 0 ? (
                                <PlusIcon
                                  color="#FF716A"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() =>
                                    handleAddExpenseClick('add', index)
                                  }
                                />
                              ) : (
                                <MinusIcon
                                  color="#FF716A"
                                  style={{ cursor: 'pointer' }}
                                  onClick={async v => {
                                    handleAddExpenseClick('remove', index);
                                  }}
                                />
                              )}
                            </div>
                          </ProFormItem>
                        </Col>
                      </Row>
                    ))
                  : numbersRow.map((numbers, index) => (
                      <Row>
                        <Col style={{ padding: '2px' }} span={7}>
                          <ProFormItem
                            label="Kredit müddəti (Ay)"
                            customStyle={styles.formItem}
                            help={getFieldError(`numbers[${index}].month`)?.[0]}
                          >
                            {getFieldDecorator(`numbers[${index}].month`, {
                              getValueFromEvent: event =>
                                handleAmount(event, index),
                              rules: [requiredRule],
                            })(<ProInput placeholder="Yazın" />)}
                          </ProFormItem>
                        </Col>
                        <Col style={{ padding: '2px' }} span={7}>
                          <ProFormItem
                            label="Kredit faizi (%)"
                            customStyle={styles.formItem}
                            help={
                              getFieldError(
                                `numbers[${index}].creditPercentage`
                              )?.[0]
                            }
                          >
                            {getFieldDecorator(
                              `numbers[${index}].creditPercentage`,
                              {
                                getValueFromEvent: event =>
                                  handlePercentage(
                                    event,
                                    'creditPercentage',
                                    index
                                  ),
                                rules: [requiredRule],
                              }
                            )(<ProInput placeholder="Yazın" />)}
                          </ProFormItem>
                        </Col>
                        <Col style={{ padding: '2px' }} span={8}>
                          <ProFormItem
                            label="Depozit (%)"
                            customStyle={styles.formItem}
                            help={
                              getFieldError(
                                `numbers[${index}].depositPercentage`
                              )?.[0]
                            }
                          >
                            {getFieldDecorator(
                              `numbers[${index}].depositPercentage`,
                              {
                                getValueFromEvent: event =>
                                  handlePercentage(
                                    event,
                                    'depositPercentage',
                                    index
                                  ),
                                rules: [requiredRule],
                              }
                            )(<ProInput placeholder="Yazın" />)}
                          </ProFormItem>
                        </Col>
                        <Col span={2}>
                          <ProFormItem label=" ">
                            <div
                              style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {index === 0 ? (
                                <PlusIcon
                                  color="#FF716A"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() =>
                                    handleAddExpenseClick('add', index)
                                  }
                                />
                              ) : (
                                <MinusIcon
                                  color="#FF716A"
                                  style={{ cursor: 'pointer' }}
                                  onClick={async v => {
                                    handleAddExpenseClick('remove', index);
                                  }}
                                />
                              )}
                            </div>
                          </ProFormItem>
                        </Col>
                      </Row>
                    ))}
              </SettingsPanel>
            </SettingsCollapse>
            <div className={styles.button}>
              <Button
                type="primary"
                className={styles.confirmButton}
                htmlType="submit"
              >
                Təsdiq et
              </Button>
            </div>
          </div>
        </Form>
      </Spin>
    </ProModal>
  );
};
const mapStateToProps = state => ({
  isLoading: state.loadings.fetchCreditType,
  creditTypes: state.creditReducer.creditTypes,
});

export default connect(
  mapStateToProps,
  {
    createCreditType,
    editCreditType,
    fetchCreditTypes,
  }
)(Form.create({ name: 'CreditForm' })(AddCreditModal));
