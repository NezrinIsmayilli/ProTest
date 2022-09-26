/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { connect, useDispatch } from 'react-redux';
import { ProFormItem, ProInput, ProWrapper, ProSelect } from 'components/Lib';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Form, Tabs, Row, Col, Button, Spin } from 'antd';
import { useHistory, Link } from 'react-router-dom';
import { requiredRule, minLengthRule, shortTextMaxRule } from 'utils/rules';
import {
  fetchBusinessUnitList,
  createBusinessUnit,
  editBusinessUnit,
  fetchUnitStructure,
  createUnitStructure,
  setSelectedUnitStructure,
  fetchUnitUser,
  createUnitUser,
  setSelectedUnitUser,
  fetchUnitStock,
  createUnitStock,
  setSelectedUnitStock,
  createUnitStockTransfer,
  fetchUnitCashbox,
  createUnitCashbox,
  setSelectedUnitCashbox,
  createUnitCashboxTransfer,
  handleResetFields,
  fetchUnitPriceType,
  createUnitPriceType,
  setSelectedUnitPriceType,
} from 'store/actions/businessUnit';
import { messages } from 'utils';
import styles from './styles.module.scss';
import { Users, Stocks, Structure, Cashbox, PriceType } from './tabs';

const { TabPane } = Tabs;
const returnUrl = `/business_unit/business_unit`;

const AddBusinessUnit = props => {
  const {
    form,
    fetchBusinessUnitList,
    editBusinessUnit,
    createBusinessUnit,
    businessUnits,
    fetchUnitUser,
    createUnitUser,
    setSelectedUnitUser,
    selectedUnitUser,
    fetchUnitStructure,
    createUnitStructure,
    selectedUnitStructure,
    setSelectedUnitStructure,
    fetchUnitStock,
    setSelectedUnitStock,
    selectedUnitStock,
    createUnitStock,
    createUnitStockTransfer,
    fetchUnitCashbox,
    createUnitCashbox,
    setSelectedUnitCashbox,
    selectedUnitCashbox,
    createUnitCashboxTransfer,
    fetchUnitPriceType,
    createUnitPriceType,
    setSelectedUnitPriceType,
    selectedUnitPriceType,

    handleResetFields,

    isLoading,
    createUnitLoading,
    createUnitStructureLoading,
    createUnitUserLoading,
    createUnitStockLoading,
    createUnitStockTransferLoading,
    createUnitCashboxLoading,
    createUnitCashboxTransferLoading,
    createUnitPriceTypeLoading,
  } = props;
  const {
    validateFields,
    getFieldDecorator,
    getFieldError,
    setFieldsValue,
    setFields,
    getFieldValue,
    submit,
  } = form;
  const history = useHistory();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');
  const dispatch = useDispatch();
  const [defaultPriceType, setDefaultPriceType] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [createCallBack, setCreateCallBack] = useState(null);

  const handleActiveTabChange = newTab => {
    setActiveTab(newTab);
  };

  useEffect(() => {
    fetchBusinessUnitList({ filters: { isDeleted: 0 } });
    return () => {
      handleResetFields();
    };
  }, []);

  useEffect(() => {
    if (id) {
      setActiveTab('1');
      fetchUnitUser({
        id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedUnitUser({
              newSelectedUnitUser: [
                ...data.map(item => ({
                  ...item,
                  editId: true,
                })),
              ],
            })
          );
        },
      });
      fetchUnitStructure({
        id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedUnitStructure({
              newSelectedUnitStructure: [
                ...data.map(item => ({
                  ...item,
                  editId: true,
                })),
              ],
            })
          );
        },
      });
      fetchUnitStock({
        id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedUnitStock({
              newSelectedUnitStock: [
                ...data.map(item => ({
                  ...item,
                  editId: true,
                  transferStocks: item.transferStocks.map(stock => ({
                    ...stock,
                    editId: true,
                  })),
                })),
              ],
            })
          );
        },
      });
      fetchUnitCashbox({
        id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedUnitCashbox({
              newSelectedUnitCashbox: [
                ...data.map(item => ({
                  ...item,
                  editId: true,
                  transferCashboxes: item.transferCashboxes.map(cashbox => ({
                    ...cashbox,
                    editId: true,
                  })),
                })),
              ],
            })
          );
        },
      });
      fetchUnitPriceType({
        id,
        onSuccess: ({ data }) => {
          dispatch(
            setSelectedUnitPriceType({
              newSelectedUnitPriceType: [
                ...data.map(item => ({
                  ...item,
                  editId: true,
                })),
              ],
            })
          );
        },
      });
    } else {
      setActiveTab('1');
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      setFieldsValue({
        blockType: 0,
        blockName: businessUnits?.find(item => item.id === Number(id))?.name,
      });
    } else {
      setFieldsValue({ blockType: 0 });
    }
  }, [id, businessUnits]);

  const handleCreateDatas = invoiceId => {
    const unitUser = {
      tenantPerson_ul: selectedUnitUser
        .filter(({ editId }) => !editId)
        .map(({ tenantPersonId }) => tenantPersonId),
      businessUnit: Number(invoiceId),
    };
    const unitStructure = {
      structure_ul: selectedUnitStructure
        .filter(({ editId }) => !editId)
        .map(({ id }) => id),
      businessUnit: Number(invoiceId),
    };
    const unitStock = {
      stock_ul: selectedUnitStock
        .filter(({ editId }) => !editId)
        .map(({ id }) => id),
      businessUnit: Number(invoiceId),
    };
    const unitCashbox = {
      cashbox_ul: selectedUnitCashbox
        .filter(({ editId }) => !editId)
        .map(({ id }) => id),
      businessUnit: Number(invoiceId),
    };
    const unitPriceType = {
      priceType_ul: [...defaultPriceType, ...selectedUnitPriceType]
        .filter(({ editId }) => !editId)
        .map(({ priceTypeId }) => priceTypeId),
      businessUnit: Number(invoiceId),
    };
    if (selectedUnitUser?.filter(({ editId }) => !editId).length > 0) {
      createUnitUser({
        data: unitUser,
        onSuccessCallback: () => {
          if (
            selectedUnitStructure?.filter(({ editId }) => !editId).length ===
              0 &&
            [...defaultPriceType, ...selectedUnitPriceType]?.filter(
              ({ editId }) => !editId
            ).length === 0
          ) {
            setCreateCallBack(true);
          } else if (
            selectedUnitStructure?.filter(({ editId }) => !editId).length > 0 ||
            [...defaultPriceType, ...selectedUnitPriceType]?.filter(
              ({ editId }) => !editId
            ).length > 0 ||
            selectedUnitStock?.filter(({ editId }) => !editId).length > 0 ||
            selectedUnitCashbox?.filter(({ editId }) => !editId).length > 0
          ) {
            setCreateCallBack(false);
          }
        },
      });
    }
    if (selectedUnitStructure?.filter(({ editId }) => !editId).length > 0) {
      createUnitStructure({
        data: unitStructure,
        onSuccessCallback: () => {
          if (selectedUnitStock?.filter(({ editId }) => !editId).length > 0) {
            setCreateCallBack(false);
          } else {
            setCreateCallBack(true);
          }
        },
      });
    }
    if (selectedUnitStock?.length > 0) {
      if (selectedUnitStock?.filter(({ editId }) => !editId).length > 0) {
        createUnitStock({
          data: unitStock,
          onSuccessCallback: () => {
            selectedUnitStock.map(item => {
              if (
                item.transferStocks?.filter(({ editId }) => !editId).length > 0
              ) {
                createUnitStockTransfer({
                  data: {
                    stock: item.id,
                    stock_ul: item.transferStocks
                      ?.filter(({ editId }) => !editId)
                      .map(({ id }) => id),
                  },
                });
              }
            });
            if (
              selectedUnitCashbox?.filter(({ editId }) => !editId).length > 0
            ) {
              setCreateCallBack(false);
            } else {
              setCreateCallBack(true);
            }
          },
          onFailureCallback: error => {
            setCreateCallBack(false);
            const errorData = error?.error?.response?.data?.error?.errors;
            if (errorData?.key === 'stock_is_in_use') {
              setActiveTab('3');
              return toast.error(
                `${errorData.stockName} artıq istifadə edilib.`
              );
            }
          },
        });
      } else {
        selectedUnitStock.map(item => {
          if (item.transferStocks?.filter(({ editId }) => !editId).length > 0) {
            createUnitStockTransfer({
              data: {
                stock: item.id,
                stock_ul: item.transferStocks
                  ?.filter(({ editId }) => !editId)
                  .map(({ id }) => id),
              },
              onSuccessCallback: () => {
                if (
                  selectedUnitCashbox?.filter(({ editId }) => !editId).length >
                  0
                ) {
                  setCreateCallBack(false);
                } else {
                  setCreateCallBack(true);
                }
              },
            });
          }
        });
      }
    }
    if (selectedUnitCashbox?.length > 0) {
      if (selectedUnitCashbox?.filter(({ editId }) => !editId).length > 0) {
        createUnitCashbox({
          data: unitCashbox,
          onSuccessCallback: () => {
            selectedUnitCashbox.map(item => {
              if (
                item.transferCashboxes?.filter(({ editId }) => !editId).length >
                0
              ) {
                createUnitCashboxTransfer({
                  data: {
                    cashbox: item.id,
                    cashbox_ul: item.transferCashboxes
                      ?.filter(({ editId }) => !editId)
                      .map(({ id }) => id),
                  },
                });
              }
            });
            if (
              [...defaultPriceType, ...selectedUnitPriceType]?.filter(
                ({ editId }) => !editId
              ).length === 0
            ) {
              setCreateCallBack(true);
            } else if (
              [...defaultPriceType, ...selectedUnitPriceType]?.filter(
                ({ editId }) => !editId
              ).length > 0
            ) {
              setCreateCallBack(false);
            }
          },
          onFailureCallback: error => {
            setCreateCallBack(false);
            const errorData = error?.error?.response?.data?.error?.errors;
            if (errorData?.key === 'cashbox_is_in_use') {
              setActiveTab('4');
              return toast.error(
                `${errorData.cashboxName} artıq istifadə edilib.`
              );
            }
          },
        });
      } else {
        selectedUnitCashbox.map(item => {
          if (
            item.transferCashboxes?.filter(({ editId }) => !editId).length > 0
          ) {
            createUnitCashboxTransfer({
              data: {
                cashbox: item.id,
                cashbox_ul: item.transferCashboxes
                  ?.filter(({ editId }) => !editId)
                  .map(({ id }) => id),
              },
              onSuccessCallback: () => {
                if (
                  [...defaultPriceType, ...selectedUnitPriceType]?.filter(
                    ({ editId }) => !editId
                  ).length === 0
                ) {
                  setCreateCallBack(true);
                } else if (
                  [...defaultPriceType, ...selectedUnitPriceType]?.filter(
                    ({ editId }) => !editId
                  ).length > 0
                ) {
                  setCreateCallBack(false);
                }
              },
            });
          }
        });
      }
    }
    if (
      [...defaultPriceType, ...selectedUnitPriceType]?.filter(
        ({ editId }) => !editId
      ).length > 0
    ) {
      createUnitPriceType({
        data: unitPriceType,
        onSuccessCallback: () => {
          setCreateCallBack(true);
        },
      });
    }
    if (
      !selectedUnitUser?.filter(({ editId }) => !editId).length > 0 &&
      !selectedUnitStructure?.filter(({ editId }) => !editId).length > 0 &&
      ![...defaultPriceType, ...selectedUnitPriceType]?.filter(
        ({ editId }) => !editId
      ).length > 0 &&
      !selectedUnitStock?.filter(({ editId }) => !editId).length > 0 &&
      !selectedUnitCashbox?.filter(({ editId }) => !editId).length > 0
    ) {
      if (selectedUnitStock.length > 0) {
        selectedUnitStock.map(item => {
          if (
            item.transferStocks?.filter(({ editId }) => !editId).length === 0
          ) {
            setCreateCallBack(true);
          }
        });
      } else if (selectedUnitCashbox.length > 0) {
        selectedUnitCashbox.map(item => {
          if (
            item.transferCashboxes?.filter(({ editId }) => !editId).length === 0
          ) {
            setCreateCallBack(true);
          }
        });
      } else {
        setCreateCallBack(true);
      }
    }
  };
  useEffect(() => {
    if (
      createCallBack &&
      !createUnitStructureLoading &&
      !createUnitUserLoading &&
      !createUnitPriceTypeLoading &&
      !createUnitStockLoading &&
      !createUnitStockTransferLoading &&
      !createUnitCashboxLoading &&
      !createUnitCashboxTransferLoading
    ) {
      history.push({ pathname: '/business_unit/business_unit' });
      toast.success(messages.successText);
    }
  }, [
    createCallBack,
    createUnitStructureLoading,
    createUnitUserLoading,
    createUnitStockLoading,
    createUnitStockTransferLoading,
    createUnitCashboxLoading,
    createUnitCashboxTransferLoading,
    createUnitPriceTypeLoading,
  ]);
  // Form Submit (Finally trying to create BusinessUnit)
  const handleNewBusinessUnit = () => {
    validateFields((errors, values) => {
      if (!errors) {
        const { blockName } = values;
        let newBusinessUnit = {};
        newBusinessUnit = {
          name: blockName,
        };
        if (id) {
          editBusinessUnit({
            data: newBusinessUnit,
            id: Number(id),
            onSuccessCallback: () => {
              handleCreateDatas(id);
            },
            onFailureCallback: ({ error }) => {
              if (
                error?.response?.data?.error?.message ===
                'Row is already exists.'
              ) {
                setFields({
                  blockName: {
                    value: getFieldValue('blockName'),
                    errors: [
                      new Error('Qeyd edilmiş blok adı artıq mövcuddur'),
                    ],
                  },
                });
              }
            },
          });
        } else {
          createBusinessUnit({
            data: newBusinessUnit,
            onSuccessCallback: ({ data }) => {
              handleCreateDatas(data.id);
            },
            onFailureCallback: ({ error }) => {
              if (
                error?.response?.data?.error?.message ===
                'Row is already exists.'
              ) {
                setFields({
                  blockName: {
                    value: getFieldValue('blockName'),
                    errors: [
                      new Error('Qeyd edilmiş blok adı artıq mövcuddur'),
                    ],
                  },
                });
              }
            },
          });
        }
      }
    });
  };

  return (
    <ProWrapper>
      <div className={styles.newOperationContainer}>
        <Row>
          <Col span={17} offset={3}>
            <Form>
              <Link to={returnUrl} className={styles.returnBackButton}>
                <MdKeyboardArrowLeft size={24} style={{ marginRight: 4 }} />
                Blokların siyahısı
              </Link>
              <h3 className={styles.title}>
                {id ? 'Düzəliş et' : 'Yeni blok'}
              </h3>
              <div className={styles.parentBox}>
                <div className={styles.paper}>
                  <Spin spinning={isLoading}>
                    <span className={styles.newOperationTitle}>
                      Ümumi məlumat
                    </span>
                    <div className={styles.fieldsContainer}>
                      <div className={styles.field}>
                        <ProFormItem
                          label="Blok adı"
                          help={getFieldError('blockName')?.[0]}
                        >
                          {getFieldDecorator('blockName', {
                            rules: [
                              requiredRule,
                              minLengthRule,
                              shortTextMaxRule,
                            ],
                          })(<ProInput />)}
                        </ProFormItem>
                      </div>
                      <div className={styles.field}>
                        <ProFormItem
                          label="Blok növü"
                          help={getFieldError('blockType')?.[0]}
                        >
                          {getFieldDecorator('blockType', {
                            rules: [requiredRule],
                          })(
                            <ProSelect
                              disabled
                              data={[{ id: 0, name: 'Bölmə' }]}
                            />
                          )}
                        </ProFormItem>
                      </div>
                    </div>
                  </Spin>
                </div>
              </div>
              <Tabs
                className={styles.tabs}
                type="card"
                activeKey={activeTab}
                onTabClick={handleActiveTabChange}
              >
                <TabPane tab="İstifadəçilər" key="1" forceRender>
                  <Users id={id} />
                </TabPane>
                <TabPane tab="Bölmələr" key="2" forceRender>
                  <Structure id={id} />
                </TabPane>
                <TabPane tab="Anbarlar" key="3" forceRender>
                  <Stocks id={id} />
                </TabPane>
                <TabPane tab="Hesablar" key="4" forceRender>
                  <Cashbox id={id} />
                </TabPane>
                <TabPane tab="Qiymət tipi" key="5" forceRender>
                  <PriceType
                    id={id}
                    defaultPriceType={defaultPriceType}
                    setDefaultPriceType={setDefaultPriceType}
                  />
                </TabPane>
              </Tabs>
              <div className={styles.ActionButtons}>
                <Button
                  type="primary"
                  onClick={() => {
                    submit(() => {
                      handleNewBusinessUnit();
                    });
                  }}
                  loading={createUnitLoading} //  || editingInvoice
                  style={{ marginRight: '10px' }}
                >
                  Təsdiq et
                </Button>
                <Button
                  onClick={() => history.push('/business_unit/business_unit')}
                  style={{ marginLeft: '10px' }}
                >
                  Imtina et
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </ProWrapper>
  );
};

const mapStateToProps = state => ({
  businessUnits: state.businessUnitReducer.businessUnits,
  selectedUnitUser: state.businessUnitReducer.selectedUnitUser,
  selectedUnitStructure: state.businessUnitReducer.selectedUnitStructure,
  createUnitLoading: state.loadings.createBusinessUnit,
  selectedUnitStock: state.businessUnitReducer.selectedUnitStock,
  selectedUnitCashbox: state.businessUnitReducer.selectedUnitCashbox,
  selectedUnitPriceType: state.businessUnitReducer.selectedUnitPriceType,
  createUnitStructureLoading: state.businessUnitReducer.createUnitStructure,
  createUnitUserLoading: state.businessUnitReducer.createUnitUser,
  createUnitStockLoading: state.businessUnitReducer.createUnitStock,
  createUnitStockTransferLoading:
    state.businessUnitReducer.createUnitStockTransfer,
  createUnitCashboxLoading: state.businessUnitReducer.createUnitCashbox,
  createUnitCashboxTransferLoading:
    state.businessUnitReducer.createUnitCashboxTransfer,
  createUnitPriceTypeLoading: state.businessUnitReducer.createUnitPriceType,

  isLoading: state.businessUnitReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    fetchBusinessUnitList,
    createBusinessUnit,
    editBusinessUnit,
    createUnitStructure,
    createUnitUser,
    createUnitStock,
    createUnitStockTransfer,
    createUnitCashbox,
    createUnitCashboxTransfer,
    createUnitPriceType,
    fetchUnitUser,
    fetchUnitStructure,
    fetchUnitStock,
    fetchUnitCashbox,
    fetchUnitPriceType,
    setSelectedUnitStock,
    setSelectedUnitUser,
    setSelectedUnitStructure,
    setSelectedUnitCashbox,
    setSelectedUnitPriceType,

    handleResetFields,
  }
)(
  Form.create({
    name: 'GeneralInfoForm',
  })(AddBusinessUnit)
);
